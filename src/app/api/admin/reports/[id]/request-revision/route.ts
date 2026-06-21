import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { requestRevisionSchema } from '@/schemas/admin-report-schema'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

import type { ReportDetailDto } from '@/types/report'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface RevisionRouteContext {
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

export async function PATCH(request: Request, context: RevisionRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = requestRevisionSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true, reportCode: true }
    })

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    if (!canTransitionReportStatus(report.status, ReportStatus.IN_PROGRESS)) {
      return errorResponse('reports.messages.invalidStatusTransition', 409)
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: { status: ReportStatus.IN_PROGRESS },
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true }
          },
          photos: {
            orderBy: { createdAt: 'asc' }
          },
          histories: {
            orderBy: { createdAt: 'asc' }
          },
          assignments: {
            where: { isActive: true },
            include: {
              fieldUpdates: {
                orderBy: { createdAt: 'desc' }
              }
            },
            take: 1
          }
        }
      })

      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: ReportStatus.IN_PROGRESS,
          note: validation.data.note,
          changedById: authResult.profile.id
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_REVISION_REQUESTED',
          entityType: 'Report',
          entityId: id,
          metadata: {
            reportCode: report.reportCode,
            note: validation.data.note
          }
        }
      })

      return result
    })

    const data: ReportDetailDto = toReportDetailDto(updatedReport)

    return successResponse(data, 'reports.admin.messages.revisionSuccess')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
