import type { UserProfile } from '@generated/prisma/client'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '@/schemas/profile-schema'
import type { UserDto } from '@/types/user'

function toUserDto(user: UserProfile): UserDto {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    role: user.role,
    agencyId: user.agencyId,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }
}

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  if (errorCode === 'ACCOUNT_DISABLED') {
    return errorResponse('auth.errors.accountDisabled', 403)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const payload: unknown = await request.json()
    const validation = updateProfileSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('profile.messages.updateError', 400)
    }

    const { fullName, phoneNumber, avatarUrl } = validation.data
    const dbPhoneNumber = phoneNumber === '' || !phoneNumber ? null : phoneNumber
    const dbAvatarUrl = avatarUrl === '' || !avatarUrl ? null : avatarUrl

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const result = await tx.userProfile.update({
        where: { id: authResult.profile.id },
        data: {
          fullName,
          phoneNumber: dbPhoneNumber,
          avatarUrl: dbAvatarUrl
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'PROFILE_UPDATED',
          entityType: 'UserProfile',
          entityId: authResult.profile.id,
          ipAddress,
          userAgent,
          metadata: {
            previousFullName: authResult.profile.fullName,
            newFullName: fullName,
            previousPhoneNumber: authResult.profile.phoneNumber,
            newPhoneNumber: dbPhoneNumber,
            previousAvatarUrl: authResult.profile.avatarUrl,
            newAvatarUrl: dbAvatarUrl
          }
        }
      })

      return result
    })

    // Sync updated metadata back to Supabase Auth user metadata
    try {
      const supabase = await createClient()
      const { error: syncError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: dbAvatarUrl
        }
      })

      if (syncError) {
        console.error('Failed to sync metadata to Supabase Auth on profile update:', syncError.message)
      }
    } catch (syncError) {
      console.error('Unexpected error syncing metadata to Supabase Auth on profile update:', syncError)
    }

    return successResponse(toUserDto(updatedProfile), 'profile.messages.updateSuccess')
  } catch (error) {
    console.error('Profile update failed:', error)
    return errorResponse('profile.messages.updateError', 500)
  }
}
