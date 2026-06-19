'use client'

import type { AuthError } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

interface AuthServiceResult {
  error: AuthError | null
}

function getAuthCallbackUrl(): string {
  return new URL('/auth/callback', window.location.origin).toString()
}

export async function signInWithGoogle(): Promise<AuthServiceResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl()
    }
  })

  return { error }
}
