import { ReportCategory } from '@/types';
import { AlertCircle, FileText, Wrench, HelpCircle } from 'lucide-react';

export const CategoryBadge = ({ category }: { category: ReportCategory }) => {
  switch (category) {
    case 'trouble':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle size={12} /> クレーム・トラブル
        </span>
      );
    case 'extra_work':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
          <Wrench size={12} /> 追加変更工事
        </span>
      );
    case 'question':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
          <HelpCircle size={12} /> 質問
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
          <FileText size={12} /> 日例報告
        </span>
      );
  }
};

export const StatusBadge = ({ isChecked }: { isChecked: boolean }) => {
  if (isChecked) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
        確認済
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wide">
      未確認
    </span>
  );
};
