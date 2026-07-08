import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const dbUrl = "postgresql://neondb_owner:npg_MwU4lO1NBfbX@ep-empty-river-aetok3ec-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

// Vercel上の古いDB接続先（例えばsupabaseなど）を検知して強制的に最新のNeon DBに切り替える
const getDatabaseUrl = () => {
  const current = process.env.DATABASE_URL;
  if (!current || !current.includes('aetok3ec')) {
    return dbUrl;
  }
  return current;
};

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
