import Link from 'next/link';
import { Report } from '@/types';
import { CategoryBadge, StatusBadge } from './Badges';
import { Paperclip, Mic, Image as ImageIcon, Video, AlertTriangle, CircleDollarSign } from 'lucide-react';

export const ReportCard = ({ report, siteName, userName }: { report: Report; siteName: string; userName: string }) => {
  const dateStr = new Date(report.reportedAt).toLocaleString('ja-JP', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Link href={`/reports/${report.id}`} className="block relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 w-full">
      {report.isImportant && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-sm" title="重要フラグ">
          <AlertTriangle size={14} className="fill-current" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={report.category} />
          <StatusBadge isChecked={report.status === 'checked'} />
          {report.requiresEstimate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
              <CircleDollarSign size={10} /> 見積対応
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed">
          {report.transcriptText || report.memoText || '（内容なし）'}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{siteName}</span>
          <span>{userName}</span>
        </div>
        
        <div className="flex gap-1.5 text-slate-400">
          {report.hasAudio && <Mic size={14} />}
          {report.hasImage && <ImageIcon size={14} />}
          {report.hasVideo && <Video size={14} />}
        </div>
      </div>
    </Link>
  );
};
