"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenSquare, FolderOpen, Search, Bell, FileText, LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';

type NavType = {
  type: 'desktop' | 'mobile';
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function Navigation({ type, user }: NavType) {
  const pathname = usePathname();

  const navItems = [
    { label: 'ホーム', href: '/', icon: Home },
    { label: '報告作成', href: '/reports/new', icon: PenSquare },
    { label: '現場', href: '/sites', icon: FolderOpen },
    { label: '検索', href: '/search', icon: Search },
  ];

  const subItems = [
    { label: '通知', href: '/notifications', icon: Bell },
    { label: '下書き', href: '/drafts', icon: FileText },
  ];

  if (type === 'mobile') {
    return (
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                 <div className="absolute top-0 w-8 h-1 bg-primary-600 rounded-b-md" />
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop
  return (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">現場業務報告</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-8 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            その他
          </p>
        </div>

        {subItems.map((item) => {
          const isActive = pathname === item.href;
          return (
             <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          )
        })}

        {(user?.role === 'manager' || user?.role === 'admin') && (
          <>
            <div className="pt-8 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                管理者専用
              </p>
            </div>
            <Link
              href="/admin/users"
              className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                pathname.startsWith('/admin')
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings size={20} className="mr-3" />
              管理者設定
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4 pb-2">
        <div className="px-4 mb-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.[0] || '名'}
          </div>
          <div className="ml-3 overflow-hidden">
             <p className="text-sm font-medium text-slate-700 truncate">{user?.name || 'ゲスト'}</p>
             <p className="text-xs text-slate-500 truncate">{user?.role === 'admin' ? '管理者' : user?.role === 'manager' ? 'マネージャー' : '作業員'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          ログアウト
        </button>
      </div>
    </div>
  );
}
