import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

import { getSupabasePublicEnv } from './env'

/**
 * Create a Supabase client with the service role key for privileged
 * server-side operations such as storage uploads.
 *
 * IMPORTANT: This client bypasses Row Level Security. Use it only in
 * server-side code (Route Handlers, Server Actions) and never expose
 * the service role key to the browser.
 */
export function createAdminClient(): SupabaseClient {
  const { url } = getSupabasePublicEnv()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
