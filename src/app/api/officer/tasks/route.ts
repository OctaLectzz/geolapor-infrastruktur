import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { toOfficerTaskListItemDto } from '@/lib/officer-task-dto'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

import type { OfficerTaskListResponse } from '@/types/report'

const TASK_VIEW_ROLES = [UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface AssignmentWhereClause {
  isActive: boolean
  officerId?: string
}

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await requireRole(TASK_VIEW_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const url = new URL(request.url)
    const paginationParams = getPaginationParams(url.searchParams)
    const where: AssignmentWhereClause = { isActive: true }

    if (authResult.profile.role === UserRole.OFFICER) {
      where.officerId = authResult.profile.id
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.assignment.findMany({
        where,
        include: {
          report: {
            include: {
              category: {
                select: { id: true, name: true, slug: true, icon: true }
              },
              photos: {
                orderBy: { createdAt: 'asc' },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.assignment.count({ where })
    ])

    const data: OfficerTaskListResponse = {
      items: tasks.map(toOfficerTaskListItemDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'reports.officer.messages.tasksRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
