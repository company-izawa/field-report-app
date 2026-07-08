import { getNotifications } from '@/actions/notificationActions';
import NotificationsListClient from './NotificationsListClient';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  
  // クライアントコンポーネントへ渡すため、日付オブジェクトを文字列にシリアライズします
  const serializedNotifications = notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString()
  }));

  return <NotificationsListClient initialNotifications={serializedNotifications} />;
}
