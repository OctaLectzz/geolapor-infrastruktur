import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { toOfficerTaskDetailDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { submitReviewSchema } from '@/schemas/officer-task-schema'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

import type { OfficerTaskDetailDto } from '@/types/report'

const TASK_REVIEW_ROLES = [UserRole.OFFICER, UserRole.SUPERADMIN] as const

interface SubmitReviewRouteContext {
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

async function readOptionalPayload(request: Request): Promise<unknown> {
  const text = await request.text()

  if (!text.trim()) {
    return {}
  }

  return JSON.parse(text) as unknown
}

export async function PATCH(request: Request, context: SubmitReviewRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(TASK_REVIEW_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const payload = await readOptionalPayload(request)
    const validation = submitReviewSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.assignment.findUnique({
        where: { id },
        include: {
          report: {
            select: {
              id: true,
              reportCode: true,
              status: true
            }
          }
        }
      })

      if (!task) {
        return { type: 'NOT_FOUND' as const }
      }

      if (authResult.profile.role === UserRole.OFFICER && task.officerId !== authResult.profile.id) {
        return { type: 'FORBIDDEN' as const }
      }

      if (!task.isActive) {
        return { type: 'INACTIVE_ASSIGNMENT' as const }
      }

      if (!canTransitionReportStatus(task.report.status, ReportStatus.NEED_REVIEW)) {
        return { type: 'INVALID_TRANSITION' as const }
      }

      await tx.report.update({
        where: { id: task.reportId },
        data: { status: ReportStatus.NEED_REVIEW }
      })

      await tx.reportStatusHistory.create({
        data: {
          reportId: task.reportId,
          status: ReportStatus.NEED_REVIEW,
          note: validation.data.note ?? null,
          changedById: authResult.profile.id
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_SUBMITTED_FOR_REVIEW',
          entityType: 'Assignment',
          entityId: id,
          metadata: {
            reportId: task.reportId,
            reportCode: task.report.reportCode,
            note: validation.data.note ?? null
          }
        }
      })

      const updatedTask = await tx.assignment.findUnique({
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

      if (!updatedTask) {
        return { type: 'NOT_FOUND' as const }
      }

      return { type: 'SUCCESS' as const, task: updatedTask }
    })

    if (result.type === 'NOT_FOUND') {
      return errorResponse('reports.officer.messages.taskNotFound', 404)
    }

    if (result.type === 'FORBIDDEN') {
      return errorResponse('auth.errors.forbidden', 403)
    }

    if (result.type === 'INACTIVE_ASSIGNMENT') {
      return errorResponse('reports.officer.messages.inactiveAssignment', 409)
    }

    if (result.type === 'INVALID_TRANSITION') {
      return errorResponse('reports.messages.invalidStatusTransition', 409)
    }

    const data: OfficerTaskDetailDto = toOfficerTaskDetailDto(result.task)

    return successResponse(data, 'reports.officer.messages.reviewSubmitted')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
