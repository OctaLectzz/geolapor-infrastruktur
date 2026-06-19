import 'server-only'

import type { UserProfile } from '../../generated/prisma/client'
import type { UserRole as PrismaUserRole } from '../../generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

type AuthGuardErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'

interface AuthGuardSuccess {
  success: true
  profile: UserProfile
  errorCode: null
}

interface AuthGuardError {
  success: false
  profile: null
  errorCode: AuthGuardErrorCode
}

export type AuthGuardResult = AuthGuardSuccess | AuthGuardError

/**
 * Require a valid authenticated user with an active database profile.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function requireAuth(): Promise<AuthGuardResult> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return { success: false, profile: null, errorCode: 'UNAUTHENTICATED' }
    }

    const profile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: data.user.id }
    })

    if (!profile) {
      return { success: false, profile: null, errorCode: 'UNAUTHENTICATED' }
    }

    if (!profile.isActive) {
      return { success: false, profile: null, errorCode: 'ACCOUNT_DISABLED' }
    }

    return { success: true, profile, errorCode: null }
  } catch {
    return { success: false, profile: null, errorCode: 'UNAUTHENTICATED' }
  }
}

/**
 * Require a valid authenticated user whose database role is in the allowed list.
 * Use in Server Components, Server Actions, and Route Handlers for role-gated content.
 */
export async function requireRole(allowedRoles: readonly PrismaUserRole[]): Promise<AuthGuardResult> {
  const authResult = await requireAuth()

  if (!authResult.success) {
    return authResult
  }

  if (!allowedRoles.includes(authResult.profile.role)) {
    return { success: false, profile: null, errorCode: 'FORBIDDEN' }
  }

  return authResult
}
