import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { toReportListItemDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import type { ReportListResponse } from '@/types/report'

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPERADMIN] as const

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

function parseOptionalDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) {
    return undefined
  }

  return date
}

interface ReportWhereClause {
  status?: ReportStatus
  categoryId?: string
  regionId?: string
  createdAt?: {
    gte?: Date
    lte?: Date
  }
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' }
    reportCode?: { contains: string; mode: 'insensitive' }
    description?: { contains: string; mode: 'insensitive' }
    address?: { contains: string; mode: 'insensitive' }
  }>
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await requireRole(ADMIN_ROLES)

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const url = new URL(request.url)
    const paginationParams = getPaginationParams(url.searchParams)

    const where: ReportWhereClause = {}

    const statusParam = url.searchParams.get('status')

    if (statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)) {
      where.status = statusParam as ReportStatus
    }

    const categoryId = url.searchParams.get('categoryId')

    if (categoryId) {
      where.categoryId = categoryId
    }

    const regionId = url.searchParams.get('regionId')

    if (regionId) {
      where.regionId = regionId
    }

    const dateFrom = parseOptionalDate(url.searchParams.get('dateFrom'))
    const dateTo = parseOptionalDate(url.searchParams.get('dateTo'))

    if (dateFrom || dateTo) {
      where.createdAt = {}

      if (dateFrom) {
        where.createdAt.gte = dateFrom
      }

      if (dateTo) {
        where.createdAt.lte = dateTo
      }
    }

    const search = url.searchParams.get('search')?.trim()

    if (search && search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { reportCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true }
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
