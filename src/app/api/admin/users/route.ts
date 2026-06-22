import type { UserProfile } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

import type { UserDto, UserListResponse } from '@/types/user'

const SUPERADMIN_ROLES = [UserRole.SUPERADMIN] as const

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

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await requireRole(SUPERADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const url = new URL(request.url)
    const paginationParams = getPaginationParams(url.searchParams)

    const [users, total] = await prisma.$transaction([
      prisma.userProfile.findMany({
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.userProfile.count()
    ])

    const data: UserListResponse = {
      items: users.map(toUserDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'admin.users.messages.listRetrieved')
  } catch {
    return errorResponse('admin.users.messages.unexpectedError', 500)
  }
}
