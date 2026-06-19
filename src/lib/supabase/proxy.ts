import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { User } from '@supabase/supabase-js'

import { getSupabasePublicEnv } from './env'

interface SessionResult {
  response: NextResponse
  user: User | null
}

export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let supabaseResponse = NextResponse.next({
    request
  })
  const { url, publishableKey } = getSupabasePublicEnv()

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({
          request
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value)
        })
      }
    }
  })

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make users appear randomly logged out.
  await supabase.auth.getClaims()

  // After getClaims refreshes the token, get the user for route protection.
  const { data: userData } = await supabase.auth.getUser()

  return {
    response: supabaseResponse,
    user: userData.user
  }
}
