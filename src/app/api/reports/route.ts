import { NotificationType, PhotoType, ReportStatus } from '@generated/prisma/enums'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { errorResponse, successResponse } from '@/lib/response'
import { createReportSchema } from '@/schemas/report-schema'
import type { ReportCreateResponse } from '@/types/report'
import { generateReportCode } from '@/utils/generate-report-code'

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const payload: unknown = await request.json()
    const validation = createReportSchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('reports.messages.invalidPayload', 400)
    }

    const category = await prisma.category.findFirst({
      where: {
        id: validation.data.categoryId,
        isActive: true
      },
      select: { id: true }
    })

    if (!category) {
      return errorResponse('reports.messages.categoryNotFound', 404)
    }

    const report = await prisma.$transaction(async (tx) => {
      const createdReport = await tx.report.create({
        data: {
          reportCode: generateReportCode(),
          title: validation.data.title,
          description: validation.data.description,
          address: validation.data.address ?? null,
          latitude: validation.data.latitude,
          longitude: validation.data.longitude,
          status: ReportStatus.PENDING_VERIFICATION,
          reporterId: authResult.profile.id,
          categoryId: validation.data.categoryId,
          photos: {
            create: validation.data.evidencePhotos.map((photo) => ({
              url: photo.url,
              path: photo.path,
              type: PhotoType.BEFORE,
              caption: photo.caption ?? null
            }))
          },
          histories: {
            create: {
              status: ReportStatus.PENDING_VERIFICATION,
              note: null,
              changedById: authResult.profile.id
            }
          },
          notifications: {
            create: {
              userId: authResult.profile.id,
              type: NotificationType.REPORT_CREATED,
              title: 'reports.notifications.reportCreated.title',
              message: 'reports.notifications.reportCreated.message'
            }
          }
        },
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
          }
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'REPORT_CREATED',
          entityType: 'Report',
          entityId: createdReport.id,
          ipAddress,
          userAgent,
          metadata: {
            reportCode: createdReport.reportCode,
            categoryId: createdReport.categoryId
          }
        }
      })

      return createdReport
    })

    const data: ReportCreateResponse = {
      report: toReportDetailDto(report)
    }

    return successResponse(data, 'reports.messages.created', 201)
  } catch {
    return errorResponse('reports.messages.unexpectedError', 500)
  }
}
