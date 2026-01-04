// middleware.ts (UPDATED - Better error handling)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check if service role key exists
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  }

  // Create service role client for profile checks (bypasses RLS)
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // If there's an auth error, log it for debugging
  if (authError) {
    console.error('Middleware auth error:', authError)
  }

  const path = request.nextUrl.pathname

  // ============================================
  // PROTECT /admin ROUTES (EXCEPT /admin/login)
  // ============================================
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile lookup error in middleware:', profileError)
      }

      if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Middleware error checking admin status:', error)
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'Authentication check failed')
      return NextResponse.redirect(url)
    }

    return response
  }

  // ============================================
  // REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
  // ============================================
  if (user && (path === '/login' || path === '/register' || path === '/admin/login')) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const url = request.nextUrl.clone()
      
      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        url.pathname = '/admin/dashboard'
      } else {
        url.pathname = '/dashboard'
      }
      
      return NextResponse.redirect(url)
    } catch (error) {
      console.error('Middleware error redirecting logged-in user:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}