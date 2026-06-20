interface SupabasePublicEnv {
  url: string
  publishableKey: string
}

function getRequiredEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getSupabasePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (publishableKey) {
    return publishableKey
  }

  return getRequiredEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: getRequiredEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: getSupabasePublishableKey()
  }
}
