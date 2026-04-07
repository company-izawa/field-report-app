"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Image as ImageIcon, Video, AlertTriangle, CircleDollarSign, Send, Save, X } from 'lucide-react';
import { createReport } from '@/actions/reportActions';
import { upload } from '@vercel/blob/client';

export default function ReportForm({ sites, categories }: { sites: any[], categories: any[] }) {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [siteId, setSiteId] = useState(sites.length > 0 ? sites[0].id : '');
  const [categoryId, setCategoryId] = useState(categories.length > 0 ? categories[0].id : '');
  const [isImportant, setIsImportant] = useState(false);
  const [requiresEstimate, setRequiresEstimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      if (type === 'image') {
        setImageUrls(prev => [...prev, newBlob.url]);
      } else {
        setVideoUrls(prev => [...prev, newBlob.url]);
      }
    } catch (error) {
      console.error(error);
      alert('ファイルのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const fileExtension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('webm') ? 'webm' : 'ogg';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        setIsTranscribing(true);

        const formData = new FormData();
        formData.append('file', audioBlob, `audio.${fileExtension}`);

        try {
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          setTranscript(prev => prev ? prev + '\n' + data.text : data.text);
        } catch (error) {
          console.error(error);
          alert('文字起こしに失敗しました。');
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert('マイクへのアクセスが拒否されました。ブラウザの設定をご確認ください。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || !categoryId || (!transcript && transcript.trim() === '')) return;
    
    setIsSubmitting(true);
    try {
      await createReport({
        siteId,
        categoryId,
        transcriptText: transcript,
        isImportant,
        requiresEstimate,
        imageUrls,
        videoUrls,
      });
      alert('報告を保存しました');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('報告の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">新規報告作成</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 現場・カテゴリ選択 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">現場名 <span className="text-red-500">*</span></label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-slate-50" 
              required
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="">現場を選択してください</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.siteName}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">報告カテゴリ <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 transition-colors">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.id} 
                    checked={categoryId === cat.id}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500" 
                    required 
                  />
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 音声入力・内容 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-700">音声で報告</label>
            {isRecording && <span className="flex items-center text-xs font-bold text-red-500 animate-pulse"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>録音中...</span>}
            {isTranscribing && <span className="flex items-center text-xs font-bold text-blue-600 animate-pulse">文字起こし中...</span>}
          </div>
          
          <div className="text-center">
            <button 
              type="button" 
              onClick={handleRecord}
              disabled={isTranscribing}
              className={`p-6 rounded-full inline-flex items-center justify-center transition-all shadow-md ${isRecording ? 'bg-red-50 shadow-white outline outline-4 outline-red-200' : isTranscribing ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'}`}
            >
              <Mic size={32} className={isRecording ? 'text-red-600 animate-pulse' : ''} />
            </button>
            <p className="mt-2 text-xs text-slate-500 font-medium">
              {isRecording ? 'もう一度押して録音停止' : isTranscribing ? 'AIが処理しています...' : 'ボタンを押して話す'}
            </p>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">文字起こし結果 / 本文 <span className="text-red-500">*</span></label>
             <textarea 
               value={transcript}
               onChange={(e) => setTranscript(e.target.value)}
               className="w-full border border-slate-300 rounded-lg p-3 h-32 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
               placeholder="音声入力の結果がここに入ります。キーボードでの直接入力も可能です。"
               required
             />
          </div>
        </div>

            {/* 添付ファイル */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-700">添付ファイル</label>
            {isUploading && <span className="text-xs font-bold text-blue-600 animate-pulse">アップロード中...</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} />
             <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={(e) => handleFileUpload(e, 'video')} />
             
             <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-500">
               <ImageIcon size={24} className="mb-2" />
               <span className="text-sm font-medium">写真を追加</span>
             </button>
             <button type="button" onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-500">
               <Video size={24} className="mb-2" />
               <span className="text-sm font-medium">動画を追加</span>
             </button>
          </div>

          {/* プレビュー領域 */}
          {(imageUrls.length > 0 || videoUrls.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={url} alt="attached" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {videoUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <video src={url} className="object-cover w-full h-full opacity-70" />
                  <button type="button" onClick={() => setVideoUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 z-10">
                    <X size={12} />
                  </button>
                  <Video size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 付加情報 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ハッシュタグ</label>
            <input type="text" className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="例: #資材不足 #安全確認" />
          </div>
          
          <div className="pt-2 flex flex-col gap-3">
            <label className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                <span className="font-bold text-red-900 text-sm">重要として報告する</span>
              </div>
              <input 
                type="checkbox" 
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500" 
              />
            </label>
            
            <label className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="text-green-600" size={20} />
                <span className="font-bold text-green-900 text-sm">見積対応が必要</span>
              </div>
              <input 
                type="checkbox" 
                checked={requiresEstimate}
                onChange={(e) => setRequiresEstimate(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500" 
              />
            </label>
          </div>
        </div>

        {/* アクション */}
        <div className="flex gap-3 pt-2">
          <button type="button" className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm">
            <Save size={18} /> 下書き保存
          </button>
          <button type="submit" disabled={isSubmitting || isUploading} className={`flex-[2] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm ${(isSubmitting || isUploading) ? 'bg-slate-400' : 'bg-primary-600 hover:bg-primary-700'}`}>
            <Send size={18} /> {isSubmitting ? '送信中...' : isUploading ? 'アップロード中...' : '報告を送信'}
          </button>
        </div>
      </form>
    </div>
  );
}
