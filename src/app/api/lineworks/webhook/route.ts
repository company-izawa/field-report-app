import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTextMessage } from '@/lib/lineworks';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-works-signature');
    const botId = req.headers.get('x-works-botid');
    
    // LINE WORKS側での署名検証（本番環境では必須ですが、今回は簡易的にスキップまたはログのみとします）
    // const hash = crypto.createHmac('sha256', process.env.LINEWORKS_BOT_SECRET).update(rawBody).digest('base64');
    // if (signature !== hash) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const body = JSON.parse(rawBody);

    // LINE WORKS webhook payload usually has an array of events or a single event depending on configuration
    // But API 2.0 Webhook usually sends a single JSON object.
    const type = body.type;
    const userId = body.source?.userId;

    if (!userId) {
      return NextResponse.json({ success: true });
    }

    // 1. Postback（ボタン押下）の処理
    if (type === 'postback') {
      const data = body.postback?.data;
      if (data) {
        const params = new URLSearchParams(data);
        const action = params.get('action');
        const reportId = params.get('reportId');

        if (action === 'check' && reportId) {
          // レポートのステータスを更新
          const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: { status: 'checked' },
            include: { user: true }
          });

          // 上司（操作者）に完了通知を返す
          await sendTextMessage(userId, '報告を確認済みにしました。');

          // 報告者へ通知を送る（報告者のLINE WORKS IDが登録されている場合）
          if (updatedReport.user.lineWorksUserId) {
            await sendTextMessage(
              updatedReport.user.lineWorksUserId,
              `上司があなたの報告（${updatedReport.reportNo}）を確認しました。`
            );
          }
        }
      }
    }

    // 2. Message（テキスト返信）の処理
    if (type === 'message' && body.message?.type === 'text') {
      const text = body.message.text;

      // LINE WORKSのWebhookからは「どのメッセージに対する返信か」の文脈を直接得るのが難しいため、
      // 簡易的に「最新の報告」に対するコメントとして処理します。
      const latestReport = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });

      if (latestReport) {
        // CommentをDBに保存
        // ※上司のuserIdを取得するために、lineWorksUserIdからUserを検索するか、簡易的にSystemとして保存します。
        // ここでは、一番権限が強いユーザー（管理者）等のダミーIDまたは、該当ユーザーを探します。
        let commenter = await prisma.user.findFirst({
          where: { lineWorksUserId: userId }
        });

        // 登録されていなければ、フォールバックとして最初のユーザーを割り当てる（デモ用）
        if (!commenter) {
          commenter = await prisma.user.findFirst();
        }

        if (commenter) {
          await prisma.comment.create({
            data: {
              reportId: latestReport.id,
              userId: commenter.id,
              text: text,
            }
          });

          // 上司（操作者）に完了通知を返す
          await sendTextMessage(userId, `最新の報告（${latestReport.reportNo}）にコメントを記録しました。`);

          // 報告者へ通知を送る
          if (latestReport.user.lineWorksUserId) {
            await sendTextMessage(
              latestReport.user.lineWorksUserId,
              `あなたの報告（${latestReport.reportNo}）に上司からコメントが届きました:\n\n${text}`
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
