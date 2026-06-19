import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getSupabasePublicEnv } from './env'

export function createClient(): SupabaseClient {
  const { url, publishableKey } = getSupabasePublicEnv()

  return createBrowserClient(url, publishableKey)
}
