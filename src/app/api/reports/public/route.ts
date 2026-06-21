import { ReportStatus } from '@generated/prisma/enums'

import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { toPublicReportListItemDto } from '@/lib/public-report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { PUBLIC_REPORT_STATUSES, publicReportQuerySchema } from '@/schemas/report-schema'
import type { PublicReportListResponse } from '@/types/report'

interface PublicReportWhereClause {
  status: {
    in: ReportStatus[]
  }
  categoryId?: string
  regionId?: string
  latitude?: {
    gte?: number
    lte?: number
  }
  longitude?: {
    gte?: number
    lte?: number
  }
}

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const validation = publicReportQuerySchema.safeParse({
      status: url.searchParams.get('status') ?? undefined,
      categoryId: url.searchParams.get('categoryId') ?? undefined,
      regionId: url.searchParams.get('regionId') ?? undefined,
      minLat: url.searchParams.get('minLat') ?? undefined,
      maxLat: url.searchParams.get('maxLat') ?? undefined,
      minLng: url.searchParams.get('minLng') ?? undefined,
      maxLng: url.searchParams.get('maxLng') ?? undefined
    })

    if (!validation.success) {
      return errorResponse('reports.validation.publicFiltersInvalid', 400)
    }

    const paginationParams = getPaginationParams(url.searchParams)
    const publicStatuses = toReportStatusValues(PUBLIC_REPORT_STATUSES)
    const where: PublicReportWhereClause = {
      status: {
        in: validation.data.status ? [validation.data.status as ReportStatus] : publicStatuses
      }
    }

    if (validation.data.categoryId) {
      where.categoryId = validation.data.categoryId
    }

    if (validation.data.regionId) {
      where.regionId = validation.data.regionId
    }

    if (validation.data.minLat !== undefined || validation.data.maxLat !== undefined) {
      where.latitude = {}

      if (validation.data.minLat !== undefined) {
        where.latitude.gte = validation.data.minLat
      }

      if (validation.data.maxLat !== undefined) {
        where.latitude.lte = validation.data.maxLat
      }
    }

    if (validation.data.minLng !== undefined || validation.data.maxLng !== undefined) {
      where.longitude = {}

      if (validation.data.minLng !== undefined) {
        where.longitude.gte = validation.data.minLng
      }

      if (validation.data.maxLng !== undefined) {
        where.longitude.lte = validation.data.maxLng
      }
    }

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          reportCode: true,
          title: true,
          description: true,
          address: true,
          latitude: true,
          longitude: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true
            }
          },
          region: {
            select: {
              id: true,
              province: true,
              city: true,
              district: true,
              village: true
            }
          },
          photos: {
            select: {
              id: true,
              url: true,
              type: true,
              caption: true,
              createdAt: true
            },
            orderBy: { createdAt: 'asc' },
            take: 1
          },
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.report.count({ where })
    ])

    const data: PublicReportListResponse = {
      items: reports.map(toPublicReportListItemDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'reports.messages.publicListRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
