import { NotificationType, ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { rejectReportSchema } from '@/schemas/admin-report-schema'
import type { ReportDetailDto } from '@/types/report'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface RejectRouteContext {
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

export async function PATCH(request: Request, context: RejectRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = rejectReportSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true, reporterId: true, reportCode: true }
    })

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    if (!canTransitionReportStatus(report.status, ReportStatus.REJECTED)) {
      return errorResponse('reports.messages.invalidStatusTransition', 409)
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: {
          status: ReportStatus.REJECTED,
          rejectionNote: validation.data.rejectionNote
        },
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
          status: ReportStatus.REJECTED,
          note: validation.data.rejectionNote,
          changedById: authResult.profile.id
        }
      })

      await tx.notification.create({
        data: {
          userId: report.reporterId,
          reportId: id,
          type: NotificationType.REPORT_REJECTED,
          title: 'reports.notifications.reportRejected.title',
          message: 'reports.notifications.reportRejected.message'
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_REJECTED',
          entityType: 'Report',
          entityId: id,
          ipAddress,
          userAgent,
          metadata: {
            reportCode: report.reportCode,
            rejectionNote: validation.data.rejectionNote
          }
        }
      })

      return result
    })

    const data: ReportDetailDto = toReportDetailDto(updatedReport)

    return successResponse(data, 'reports.admin.messages.rejectSuccess')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
