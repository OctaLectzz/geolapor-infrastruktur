import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { toOfficerTaskDetailDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

import type { OfficerTaskDetailDto } from '@/types/report'

const TASK_VIEW_ROLES = [UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface TaskDetailRouteContext {
  params: Promise<{
    id: string
  }>
}

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function GET(_request: Request, context: TaskDetailRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(TASK_VIEW_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const task = await prisma.assignment.findUnique({
      where: { id },
      include: {
        fieldUpdates: {
          orderBy: { createdAt: 'desc' }
        },
        report: {
          include: {
            category: {
              select: { id: true, name: true, slug: true, icon: true }
            },
            photos: {
              orderBy: { createdAt: 'asc' }
            },
            histories: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    if (!task) {
      return errorResponse('reports.officer.messages.taskNotFound', 404)
    }

    if (authResult.profile.role === UserRole.OFFICER && task.officerId !== authResult.profile.id) {
      return errorResponse('auth.errors.forbidden', 403)
    }

    const data: OfficerTaskDetailDto = toOfficerTaskDetailDto(task)

    return successResponse(data, 'reports.officer.messages.taskRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
