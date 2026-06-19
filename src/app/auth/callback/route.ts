import { NextResponse, type NextRequest } from 'next/server'

import { syncCurrentUserProfile } from '@/features/auth/services/profile-sync-service'
import { getRoleRedirectPath } from '@/features/auth/utils/role-redirect'
import { createClient } from '@/lib/supabase/server'

const AUTH_ERROR_QUERY_VALUE = 'auth_failed'
const LOGIN_PATH = '/login'
const ACCOUNT_INACTIVE_PATH = '/account-inactive'

function createRedirectUrl(request: NextRequest, path: string): URL {
  return new URL(path, request.url)
}

function createAuthErrorUrl(request: NextRequest): URL {
  const redirectUrl = createRedirectUrl(request, LOGIN_PATH)
  redirectUrl.searchParams.set('error', AUTH_ERROR_QUERY_VALUE)

  return redirectUrl
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(createAuthErrorUrl(request))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(createAuthErrorUrl(request))
  }

  const profileSyncResult = await syncCurrentUserProfile()

  if (!profileSyncResult.success) {
    if (profileSyncResult.errorCode === 'ACCOUNT_DISABLED') {
      return NextResponse.redirect(createRedirectUrl(request, ACCOUNT_INACTIVE_PATH))
    }

    return NextResponse.redirect(createAuthErrorUrl(request))
  }

  const roleRedirectPath = getRoleRedirectPath(profileSyncResult.profile.role)

  return NextResponse.redirect(createRedirectUrl(request, roleRedirectPath))
}
