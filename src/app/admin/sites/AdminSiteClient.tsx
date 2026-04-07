"use client";

import { useState, useTransition } from "react";
import { FolderOpen, Plus, Edit2, Archive, CheckCircle2 } from "lucide-react";
import { adminAddSite, adminUpdateSite } from "@/actions/adminSiteActions";

export default function AdminSiteClient({ initialSites }: { initialSites: any[] }) {
  const [sites, setSites] = useState(initialSites);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  
  const [formData, setFormData] = useState({ siteName: '', clientName: '' });

  const handleOpenModal = (site?: any) => {
    if (site) {
      setEditingSite(site);
      setFormData({ siteName: site.siteName, clientName: site.clientName });
    } else {
      setEditingSite(null);
      setFormData({ siteName: '', clientName: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingSite) {
          await adminUpdateSite(editingSite.id, formData);
        } else {
          await adminAddSite(formData);
        }
        setIsModalOpen(false);
        // Page reload to fetch sites again
        window.location.reload();
      } catch (error) {
        alert("エラーが発生しました: " + (error as Error).message);
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    if (!confirm(currentStatus === 'active' ? 'この現場を完工（終了）状態にしますか？' : 'この現場を再度稼働（アクティブ）状態にしますか？')) return;
    
    startTransition(async () => {
      await adminUpdateSite(id, { status: nextStatus });
      window.location.reload();
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">登録現場（プロジェクト）一覧</h2>
          <p className="text-xs text-slate-500 mt-1">全 {sites.length} 件のデータ</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-bold rounded-lg transition shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> 新規現場追加
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">現場名</th>
              <th className="px-6 py-4">顧客名</th>
              <th className="px-6 py-4">ステータス</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-primary-500 flex items-center justify-center shrink-0">
                      <FolderOpen size={18} />
                    </div>
                    <div className="font-bold text-slate-800">{site.siteName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {site.clientName}
                </td>
                <td className="px-6 py-4">
                  {site.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-100 text-green-700">稼働中</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">完工</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(site)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="編集">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleToggleStatus(site.id, site.status)} className={`p-2 rounded-lg transition text-slate-400 hover:bg-slate-100 ${site.status === 'active' ? 'hover:text-amber-600' : 'hover:text-green-600'}`} title={site.status === 'active' ? '完工（アーカイブ）にする' : '稼働中に戻す'}>
                      {site.status === 'active' ? <Archive size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingSite ? '現場情報の編集' : '新規現場の登録'}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">現場（プロジェクト）名</label>
                <input required type="text" value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none placeholder:text-slate-300" placeholder="例: 〇〇第2ビル 空調設備点検" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">顧客名</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none placeholder:text-slate-300" placeholder="例: 株式会社〇〇" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50">キャンセル</button>
                <button type="submit" disabled={isPending} className="flex-1 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                  {isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
