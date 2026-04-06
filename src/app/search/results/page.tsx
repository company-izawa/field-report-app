import { getReports } from '@/actions/reportActions';
import { ReportCard } from '@/components/ReportCard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function SearchResults({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : undefined;
  const siteId = typeof searchParams.siteId === 'string' ? searchParams.siteId : undefined;
  const categoryId = typeof searchParams.categoryId === 'string' ? searchParams.categoryId : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const results = await getReports({ keyword, siteId, categoryId, status });

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-4">
        <Link href="/search" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> 検索条件を変更
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">検索結果</h1>
        <p className="text-sm text-slate-500">{results.length}件の報告が見つかりました</p>
      </header>

      <div className="space-y-3">
        {results.map(report => (
          <ReportCard 
            key={report.id} 
            report={report as any} 
            siteName={report.siteName} 
            userName={report.userName}
          />
        ))}
      </div>
    </div>
  );
}
