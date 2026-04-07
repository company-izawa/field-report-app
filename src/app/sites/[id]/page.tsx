import { getSiteById, getReports } from '@/actions/reportActions';
import { ReportCard } from '@/components/ReportCard';
import Link from 'next/link';
import { ChevronLeft, Filter } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function SiteDetail({ params, searchParams }: { params: { id: string }, searchParams: { filter?: string } }) {
  const filter = searchParams.filter || 'all';
  
  const site = await getSiteById(params.id);
  if (!site) return notFound();

  let reports = await getReports({ siteId: site.id });
  
  if (filter === 'unchecked') {
    reports = reports.filter(r => r.status === 'unchecked');
  } else if (filter === 'trouble') {
    reports = reports.filter(r => r.category === 'trouble');
  } else if (filter === 'extra_work') {
    reports = reports.filter(r => r.category === 'extra_work');
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <Link href="/sites" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> 現場一覧へ戻る
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{site.siteName}</h1>
      </header>

      {/* フィルタ */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto hide-scrollbar">
        <Filter size={16} className="text-slate-400 shrink-0 ml-1 mr-2" />
        <Link 
          href={`/sites/${site.id}?filter=all`}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          すべて
        </Link>
        <Link 
          href={`/sites/${site.id}?filter=unchecked`}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'unchecked' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
        >
          未確認
        </Link>
        <Link 
          href={`/sites/${site.id}?filter=trouble`}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'trouble' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
        >
          トラブル
        </Link>
        <Link 
           href={`/sites/${site.id}?filter=extra_work`}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === 'extra_work' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
        >
          追加工事
        </Link>
      </div>

      <div className="space-y-3">
        {reports.length > 0 ? (
          reports.map((report: any) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              siteName={site.siteName} 
              userName={report.userName}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm font-medium">条件に一致する報告はありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
