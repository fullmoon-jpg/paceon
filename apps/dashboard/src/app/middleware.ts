// middleware.ts - SINGLE SOURCE OF TRUTH untuk auth routing
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ✅ SINKRONISASI: Public routes
  const publicRoutes = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/resetpassword',
    '/auth/callback',  // ⭐ Ditambahkan
    '/auth/success',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // ✅ Skip middleware untuk auth callback (biar Supabase handle)
  if (pathname === '/auth/callback') {
    return response
  }

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = [
    '/',
    '/booking',
    '/activityfeed',
    '/notifications',
    '/profilepage',
    '/settings',
    '/affirmation-cube',
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // ✅ REDIRECT LOGIC - Single source of truth
  
  // 1. Tidak ada session + protected route → login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    console.log('[Middleware] No session, redirecting to login')
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Ada session + public route (kecuali callback) → dashboard
  if (session && isPublicRoute && pathname !== '/auth/callback') {
    console.log('[Middleware] Already logged in, redirecting to dashboard')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 3. Admin check
  const isAdminRoute = pathname.startsWith('/admin')
  if (session && isAdminRoute) {
    try {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        console.log('[Middleware] Not admin, redirecting')
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('[Middleware] Admin check error:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}