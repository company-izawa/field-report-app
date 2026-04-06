import { drafts } from '@/data/mock';
import Link from 'next/link';
import { PenSquare, Clock, Trash2 } from 'lucide-react';

export default function DraftsList() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">下書き一覧</h1>
        <p className="text-sm text-slate-500 mt-1">保存中の報告を再開できます</p>
      </header>

      <div className="space-y-3">
        {drafts.length > 0 ? drafts.map(draft => (
          <div key={draft.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                {draft.category}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock size={12} />
                {new Date(draft.savedAt).toLocaleString('ja-JP')}保存
              </span>
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1">{draft.siteName}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">{draft.summary}</p>
            
            <div className="flex gap-2">
              <Link href="/reports/new" className="flex-1 text-center bg-primary-50 text-primary-700 font-semibold py-2 rounded-lg text-sm hover:bg-primary-100 transition-colors flex items-center justify-center gap-1">
                <PenSquare size={16} /> 再編集
              </Link>
              <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
             <p className="text-slate-500 text-sm font-medium">下書きはありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
