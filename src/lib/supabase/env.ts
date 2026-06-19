interface SupabasePublicEnv {
  url: string
  publishableKey: string
}

const SUPABASE_URL_VARIABLE = 'NEXT_PUBLIC_SUPABASE_URL'
const SUPABASE_PUBLISHABLE_KEY_VARIABLE = 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
const SUPABASE_LEGACY_ANON_KEY_VARIABLE = 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getSupabasePublishableKey(): string {
  const publishableKey = process.env[SUPABASE_PUBLISHABLE_KEY_VARIABLE]

  if (publishableKey) {
    return publishableKey
  }

  return getRequiredEnv(SUPABASE_LEGACY_ANON_KEY_VARIABLE)
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: getRequiredEnv(SUPABASE_URL_VARIABLE),
    publishableKey: getSupabasePublishableKey()
  }
}
