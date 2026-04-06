import { getSitesWithStats } from '@/actions/reportActions';
import Link from 'next/link';
import { ChevronRight, AlertCircle, Wrench } from 'lucide-react';

export default async function SitesList() {
  const sites = await getSitesWithStats();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">現場フォルダ一覧</h1>
        <p className="text-sm text-slate-500 mt-1">現場ごとの報告を確認できます</p>
      </header>

      <div className="space-y-3">
        {sites.map((site: any) => (
          <Link href={`/sites/${site.id}`} key={site.id} className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {site.status === 'closed' && (
              <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">完工</div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center pr-10">
                {site.name}
              </h2>
              <ChevronRight className="text-slate-400 group-hover:text-primary-500 transition-colors" size={20} />
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="bg-slate-50 border border-slate-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                <span className="text-slate-500 text-xs font-semibold">総件数</span>
                <span className="font-bold text-slate-800">{site.totalReports}</span>
              </div>
              
              {site.unreadCount > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                  <span className="text-blue-600 text-xs font-semibold">未確認</span>
                  <span className="font-bold text-blue-700">{site.unreadCount}</span>
                </div>
              )}
              
              {site.troubleCount > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="font-bold text-red-700">{site.troubleCount}</span>
                </div>
              )}
              
              {site.extraWorkCount > 0 && (
                <div className="bg-purple-50 border border-purple-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                  <Wrench size={14} className="text-purple-500" />
                  <span className="font-bold text-purple-700">{site.extraWorkCount}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-[10px] text-slate-400 font-medium">
              最終更新: {new Date(site.updatedAt).toLocaleDateString('ja-JP')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
