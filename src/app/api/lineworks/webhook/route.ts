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

    // Webhook受信のログをデータベース（最新のレポートのコメント欄）に強制記録します
    try {
      const latestReport = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      const systemUser = await prisma.user.findFirst();
      if (latestReport && systemUser) {
        await prisma.comment.create({
          data: {
            reportId: latestReport.id,
            userId: systemUser.id,
            text: `[Webhook受信デバッグ] Type: ${type}, User: ${userId}, Body: ${rawBody.substring(0, 300)}`
          }
        });
      }
    } catch (dbErr) {
      console.error('Failed to write debug log to DB:', dbErr);
    }

    if (!userId) {
      return NextResponse.json({ success: true });
    }

    // 1. Postback（ボタン押下）の処理
    if (type === 'postback') {
      const data = body.data;
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
    
    // エラー内容をデータベースに書き込んで見える化します
    try {
      const latestReport = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      const systemUser = await prisma.user.findFirst();
      if (latestReport && systemUser) {
        await prisma.comment.create({
          data: {
            reportId: latestReport.id,
            userId: systemUser.id,
            text: `[Webhookエラーデバッグ] Error: ${(error as Error).message}\nStack: ${(error as Error).stack?.substring(0, 300)}`
          }
        });
      }
    } catch (dbErr) {
      console.error('Failed to write debug error to DB:', dbErr);
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
