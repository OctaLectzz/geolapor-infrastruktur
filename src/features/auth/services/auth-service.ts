'use client'

import type { AuthError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

interface AuthServiceResult {
  error: AuthError | null
}

function getAuthCallbackUrl(locale: string): string {
  return new URL(`/${locale}/auth/callback`, window.location.origin).toString()
}

export async function signInWithGoogle(locale: string): Promise<AuthServiceResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl(locale)
    }
  })

  return { error }
}

export async function logout(): Promise<AuthServiceResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  return { error }
}
