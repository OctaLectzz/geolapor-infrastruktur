import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/proxy'

const handleI18nRouting = createMiddleware(routing)

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const intlResponse = handleI18nRouting(request)
  const supabaseResponse = await updateSession(request)

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie)
  })

  return intlResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
