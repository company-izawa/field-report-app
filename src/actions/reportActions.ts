'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// ====== 現場 (Sites) ======
export async function getSites() {
  return await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reports: {
        select: { status: true, category: { select: { code: true } } }
      }
    }
  })
}

export async function getSiteById(id: string) {
  return await prisma.site.findUnique({
    where: { id }
  })
}

export async function getSitesWithStats() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reports: {
        select: { status: true, category: { select: { code: true } } }
      }
    }
  })

  // ダミーデータで使っていたカウント類を計算して返す
  return sites.map((site: any) => {
    const totalReports = site.reports.length
    const unreadCount = site.reports.filter((r: any) => r.status === 'unchecked').length
    const troubleCount = site.reports.filter((r: any) => r.category.code === 'trouble').length
    const extraWorkCount = site.reports.filter((r: any) => r.category.code === 'extra_work').length

    return {
      id: site.id,
      name: site.siteName,
      clientName: site.clientName,
      status: site.status as 'active' | 'closed',
      updatedAt: site.updatedAt.toISOString(),
      totalReports,
      unreadCount,
      troubleCount,
      extraWorkCount
    }
  })
}

// ====== カテゴリ (Categories) ======
export async function getCategories() {
  return await prisma.reportCategory.findMany({
    orderBy: { sortOrder: 'asc' }
  })
}

// ====== 報告 (Reports) ======
export async function getReports(filters?: {
  siteId?: string
  categoryId?: string
  userId?: string
  status?: string
  keyword?: string
}) {
  const where: any = {}

  if (filters?.siteId) where.siteId = filters.siteId
  if (filters?.categoryId) where.categoryId = filters.categoryId
  if (filters?.userId) where.userId = filters.userId
  if (filters?.status) where.status = filters.status
  if (filters?.keyword) {
    where.OR = [
      { title: { contains: filters.keyword } },
      { transcriptText: { contains: filters.keyword } },
      { memoText: { contains: filters.keyword } },
    ]
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { reportedAt: 'desc' },
    include: {
      site: true,
      user: true,
      category: true,
    }
  })

  return reports.map((r: any) => ({
    id: r.id,
    reportNo: r.reportNo,
    siteId: r.siteId,
    siteName: r.site.siteName,
    userId: r.userId,
    userName: r.user.name,
    category: r.category.code as any, // mapping for backwards compatibility
    categoryName: r.category.name,
    title: r.title,
    transcriptText: r.transcriptText || '',
    memoText: r.memoText || '',
    reportedAt: r.reportedAt.toISOString(),
    status: r.status as 'checked' | 'unchecked',
    isImportant: r.isImportant,
    requiresEstimate: r.requiresEstimate,
    hasAudio: r.hasAudio,
    hasImage: r.hasImage,
    hasVideo: r.hasVideo,
  }))
}

export async function getReportById(id: string) {
  const r = await prisma.report.findUnique({
    where: { id },
    include: {
      site: true,
      user: true,
      category: true,
    }
  })

  if (!r) return null

  return {
    id: r.id,
    reportNo: r.reportNo,
    siteId: r.siteId,
    siteName: r.site.siteName,
    userId: r.userId,
    userName: r.user.name,
    category: r.category.code as any,
    categoryName: r.category.name,
    title: r.title,
    transcriptText: r.transcriptText || '',
    memoText: r.memoText || '',
    reportedAt: r.reportedAt.toISOString(),
    status: r.status as 'checked' | 'unchecked',
    isImportant: r.isImportant,
    requiresEstimate: r.requiresEstimate,
    hasAudio: r.hasAudio,
    hasImage: r.hasImage,
    hasVideo: r.hasVideo,
    tags: r.isImportant ? ['重要'] : [], // Dummy implementation for now, tags require a relation table
  }
}

export async function createReport(data: any) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error("認証エラー: ログインしていません")

  // Getting existing count for random ID / ReportNo (In real app, sequence should be used)
  const count = await prisma.report.count()
  
  const created = await prisma.report.create({
    data: {
      reportNo: `REP-NEW-${count + 1}`,
      userId: (session!.user as any).id as string,
      siteId: data.siteId,
      categoryId: data.categoryId,
      title: data.title || '無題の報告',
      transcriptText: data.transcriptText,
      memoText: data.memoText,
      reportedAt: new Date(),
      status: 'unchecked',
      isImportant: data.isImportant || false,
      requiresEstimate: data.requiresEstimate || false,
      // For now ignore files implementation
      hasAudio: false,
      hasImage: false,
      hasVideo: false,
    }
  })

  revalidatePath('/reports')
  revalidatePath('/')
  
  return created.id
}

export async function updateReportStatus(id: string, status: 'checked' | 'unchecked') {
  await prisma.report.update({
    where: { id },
    data: { status }
  })
  
  revalidatePath(`/reports/${id}`)
  revalidatePath('/reports')
  revalidatePath('/search')
  revalidatePath('/')
}

// ====== ユーザー (Users) ======
export async function getUsers() {
  return await prisma.user.findMany()
}
