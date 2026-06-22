import type { AuditLog, UserProfile } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

import type { AuditLogDto, AuditLogListResponse } from '@/types/audit-log'

const SUPERADMIN_ROLES = [UserRole.SUPERADMIN] as const

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

function toAuditLogDto(
  log: AuditLog & {
    actor: Pick<UserProfile, 'id' | 'fullName' | 'email'> | null
  }
): AuditLogDto {
  return {
    id: log.id,
    actorId: log.actorId,
    actorName: log.actor?.fullName ?? null,
    actorEmail: log.actor?.email ?? null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString()
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

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take,
        include: {
          actor: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }),
      prisma.auditLog.count()
    ])

    const data: AuditLogListResponse = {
      items: logs.map(toAuditLogDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'reports.messages.publicListRetrieved')
  } catch {
    return errorResponse('admin.auditLogs.messages.unexpectedError', 500)
  }
}
