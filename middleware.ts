import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/')
    return NextResponse.redirect(new URL('/links', req.url))
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}