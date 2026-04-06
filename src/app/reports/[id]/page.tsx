import { getReportById } from '@/actions/reportActions';
import { notFound } from 'next/navigation';
import ReportDetailClient from './ReportDetailClient';

export default async function ReportDetail({ params }: { params: { id: string } }) {
  const report = await getReportById(params.id);
  if (!report) return notFound();

  return <ReportDetailClient report={report} />;
}
