import { getSites, getCategories } from '@/actions/reportActions';
import ReportForm from './ReportForm';

export default async function ReportNewPage() {
  const sites = await getSites();
  const categories = await getCategories();

  return <ReportForm sites={sites} categories={categories} />;
}
