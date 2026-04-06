import { getSites, getCategories } from '@/actions/reportActions';
import { Search as SearchIcon } from 'lucide-react';

export default async function SearchPage() {
  const sites = await getSites();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">検索</h1>
      </header>

      <form action="/search/results" method="GET" className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">キーワード</label>
          <div className="relative">
            <input 
              type="text" 
              name="keyword"
              className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
              placeholder="報告内容やタグで検索" 
            />
            <SearchIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">現場で絞り込む</label>
          <select name="siteId" className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white">
            <option value="">すべての現場</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.siteName}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">カテゴリ</label>
           <div className="grid grid-cols-2 gap-2">
             <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 transition-colors">
               <input type="radio" name="categoryId" value="" className="text-primary-600 focus:ring-primary-500" defaultChecked />
               <span className="text-sm font-medium text-slate-700">すべて</span>
             </label>
             {categories.map(cat => (
               <label key={cat.id} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 transition-colors">
                 <input type="radio" name="categoryId" value={cat.id} className="text-primary-600 focus:ring-primary-500" />
                 <span className="text-sm font-medium text-slate-700">{cat.name}</span>
               </label>
             ))}
           </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">ステータス・フラグ</label>
           <div className="space-y-3">
             <label className="flex items-center gap-3">
               <input type="checkbox" name="status" value="unchecked" className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
               <span className="text-sm font-medium text-slate-700">未確認の報告のみ</span>
             </label>
           </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 shadow-sm transition-colors">
            <SearchIcon size={18} />
            この条件で検索する
          </button>
        </div>
      </form>
    </div>
  );
}
