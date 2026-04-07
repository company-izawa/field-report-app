'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || ((session.user as any).role !== 'manager' && (session.user as any).role !== 'admin')) {
    throw new Error('管理者権限がありません')
  }
}

export async function adminGetSites() {
  await checkAdmin()
  return await prisma.site.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function adminAddSite(data: { siteName: string; clientName: string }) {
  await checkAdmin()

  await prisma.site.create({
    data: {
      siteName: data.siteName,
      clientName: data.clientName,
      status: 'active',
    }
  })

  revalidatePath('/admin/sites')
  revalidatePath('/sites')
}

export async function adminUpdateSite(id: string, data: { siteName?: string; clientName?: string; status?: string }) {
  await checkAdmin()

  await prisma.site.update({
    where: { id },
    data
  })

  revalidatePath('/admin/sites')
  revalidatePath('/sites')
}
