import { NextResponse, type NextRequest } from 'next/server'

import { syncCurrentUserProfile } from '@/features/auth/services/profile-sync-service'
import { getRoleRedirectPath } from '@/features/auth/utils/role-redirect'
import { createClient } from '@/lib/supabase/server'

const AUTH_ERROR_QUERY_VALUE = 'auth_failed'

interface CallbackRouteContext {
  params: Promise<{ locale: string }>
}

function createRedirectUrl(request: NextRequest, locale: string, path: string): URL {
  return new URL(`/${locale}${path}`, request.url)
}

function createAuthErrorUrl(request: NextRequest, locale: string): URL {
  const redirectUrl = createRedirectUrl(request, locale, '/login')
  redirectUrl.searchParams.set('error', AUTH_ERROR_QUERY_VALUE)

  return redirectUrl
}

export async function GET(request: NextRequest, context: CallbackRouteContext): Promise<NextResponse> {
  const { locale } = await context.params
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  const supabase = await createClient()

  if (code) {
    // OAuth or email confirmation: exchange the code for a session.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(createAuthErrorUrl(request, locale))
    }
  } else {
    // Password login: session is already established by signInWithPassword.
    // Verify the session exists before proceeding to profile sync.
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return NextResponse.redirect(createAuthErrorUrl(request, locale))
    }
  }

  const profileSyncResult = await syncCurrentUserProfile()

  if (!profileSyncResult.success) {
    if (profileSyncResult.errorCode === 'ACCOUNT_DISABLED') {
      return NextResponse.redirect(createRedirectUrl(request, locale, '/account-inactive'))
    }

    return NextResponse.redirect(createAuthErrorUrl(request, locale))
  }

  const roleRedirectPath = getRoleRedirectPath(profileSyncResult.profile.role)

  return NextResponse.redirect(createRedirectUrl(request, locale, roleRedirectPath))
}
