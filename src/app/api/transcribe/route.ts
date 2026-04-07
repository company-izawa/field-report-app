import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from 'openai';
import { File } from 'buffer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. 認証チェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. FormDataの取得
    const formData = await req.formData();
    const file = formData.get('file') as globalThis.File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 3. OpenAI Whisperに送信
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'ja',
      // temperature: 0 等の設定も可能ですがデフォルトで高精度です
    });

    // 4. 結果を返す
    return NextResponse.json({ text: transcription.text });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error?.message },
      { status: 500 }
    );
  }
}
