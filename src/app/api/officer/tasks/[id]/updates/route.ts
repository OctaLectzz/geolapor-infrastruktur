import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { toOfficerTaskDetailDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { fieldUpdateSchema } from '@/schemas/officer-task-schema'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

import type { OfficerTaskDetailDto } from '@/types/report'

const TASK_UPDATE_ROLES = [UserRole.OFFICER, UserRole.SUPERADMIN] as const

interface TaskUpdateRouteContext {
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

export async function POST(request: Request, context: TaskUpdateRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(TASK_UPDATE_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = fieldUpdateSchema.safeParse(payload)

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

      if (task.report.status !== ReportStatus.ASSIGNED && task.report.status !== ReportStatus.IN_PROGRESS) {
        return { type: 'INVALID_TRANSITION' as const }
      }

      await tx.fieldUpdate.create({
        data: {
          assignmentId: id,
          note: validation.data.note,
          progress: validation.data.progress,
          photoUrl: validation.data.photoUrl ?? null,
          photoPath: validation.data.photoPath ?? null
        }
      })

      if (task.report.status === ReportStatus.ASSIGNED) {
        if (!canTransitionReportStatus(task.report.status, ReportStatus.IN_PROGRESS)) {
          return { type: 'INVALID_TRANSITION' as const }
        }

        await tx.report.update({
          where: { id: task.reportId },
          data: { status: ReportStatus.IN_PROGRESS }
        })

        await tx.reportStatusHistory.create({
          data: {
            reportId: task.reportId,
            status: ReportStatus.IN_PROGRESS,
            note: validation.data.note,
            changedById: authResult.profile.id
          }
        })
      }

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'FIELD_UPDATE_CREATED',
          entityType: 'Assignment',
          entityId: id,
          ipAddress,
          userAgent,
          metadata: {
            reportId: task.reportId,
            reportCode: task.report.reportCode,
            progress: validation.data.progress,
            hasPhoto: Boolean(validation.data.photoUrl || validation.data.photoPath)
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

    return successResponse(data, 'reports.officer.messages.progressUpdateCreated', 201)
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
