"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit, Share2, CheckCircle2, XCircle, Mic, Image as ImageIcon, Video, Play } from 'lucide-react';
import { CategoryBadge, StatusBadge } from '@/components/Badges';
import { updateReportStatus } from '@/actions/reportActions';

export default function ReportDetailClient({ report }: { report: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleStatus = () => {
    startTransition(async () => {
      const nextStatus = report.status === 'checked' ? 'unchecked' : 'checked';
      await updateReportStatus(report.id, nextStatus);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> 戻る
        </button>
        <div className="flex gap-2">
           <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
             <Edit size={20} />
           </button>
           <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
             <Share2 size={20} />
           </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Meta Info */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={report.category} />
            <StatusBadge isChecked={report.status === 'checked'} />
            {report.isImportant && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                重要
              </span>
            )}
            {report.requiresEstimate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                見積対応必要
              </span>
            )}
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{report.siteName}</h1>
            <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
              <span>報告者: {report.userName}</span>
              <span>報告日時: {new Date(report.reportedAt).toLocaleString('ja-JP')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 text-slate-800 leading-relaxed">
          {report.hasAudio && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 transition">
                 <Play size={18} className="ml-1" />
              </button>
              <div className="flex-1">
                <div className="h-1.5 w-full bg-slate-300 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-1/3"></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-medium">
                  <span>0:00</span>
                  <span>1:24</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Mic size={16} /> 音声文字起こし
            </h3>
            <p className="bg-slate-50 p-4 rounded-xl text-[15px]">{report.transcriptText}</p>
          </div>

          {report.memoText && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-2">追記メモ</h3>
              <p className="text-[15px]">{report.memoText}</p>
            </div>
          )}

          {report.tags && report.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {report.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Attachments Dummy */}
        {(report.hasImage || report.hasVideo) && (
          <div className="p-5 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-1.5">
               <ImageIcon size={16} /> 添付ファイル
             </h3>
             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                 {report.hasImage && (
                    <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                      <ImageIcon size={32} />
                    </div>
                 )}
                 {report.hasVideo && (
                    <div className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center text-white relative">
                      <Video size={32} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg">
                        <Play size={24} className="opacity-80" />
                      </div>
                    </div>
                 )}
             </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 md:sticky md:bg-transparent md:border-0 md:p-0 z-40">
        <button 
          onClick={toggleStatus}
          disabled={isPending}
          className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors ${
            report.status === 'checked' 
              ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' 
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {report.status === 'checked' ? (
            <><XCircle size={20} /> 未確認に戻す</>
          ) : (
            <><CheckCircle2 size={20} /> 確認済みにする</>
          )}
        </button>
      </div>
    </div>
  );
}
