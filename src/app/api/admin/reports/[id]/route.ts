import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import type { ReportDetailDto } from '@/types/report'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

interface AdminReportRouteContext {
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

export async function GET(_request: Request, context: AdminReportRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params

    const report = await prisma.report.findUnique({
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

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    const data: ReportDetailDto = toReportDetailDto(report)

    return successResponse(data, 'reports.messages.detailRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
