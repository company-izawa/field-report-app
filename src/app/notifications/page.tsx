"use client";

import { notifications } from '@/data/mock';
import { AlertCircle, HelpCircle, Wrench, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsList() {
  const [notifs, setNotifs] = useState(notifications);

  const getIcon = (type: string) => {
    switch(type) {
      case 'trouble': return <AlertCircle className="text-red-500" size={20} />;
      case 'extra_work': return <Wrench className="text-purple-500" size={20} />;
      case 'question': return <HelpCircle className="text-amber-500" size={20} />;
      case 'send_error': return <AlertTriangle className="text-orange-500" size={20} />;
      default: return <AlertCircle className="text-slate-400" size={20} />;
    }
  };

  const markAllAsRead = () => {
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">通知</h1>
          <p className="text-sm text-slate-500 mt-1">トラブルや重要事項のお知らせ</p>
        </div>
        <button onClick={markAllAsRead} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          すべて既読にする
        </button>
      </header>

      <div className="space-y-3">
        {notifs.map(notif => (
          <div key={notif.id} className={`p-4 rounded-xl border flex gap-3 transition-colors cursor-pointer ${notif.isRead ? 'bg-white border-slate-200 opacity-70' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
             <div className="pt-0.5">
               {getIcon(notif.type)}
             </div>
             <div className="flex-1">
               <h3 className={`text-sm mb-1 line-clamp-2 ${notif.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                 {notif.title}
               </h3>
               <p className="text-xs text-slate-500">
                 {new Date(notif.date).toLocaleString('ja-JP')}
               </p>
             </div>
             {!notif.isRead && (
               <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
