import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import type { OfficerDto, OfficerListResponse } from '@/types/report'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function GET(): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const officers = await prisma.userProfile.findMany({
      where: {
        role: UserRole.OFFICER,
        isActive: true
      },
      orderBy: {
        fullName: 'asc'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        agencyId: true
      }
    })

    const items: OfficerDto[] = officers.map((officer) => ({
      id: officer.id,
      fullName: officer.fullName,
      email: officer.email,
      phoneNumber: officer.phoneNumber,
      avatarUrl: officer.avatarUrl,
      agencyId: officer.agencyId
    }))

    const data: OfficerListResponse = { items }

    return successResponse(data, 'reports.admin.messages.officersRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
