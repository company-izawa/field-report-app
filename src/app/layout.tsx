import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "現場業務報告",
  description: "現場からの業務報告アプリケーション",
};

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex h-screen overflow-hidden">
          {/* PC向けサイドバー */}
          {session?.user && (
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-10 shadow-sm">
              <Navigation type="desktop" user={session.user as any} />
            </div>
          )}

          {/* メインコンテンツ */}
          <main className={`flex-1 w-full overflow-y-auto h-full ${session?.user ? 'md:pl-64 pb-16 md:pb-0' : ''}`}>
            <div className={session?.user ? "max-w-4xl mx-auto p-4 md:p-8" : "w-full"}>
              {children}
            </div>
          </main>

          {/* スマホ向けボトムナビゲーション */}
          {session?.user && (
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50">
              <Navigation type="mobile" user={session.user as any} />
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
