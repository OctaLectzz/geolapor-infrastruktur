import { requireAuth } from '@/lib/auth'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { toReportListItemDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import type { ReportListResponse } from '@/types/report'

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const url = new URL(request.url)
    const paginationParams = getPaginationParams(url.searchParams)
    const where = { reporterId: authResult.profile.id }

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
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
            orderBy: { createdAt: 'asc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.report.count({ where })
    ])

    const data: ReportListResponse = {
      items: reports.map(toReportListItemDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'reports.messages.listRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
