import { UserRole } from '../../../../../generated/prisma/enums'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import type { ReportDetailDto } from '@/types/report'

interface ReportRouteContext {
  params: Promise<{
    id: string
  }>
}

interface ReportAssignmentAccessRecord {
  officerId: string
  isActive: boolean
}

interface ReportAccessRecord {
  reporterId: string
  assignments: ReportAssignmentAccessRecord[]
}

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

function canReadReport(report: ReportAccessRecord, profileId: string, role: UserRole): boolean {
  if (role === UserRole.ADMIN || role === UserRole.SUPERADMIN) {
    return true
  }

  if (report.reporterId === profileId) {
    return true
  }

  if (role === UserRole.OFFICER) {
    return report.assignments.some((assignment) => assignment.isActive && assignment.officerId === profileId)
  }

  return false
}

export async function GET(_request: Request, context: ReportRouteContext): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        photos: {
          orderBy: { createdAt: 'asc' }
        },
        histories: {
          orderBy: { createdAt: 'asc' }
        },
        assignments: {
          select: {
            officerId: true,
            isActive: true
          }
        }
      }
    })

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    if (!canReadReport(report, authResult.profile.id, authResult.profile.role)) {
      return errorResponse('auth.errors.forbidden', 403)
    }

    const data: ReportDetailDto = toReportDetailDto(report)

    return successResponse(data, 'reports.messages.detailRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
