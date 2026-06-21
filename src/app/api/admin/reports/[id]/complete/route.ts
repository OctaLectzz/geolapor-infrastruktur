import { NotificationType, ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { completeReportSchema } from '@/schemas/admin-report-schema'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

import type { ReportDetailDto } from '@/types/report'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface CompleteRouteContext {
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

export async function PATCH(request: Request, context: CompleteRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const payload = await readOptionalPayload(request)
    const validation = completeReportSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        reporterId: true,
        reportCode: true,
        assignments: {
          where: { isActive: true },
          select: {
            id: true,
            fieldUpdates: {
              select: { id: true },
              take: 1
            }
          },
          take: 1
        },
        photos: {
          select: { id: true },
          take: 1
        }
      }
    })

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    if (!canTransitionReportStatus(report.status, ReportStatus.COMPLETED)) {
      return errorResponse('reports.messages.invalidStatusTransition', 409)
    }

    const activeAssignment = report.assignments[0]

    if (!activeAssignment || activeAssignment.fieldUpdates.length === 0) {
      return errorResponse('reports.admin.messages.noFieldUpdateExists', 409)
    }

    const hasEvidencePhoto = report.photos.length > 0
    const hasAdminOverrideNote = Boolean(validation.data.note && validation.data.note.length >= 5)

    if (!hasEvidencePhoto && !hasAdminOverrideNote) {
      return errorResponse('reports.admin.messages.evidenceOrNoteRequired', 400)
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: { status: ReportStatus.COMPLETED },
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
      })

      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: ReportStatus.COMPLETED,
          note: validation.data.note ?? null,
          changedById: authResult.profile.id
        }
      })

      await tx.notification.create({
        data: {
          userId: report.reporterId,
          reportId: id,
          type: NotificationType.REPORT_COMPLETED,
          title: 'reports.notifications.reportCompleted.title',
          message: 'reports.notifications.reportCompleted.message'
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_COMPLETED',
          entityType: 'Report',
          entityId: id,
          metadata: {
            reportCode: report.reportCode,
            note: validation.data.note ?? null,
            hasEvidencePhoto,
            hasAdminOverrideNote
          }
        }
      })

      return result
    })

    const data: ReportDetailDto = toReportDetailDto(updatedReport)

    return successResponse(data, 'reports.admin.messages.completeSuccess')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
