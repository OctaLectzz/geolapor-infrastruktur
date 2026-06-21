import { ReportStatus } from '@generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { PUBLIC_REPORT_STATUSES } from '@/schemas/report-schema'
import type { PublicDashboardStatsDto } from '@/types/report'

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

export async function GET(): Promise<Response> {
  try {
    const publicStatuses = toReportStatusValues(PUBLIC_REPORT_STATUSES)
    const publicStatusFilter = {
      in: publicStatuses
    }

    const [total, verified, completed, inProgress, categoryGroups] = await prisma.$transaction([
      prisma.report.count({
        where: {
          status: publicStatusFilter
        }
      }),
      prisma.report.count({
        where: {
          status: ReportStatus.VERIFIED
        }
      }),
      prisma.report.count({
        where: {
          status: ReportStatus.COMPLETED
        }
      }),
      prisma.report.count({
        where: {
          status: {
            in: [ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS, ReportStatus.NEED_REVIEW]
          }
        }
      }),
      prisma.report.groupBy({
        by: ['categoryId'],
        where: {
          status: publicStatusFilter
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            categoryId: 'desc'
          }
        }
      })
    ])

    const categoryIds = categoryGroups.map((categoryGroup) => categoryGroup.categoryId)
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true
      }
    })

    const data: PublicDashboardStatsDto = {
      total,
      verified,
      completed,
      inProgress,
      categories: categoryGroups.map((categoryGroup) => {
        const category = categories.find((item) => item.id === categoryGroup.categoryId)
        const countValue = typeof categoryGroup._count === 'object' ? (categoryGroup._count.id ?? 0) : 0

        return {
          category: {
            id: category?.id ?? categoryGroup.categoryId,
            name: category?.name ?? 'Unknown category',
            slug: category?.slug ?? 'unknown-category',
            icon: category?.icon ?? null
          },
          total: countValue
        }
      })
    }

    return successResponse(data, 'reports.messages.publicStatsRetrieved')
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
