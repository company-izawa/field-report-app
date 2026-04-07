"use client";

import { useState, useTransition } from "react";
import { User, Shield, UserCog, Plus, Search, Edit2, Play, Pause } from "lucide-react";
import { adminAddUser, adminUpdateUser, adminToggleUserStatus } from "@/actions/adminUserActions";

export default function AdminUserClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'worker' });

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'worker' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingUser) {
          await adminUpdateUser(editingUser.id, formData);
        } else {
          await adminAddUser(formData);
        }
        setIsModalOpen(false);
        // Page reload to fetch users again
        window.location.reload();
      } catch (error) {
        alert("エラーが発生しました: " + (error as Error).message);
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? 'このユーザーを停止状態にしますか？' : 'このユーザーを有効にしますか？')) return;
    
    startTransition(async () => {
      await adminToggleUserStatus(id, !currentStatus);
      window.location.reload();
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">登録ユーザー一覧</h2>
          <p className="text-xs text-slate-500 mt-1">全 {users.length} 名のアカウント</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-bold rounded-lg transition shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> 新規登録
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">名前 / メールアドレス</th>
              <th className="px-6 py-4">権限</th>
              <th className="px-6 py-4">状態</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'admin' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700"><Shield size={14} /> 管理者</span>}
                  {user.role === 'manager' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700"><UserCog size={14} /> マネージャー</span>}
                  {user.role === 'worker' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700"><User size={14} /> 作業員</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {user.isActive ? '有効' : '停止中'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="編集">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`p-2 rounded-lg transition ${user.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`} title={user.isActive ? '停止する' : '有効化する'}>
                      {user.isActive ? <Pause size={16} /> : <Play size={16} />}
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
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? 'ユーザー情報の編集' : '新規ユーザー登録'}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">氏名</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス（ログインID）</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">パスワード {editingUser && <span className="text-xs text-orange-500 font-normal">※変更する場合のみ入力</span>}</label>
                <input required={!editingUser} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none placeholder:text-slate-300" placeholder="最低6文字推奨" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">権限</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="worker">作業員（一般）</option>
                  <option value="manager">マネージャー（現場管理・ユーザー管理）</option>
                </select>
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
