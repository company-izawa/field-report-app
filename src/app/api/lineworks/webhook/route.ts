import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTextMessage } from '@/lib/lineworks';

export async function POST(req: NextRequest) {
  let rawBody = '';
  try {
    rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const type = body.type;
    const userId = body.source?.userId;

    if (!userId) {
      return NextResponse.json({ success: true });
    }

    // LINE WORKS 2.0 の仕様に合わせ、ポストバックデータの位置を抽出します
    // (body.data もしくは body.content.postback)
    const postbackData = body.data || body.content?.postback;

    // 1. Postback（ボタン押下）の処理
    if (type === 'postback' || postbackData) {
      if (postbackData) {
        const params = new URLSearchParams(postbackData);
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
          
          return NextResponse.json({ success: true });
        }
      }
    }

    // 2. Message（テキスト返信）の処理 (LINE WORKS 2.0 仕様: body.content.type === 'text')
    if (type === 'message' && body.content?.type === 'text') {
      const text = body.content.text;

      // 「確認済みにする」というテキストメッセージそのものが送られてきた場合の緊急フォールバック
      if (text === '確認済みにする') {
        const latestReport = await prisma.report.findFirst({
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        });
        if (latestReport && latestReport.status !== 'checked') {
          await prisma.report.update({
            where: { id: latestReport.id },
            data: { status: 'checked' }
          });
          await sendTextMessage(userId, '報告を確認済みにしました。');
          return NextResponse.json({ success: true });
        }
      }

      const latestReport = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });

      if (latestReport) {
        let commenter = await prisma.user.findFirst({
          where: { lineWorksUserId: userId }
        });

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
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: (error as Error).message,
    }, { status: 500 });
  }
}
