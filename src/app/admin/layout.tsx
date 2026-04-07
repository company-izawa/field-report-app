import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || ((session.user as any).role !== 'manager' && (session.user as any).role !== 'admin')) {
    redirect('/')
  }

  return (
    <div className="max-w-4xl mx-auto pb-8 space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者設定</h1>
      </header>

      {/* Tabs navigation - simplified for CSS target styling */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <Link href="/admin/users" className="px-2 font-bold text-slate-600 hover:text-primary-600">
          従業員管理
        </Link>
        <Link href="/admin/sites" className="px-2 font-bold text-slate-600 hover:text-primary-600">
          現場管理
        </Link>
      </div>

      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
