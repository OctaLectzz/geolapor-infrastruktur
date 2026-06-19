import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import type { User } from '@supabase/supabase-js'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'

const handleI18nRouting = createMiddleware(routing)

const LOGIN_PATH = '/login'

/**
 * Public path prefixes that do not require authentication.
 * Paths are checked after stripping the locale prefix.
 */
const PUBLIC_PATHS: readonly string[] = [
  '/',
  '/map',
  '/reports',
  '/about',
  '/help',
  '/login',
  '/register',
  '/forgot-password',
  '/auth/callback',
  '/account-inactive'
]

/**
 * Protected path prefixes and the roles that can access them.
 * Order matters: more specific prefixes must come before general ones.
 * Roles are checked from `app_metadata.role` set during profile sync.
 *
 * SUPERADMIN inherits all ADMIN access.
 * ADMIN inherits all authenticated access.
 * OFFICER has its own section.
 * USER has dashboard access only.
 */
interface RouteRule {
  prefix: string
  allowedRoles: readonly string[]
}

const SUPERADMIN_ONLY_PATHS: readonly RouteRule[] = [
  { prefix: '/admin/users', allowedRoles: ['SUPERADMIN'] },
  { prefix: '/admin/regions', allowedRoles: ['SUPERADMIN'] },
  { prefix: '/admin/agencies', allowedRoles: ['SUPERADMIN'] },
  { prefix: '/admin/audit-logs', allowedRoles: ['SUPERADMIN'] }
]

const PROTECTED_ROUTES: readonly RouteRule[] = [
  ...SUPERADMIN_ONLY_PATHS,
  { prefix: '/admin', allowedRoles: ['ADMIN', 'SUPERADMIN'] },
  { prefix: '/officer', allowedRoles: ['OFFICER', 'ADMIN', 'SUPERADMIN'] },
  { prefix: '/dashboard', allowedRoles: ['USER', 'OFFICER', 'ADMIN', 'SUPERADMIN'] }
]

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`

    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || '/'
    }
  }

  return pathname
}

function isPublicPath(cleanPath: string): boolean {
  if (cleanPath === '/') {
    return true
  }

  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === '/') {
      return false
    }

    return cleanPath === publicPath || cleanPath.startsWith(`${publicPath}/`)
  })
}

function getUserRole(user: User): string | null {
  const appMetadata = user.app_metadata as Record<string, unknown> | undefined

  if (!appMetadata) {
    return null
  }

  const role = appMetadata['role']

  if (typeof role === 'string' && role.length > 0) {
    return role
  }

  return null
}

function findMatchingRouteRule(cleanPath: string): RouteRule | null {
  for (const rule of PROTECTED_ROUTES) {
    if (cleanPath === rule.prefix || cleanPath.startsWith(`${rule.prefix}/`)) {
      return rule
    }
  }

  return null
}

function createLoginRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.searchParams.set('next', request.nextUrl.pathname)

  return NextResponse.redirect(url)
}

function createForbiddenRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.delete('next')

  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response: supabaseResponse, user } = await updateSession(request)
  const intlResponse = handleI18nRouting(request)

  // Merge Supabase auth cookies into the i18n response.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie)
  })

  const cleanPath = stripLocalePrefix(request.nextUrl.pathname)

  // Allow public paths through without auth checks.
  if (isPublicPath(cleanPath)) {
    return intlResponse
  }

  // Protected path: require authentication.
  if (!user) {
    const loginRedirect = createLoginRedirect(request)

    // Carry over Supabase cookies even on redirects.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      loginRedirect.cookies.set(cookie)
    })

    return loginRedirect
  }

  // Check role-based access.
  const rule = findMatchingRouteRule(cleanPath)

  if (rule) {
    const role = getUserRole(user)

    if (!role || !rule.allowedRoles.includes(role)) {
      const forbiddenRedirect = createForbiddenRedirect(request)

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        forbiddenRedirect.cookies.set(cookie)
      })

      return forbiddenRedirect
    }
  }

  return intlResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
