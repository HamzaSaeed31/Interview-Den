import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createSupabaseBrowserClient } from "@/lib/supabase"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => req.cookies.get(key)?.value,
          set: (key, value, options) => {
            res.cookies.set({ name: key, value, ...options })
          },
          remove: (key, options) => {
            res.cookies.set({ name: key, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Allow access to landing page, login, and signup without authentication
    const publicPaths = ['/', '/login', '/signup']
    if (!session && !publicPaths.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Redirect authenticated users from public pages to their dashboard
    if (session && ['/', '/login', '/signup'].includes(req.nextUrl.pathname)) {
      const userType = session.user.user_metadata.user_type
      return NextResponse.redirect(new URL(`/${userType}/dashboard`, req.url))
    }

    if (session) {
      const userType = session.user.user_metadata.user_type
      const path = req.nextUrl.pathname
      if (
        (userType === 'candidate' && path.startsWith('/company')) ||
        (userType === 'company' && path.startsWith('/candidate'))
      ) {
        return NextResponse.redirect(new URL(`/${userType}/dashboard`, req.url))
      }
    }

    return res
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 