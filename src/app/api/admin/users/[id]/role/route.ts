import type { UserProfile } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'
import { z } from 'zod'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

import type { UserDto } from '@/types/user'

const SUPERADMIN_ROLES = [UserRole.SUPERADMIN] as const

interface UserRoleRouteContext {
  params: Promise<{
    id: string
  }>
}

const updateUserRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPERADMIN])
})

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

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

export async function PATCH(request: Request, context: UserRoleRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(SUPERADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = updateUserRoleSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('admin.users.messages.invalidPayload', 400)
    }

    const existingUser = await prisma.userProfile.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return errorResponse('admin.users.messages.notFound', 404)
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const result = await tx.userProfile.update({
        where: { id },
        data: { role: validation.data.role }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'USER_ROLE_CHANGED',
          entityType: 'UserProfile',
          entityId: id,
          metadata: {
            previousRole: existingUser.role,
            newRole: validation.data.role,
            userEmail: existingUser.email
          }
        }
      })

      return result
    })

    return successResponse(toUserDto(updatedUser), 'admin.users.messages.roleUpdated')
  } catch {
    return errorResponse('admin.users.messages.unexpectedError', 500)
  }
}
