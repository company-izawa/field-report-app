export type User = {
  id: string;
  name: string;
  role: 'worker' | 'manager' | 'admin';
};

export type Site = {
  id: string;
  name: string;
  status: 'active' | 'closed';
  updatedAt: string;
  totalReports: number;
  unreadCount: number;
  troubleCount: number;
  extraWorkCount: number;
};

export type ReportCategory = 'daily' | 'question' | 'trouble' | 'extra_work';

export type Report = {
  id: string;
  siteId: string;
  userId: string;
  category: ReportCategory;
  transcriptText: string;
  memoText: string;
  reportedAt: string;
  status: 'checked' | 'unchecked';
  isImportant: boolean;
  requiresEstimate: boolean;
  hasAudio: boolean;
  hasImage: boolean;
  hasVideo: boolean;
  tags: string[];
};

export type Notification = {
  id: string;
  type: 'trouble' | 'question' | 'extra_work' | 'send_error';
  title: string;
  date: string;
  isRead: boolean;
};

export type Draft = {
  id: string;
  siteName: string;
  category: string;
  summary: string;
  savedAt: string;
};
