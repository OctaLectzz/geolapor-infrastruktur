import { NotificationType, ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { assignReportSchema } from '@/schemas/admin-report-schema'
import type { ReportDetailDto } from '@/types/report'
import { canTransitionReportStatus } from '@/utils/report-status-transition'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface AssignRouteContext {
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

export async function POST(request: Request, context: AssignRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = assignReportSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const assignedReport = await prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id },
        select: { id: true, status: true, reportCode: true }
      })

      if (!report) {
        return { type: 'NOT_FOUND' as const }
      }

      if (!canTransitionReportStatus(report.status, ReportStatus.ASSIGNED)) {
        return { type: 'INVALID_TRANSITION' as const }
      }

      const officer = await tx.userProfile.findFirst({
        where: {
          id: validation.data.officerId,
          role: UserRole.OFFICER,
          isActive: true
        },
        select: { id: true, fullName: true, email: true }
      })

      if (!officer) {
        return { type: 'OFFICER_NOT_FOUND' as const }
      }

      const activeAssignment = await tx.assignment.findFirst({
        where: {
          reportId: id,
          isActive: true
        },
        select: { id: true }
      })

      if (activeAssignment) {
        return { type: 'ACTIVE_ASSIGNMENT_EXISTS' as const }
      }

      const dueDate = validation.data.dueDate ? new Date(validation.data.dueDate) : null
      const note = validation.data.note ?? null

      const assignment = await tx.assignment.create({
        data: {
          reportId: id,
          officerId: officer.id,
          assignedById: authResult.profile.id,
          dueDate,
          note
        },
        select: { id: true }
      })

      await tx.report.update({
        where: { id },
        data: { status: ReportStatus.ASSIGNED }
      })

      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: ReportStatus.ASSIGNED,
          note,
          changedById: authResult.profile.id
        }
      })

      await tx.notification.create({
        data: {
          userId: officer.id,
          reportId: id,
          type: NotificationType.REPORT_ASSIGNED,
          title: 'reports.notifications.reportAssigned.title',
          message: 'reports.notifications.reportAssigned.message'
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_ASSIGNED',
          entityType: 'Report',
          entityId: id,
          metadata: {
            reportCode: report.reportCode,
            assignmentId: assignment.id,
            officerId: officer.id,
            officerEmail: officer.email,
            dueDate: dueDate?.toISOString() ?? null,
            note
          }
        }
      })

      const updatedReport = await tx.report.findUnique({
        where: { id },
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

      if (!updatedReport) {
        return { type: 'NOT_FOUND' as const }
      }

      return { type: 'SUCCESS' as const, report: updatedReport }
    })

    if (assignedReport.type === 'NOT_FOUND') {
      return errorResponse('reports.messages.notFound', 404)
    }

    if (assignedReport.type === 'INVALID_TRANSITION') {
      return errorResponse('reports.messages.invalidStatusTransition', 409)
    }

    if (assignedReport.type === 'OFFICER_NOT_FOUND') {
      return errorResponse('reports.admin.messages.officerNotFound', 404)
    }

    if (assignedReport.type === 'ACTIVE_ASSIGNMENT_EXISTS') {
      return errorResponse('reports.admin.messages.activeAssignmentExists', 409)
    }

    const data: ReportDetailDto = toReportDetailDto(assignedReport.report)

    return successResponse(data, 'reports.admin.messages.assignSuccess', 201)
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
