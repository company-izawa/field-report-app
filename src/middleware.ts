import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // 保護したいルートを指定。以下はログインページ、API、静的ファイル以外をすべて保護する例
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes used by next-auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
