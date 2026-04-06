import { drafts, notifications } from '@/data/mock';
import { getReports } from '@/actions/reportActions';
import { ReportCard } from '@/components/ReportCard';
import Link from 'next/link';
import { AlertCircle, Clock, FileText, Activity } from 'lucide-react';

export default async function Home() {
  const reports = await getReports();

  const unreadCount = reports.filter(r => r.status === 'unchecked').length;
  const troubleCount = reports.filter(r => r.category === 'trouble').length;
  const extraWorkCount = reports.filter(r => r.category === 'extra_work').length;
  const todayCount = reports.length; // Simplified for MVP

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ホーム</h1>
        <p className="text-sm text-slate-500 mt-1">本日の報告状況サマリー</p>
      </header>

      {/* 目立たせるダッシュボード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/search/results?status=unchecked" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-blue-300 hover:shadow-md">
          <span className="text-3xl font-black text-blue-600 mb-1">{unreadCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase">未確認</span>
        </Link>
        <Link href="/search/results?categoryId=trouble" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-red-300 hover:shadow-md">
          <span className="text-3xl font-black text-red-600 mb-1">{troubleCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase">トラブル</span>
        </Link>
        <Link href="/search/results?categoryId=extra_work" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-purple-300 hover:shadow-md">
          <span className="text-3xl font-black text-purple-600 mb-1">{extraWorkCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase">追加工事</span>
        </Link>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-slate-800 mb-1">{todayCount}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase">本日の報告</span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Link href="/reports/new" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <FileText size={18} />
          新規報告を作成
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 重要・最新の報告 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-red-500" size={20} /> 最新の重要報告
            </h2>
            <Link href="/search" className="text-sm font-medium text-primary-600 hover:underline">すべて見る</Link>
          </div>
          <div className="space-y-3">
            {reports.filter(r => r.isImportant).slice(0, 3).map((report) => (
              <ReportCard 
                key={report.id} 
                report={report as any} 
                siteName={report.siteName} 
                userName={report.userName}
              />
            ))}
            {reports.filter(r => r.isImportant).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4 bg-white rounded-xl border border-slate-200">重要報告はありません</p>
            )}
          </div>
        </div>

        {/* 下書きと通知 */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
             <div className="flex items-center justify-between mb-3">
               <h2 className="font-bold flex items-center gap-2">
                 <Clock className="text-amber-500" size={18} /> 下書き ({drafts.length})
               </h2>
               <Link href="/drafts" className="text-sm font-medium text-primary-600 hover:underline">一覧</Link>
             </div>
             {drafts.map(d => (
                <Link href="#" key={d.id} className="block text-sm py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-2 -mx-2">
                  <div className="font-medium text-slate-800">{d.siteName}</div>
                  <div className="text-xs text-slate-500 truncate">{d.summary}</div>
                </Link>
             ))}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
             <div className="flex items-center justify-between mb-3">
               <h2 className="font-bold flex items-center gap-2">
                 <AlertCircle className="text-blue-500" size={18} /> 未読の通知 ({notifications.filter(n => !n.isRead).length})
               </h2>
               <Link href="/notifications" className="text-sm font-medium text-primary-600 hover:underline">一覧</Link>
             </div>
             {notifications.filter(n => !n.isRead).map(n => (
                <Link href="/notifications" key={n.id} className="block text-sm py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-2 -mx-2">
                  <div className="font-medium text-slate-800 line-clamp-1">{n.title}</div>
                  <div className="text-xs text-slate-500">{new Date(n.date).toLocaleString('ja-JP')}</div>
                </Link>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
