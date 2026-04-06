import { User, Site, Report, Notification, Draft } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: '名倉 武志',
  role: 'worker',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: '山田 太郎', role: 'worker' },
  { id: 'u3', name: '佐藤 次郎', role: 'worker' },
  { id: 'u4', name: '田中 鈴木', role: 'manager' },
];

export const sites: Site[] = [
  {
    id: 's1',
    name: '四日市第一プラント',
    status: 'active',
    updatedAt: '2026-04-06T10:00:00',
    totalReports: 120,
    unreadCount: 3,
    troubleCount: 1,
    extraWorkCount: 2,
  },
  {
    id: 's2',
    name: '川崎製油所改修工事',
    status: 'active',
    updatedAt: '2026-04-05T15:30:00',
    totalReports: 45,
    unreadCount: 0,
    troubleCount: 0,
    extraWorkCount: 1,
  },
  {
    id: 's3',
    name: '水島コンビナート配管修繕',
    status: 'active',
    updatedAt: '2026-04-04T09:12:00',
    totalReports: 80,
    unreadCount: 5,
    troubleCount: 2,
    extraWorkCount: 0,
  },
  {
    id: 's4',
    name: '鹿島プラント増設',
    status: 'active',
    updatedAt: '2026-04-06T08:00:00',
    totalReports: 210,
    unreadCount: 1,
    troubleCount: 0,
    extraWorkCount: 5,
  },
  {
    id: 's5',
    name: '千葉工場タンク点検',
    status: 'closed',
    updatedAt: '2026-03-20T17:00:00',
    totalReports: 30,
    unreadCount: 0,
    troubleCount: 0,
    extraWorkCount: 0,
  },
];

export const reports: Report[] = [
  {
    id: 'r1',
    siteId: 's1',
    userId: 'u1',
    category: 'trouble',
    transcriptText: '配管Aから微量の液漏れを確認しました。至急確認をお願いします。',
    memoText: 'バルブ付近からの漏れと思われます。',
    reportedAt: '2026-04-06T09:15:00',
    status: 'unchecked',
    isImportant: true,
    requiresEstimate: false,
    hasAudio: true,
    hasImage: true,
    hasVideo: true,
    tags: ['液漏れ', '緊急'],
  },
  {
    id: 'r2',
    siteId: 's1',
    userId: 'u2',
    category: 'daily',
    transcriptText: '本日の配管溶接作業は予定通り完了しました。明日は検査から入ります。',
    memoText: '',
    reportedAt: '2026-04-05T17:00:00',
    status: 'checked',
    isImportant: false,
    requiresEstimate: false,
    hasAudio: true,
    hasImage: false,
    hasVideo: false,
    tags: ['溶接', '進捗'],
  },
  {
    id: 'r3',
    siteId: 's3',
    userId: 'u3',
    category: 'extra_work',
    transcriptText: '顧客より、追加でCラインのバルブ交換を依頼されました。見積が必要です。',
    memoText: '図面は別途送付済み。',
    reportedAt: '2026-04-04T13:45:00',
    status: 'unchecked',
    isImportant: true,
    requiresEstimate: true,
    hasAudio: true,
    hasImage: true,
    hasVideo: false,
    tags: ['バルブ交換', '追加工事'],
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'trouble',
    title: '【トラブル】四日市第一プラントで液漏れ発生',
    date: '2026-04-06T09:15:00',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'extra_work',
    title: '【追加工事】水島コンビナート配管修繕にて追加依頼',
    date: '2026-04-04T13:45:00',
    isRead: true,
  },
];

export const drafts: Draft[] = [
  {
    id: 'd1',
    siteName: '川崎製油所改修工事',
    category: '質問',
    summary: '資材の搬入経路について...',
    savedAt: '2026-04-06T10:05:00',
  },
];
