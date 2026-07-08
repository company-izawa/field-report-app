'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || ((session.user as any).role !== 'manager' && (session.user as any).role !== 'admin')) {
    throw new Error('管理者権限がありません')
  }
}

export async function adminGetUsers() {
  await checkAdmin()
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function adminAddUser(data: { name: string; email: string; password?: string; role: string; lineWorksUserId?: string }) {
  await checkAdmin()
  
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'worker',
      isActive: true,
      lineWorksUserId: data.lineWorksUserId || null,
    }
  })

  revalidatePath('/admin/users')
}

export async function adminUpdateUser(id: string, data: { name?: string; email?: string; password?: string; role?: string; isActive?: boolean; lineWorksUserId?: string }) {
  await checkAdmin()

  const updateData: any = { ...data }
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  } else {
    delete updateData.password // パスワードが未入力（空文字）の場合は更新対象から除外する
  }
  
  if (data.lineWorksUserId !== undefined) {
    updateData.lineWorksUserId = data.lineWorksUserId || null
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/admin/users')
}

export async function adminToggleUserStatus(id: string, isActive: boolean) {
  await checkAdmin()

  await prisma.user.update({
    where: { id },
    data: { isActive }
  })

  revalidatePath('/admin/users')
}
