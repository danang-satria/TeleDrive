import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "supersecretkey123" })
  
  const { pathname } = req.nextUrl
  
  // Public paths
  if (
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/login') ||
    pathname.startsWith('/share') ||
    pathname.startsWith('/api/share') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
