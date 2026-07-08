'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) {
    throw new Error("認証エラー: ログインしていません")
  }
  return session!.user as any
}

/**
 * ログインユーザーの通知一覧を取得する
 */
export async function getNotifications() {
  try {
    const user = await getSessionUser()
    return await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  } catch (err) {
    console.error("Failed to get notifications:", err)
    return []
  }
}

/**
 * 特定の通知を既読にする
 */
export async function markAsRead(id: string) {
  try {
    const user = await getSessionUser()
    
    // 自身の通知のみ既読にできるセキュリティ制限
    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true }
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch (err) {
    console.error("Failed to mark notification as read:", err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * すべての通知を既読にする
 */
export async function markAllAsRead() {
  try {
    const user = await getSessionUser()

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err)
    return { success: false, error: (err as Error).message }
  }
}

/**
 * 通知を作成する (内部システム用・自動作成用)
 */
export async function createNotification(data: { userId: string; type: string; title: string }) {
  try {
    const created = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        isRead: false
      }
    })
    
    revalidatePath('/notifications')
    return created
  } catch (err) {
    console.error("Failed to create notification:", err)
    return null
  }
}
