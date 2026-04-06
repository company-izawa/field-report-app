import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Common password for all seeded users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // --- Categories ---
  const categoriesData = [
    { code: 'daily', name: '日報', sortOrder: 1 },
    { code: 'question', name: '質問', sortOrder: 2 },
    { code: 'trouble', name: 'トラブル', sortOrder: 3 },
    { code: 'extra_work', name: '追加工事', sortOrder: 4 },
  ]

  const categories = []
  for (const cat of categoriesData) {
    const created = await prisma.reportCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    })
    categories.push(created)
  }

  // --- Users ---
  const usersData = [
    { email: 'nagura@example.com', name: '名倉 武志', role: 'worker', password: hashedPassword },
    { email: 'yamada@example.com', name: '山田 太郎', role: 'worker', password: hashedPassword },
    { email: 'sato@example.com', name: '佐藤 次郎', role: 'worker', password: hashedPassword },
    { email: 'tanaka@example.com', name: '田中 鈴木', role: 'manager', password: hashedPassword },
    { email: 'ito@example.com', name: '伊藤 花子', role: 'worker', password: hashedPassword },
    { email: 'watanabe@example.com', name: '渡辺 健太', role: 'worker', password: hashedPassword },
    { email: 'kobayashi@example.com', name: '小林 将太', role: 'worker', password: hashedPassword },
    { email: 'nakamura@example.com', name: '中村 結衣', role: 'admin', password: hashedPassword },
    { email: 'suzuki@example.com', name: '鈴木 一郎', role: 'worker', password: hashedPassword },
    { email: 'takahashi@example.com', name: '高橋 まゆみ', role: 'manager', password: hashedPassword },
  ]

  const users = []
  for (const u of usersData) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword },
      create: u,
    })
    users.push(created)
  }

  // --- Sites ---
  const sitesData = [
    { siteName: '四日市第一プラント', clientName: '株式会社A' },
    { siteName: '川崎製油所改修工事', clientName: 'Bエンジニアリング' },
    { siteName: '水島コンビナート配管修繕', clientName: 'C工業' },
    { siteName: '鹿島プラント増設', clientName: 'D建設' },
    { siteName: '千葉工場タンク点検', clientName: '株式会社E', status: 'closed' },
  ]

  const sites = []
  for (const s of sitesData) {
    const created = await prisma.site.upsert({
      where: { id: `site-${s.siteName}` }, // Not actually primary, but we'll use a hack or just clear db during seed
      // For idempotency we should just use `findFirst` then `create` since no unique constraint on name
      update: {},
      create: s,
    }).catch(async () => {
      let existing = await prisma.site.findFirst({ where: { siteName: s.siteName }})
      if (!existing) {
        existing = await prisma.site.create({ data: s })
      }
      return existing
    })
    sites.push(created)
  }

  // Clear existing reports if we want fresh seeds, but we can just leave them
  // if they exist to avoid duplicate issues on 'reportNo'. Let's just create some if none.
  const existingReports = await prisma.report.count()
  if (existingReports === 0) {
    // --- Reports ---
    const mockDescriptions = [
      '配管Aから微量の液漏れを確認しました。至急確認をお願いします。',
      '本日の配管溶接作業は予定通り完了しました。明日は検査から入ります。',
      '顧客より、追加でCラインのバルブ交換を依頼されました。見積が必要です。',
      'ポンプBの異音を確認。部品交換が必要かもしれません。',
      '安全パトロール実施。指摘事項なし。'
    ]

    for (let i = 0; i < 20; i++) {
      const site = sites[i % sites.length]
      const user = users[i % users.length]
      const category = categories[i % categories.length]
      
      const date = new Date()
      date.setDate(date.getDate() - (i % 5))
      date.setHours(date.getHours() - (i % 8))

      await prisma.report.create({
        data: {
          reportNo: `REP-${20260400 + i}`,
          userId: user?.id || users[0].id,
          siteId: site?.id || sites[0].id,
          categoryId: category.id,
          title: `${category.name}報告 - ${site?.siteName}`,
          transcriptText: mockDescriptions[i % mockDescriptions.length],
          memoText: i % 3 === 0 ? '手書きメモあり' : null,
          reportedAt: date,
          status: i % 4 === 0 ? 'checked' : 'unchecked',
          isImportant: i % 7 === 0,
          requiresEstimate: category.code === 'extra_work',
          hasAudio: i % 2 === 0,
          hasImage: i % 3 === 0,
          hasVideo: i % 5 === 0,
        }
      })
    }
  }

  console.log('Seed data inserted successfully (Passwords hashed with default "password123").')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
