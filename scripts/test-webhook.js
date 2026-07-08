const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMockWebhookTests() {
  try {
    // 1. 最新のレポートを取得する
    const latestReport = await prisma.report.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    if (!latestReport) {
      console.log('No report found in DB to test.');
      return;
    }

    console.log(`Testing with report: ${latestReport.reportNo} (Current Status: ${latestReport.status})`);

    // 2. 「確認済みにする」ポストバックの Webhook ペイロードを模倣
    console.log('\n--- 1. Testing "Checked" Postback Webhook ---');
    const postbackPayload = {
      type: 'postback',
      source: {
        userId: 'iz.24161@izawaironworks', // 管理者のLINE WORKS ID
        domainId: 40029600
      },
      issuedTime: new Date().toISOString(),
      data: `action=check&reportId=${latestReport.id}`
    };

    let response = await fetch('http://localhost:3000/api/lineworks/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-works-botid': '12270440',
        'x-works-signature': 'dummy'
      },
      body: JSON.stringify(postbackPayload)
    });

    console.log('Response Status:', response.status);
    const resultJson = await response.json();
    console.log('Response Body:', resultJson);

    // データベース上のステータスを確認
    let checkReport = await prisma.report.findUnique({
      where: { id: latestReport.id }
    });
    console.log('Updated Report Status in DB:', checkReport.status);

    // 3. 「コメント返信」の Webhook ペイロードを模倣
    console.log('\n--- 2. Testing "Comment" Message Webhook ---');
    const commentPayload = {
      type: 'message',
      source: {
        userId: 'iz.24161@izawaironworks',
        domainId: 40029600
      },
      issuedTime: new Date().toISOString(),
      message: {
        type: 'text',
        text: 'ローカルテスト：コンプレッサーの更新工事、お疲れ様でした！'
      }
    };

    response = await fetch('http://localhost:3000/api/lineworks/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-works-botid': '12270440',
        'x-works-signature': 'dummy'
      },
      body: JSON.stringify(commentPayload)
    });

    console.log('Response Status:', response.status);
    const commentResultJson = await response.json();
    console.log('Response Body:', commentResultJson);

    // データベース上にコメントが保存されたか確認
    const comments = await prisma.comment.findMany({
      where: { reportId: latestReport.id },
      include: { user: true }
    });
    console.log(`\nComments in DB for this report (Total: ${comments.length}):`);
    comments.forEach(c => {
      console.log(`- [${c.user.name}]: ${c.text}`);
    });

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runMockWebhookTests();
