import { ReportStatus } from '@generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { toPublicReportDetailDto } from '@/lib/public-report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { PUBLIC_REPORT_STATUSES } from '@/schemas/report-schema'
import type { PublicReportDetailDto } from '@/types/report'

interface PublicReportRouteContext {
  params: Promise<{
    id: string
  }>
}

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

export async function GET(_request: Request, context: PublicReportRouteContext): Promise<Response> {
  try {
    const { id } = await context.params
    const report = await prisma.report.findFirst({
      where: {
        id,
        status: {
          in: toReportStatusValues(PUBLIC_REPORT_STATUSES)
        }
      },
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
          orderBy: { createdAt: 'asc' }
        },
        histories: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        },
        createdAt: true,
        updatedAt: true
      }
    })

    if (!report) {
      return errorResponse('reports.messages.notFound', 404)
    }

    const data: PublicReportDetailDto = toPublicReportDetailDto(report)

    return successResponse(data, 'reports.messages.publicDetailRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
