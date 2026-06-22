import { requireAuth } from '@/lib/auth'
import { createPaginationDto, getPaginationParams } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import type { NotificationDto, NotificationListResponse } from '@/types/notifications'

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

function toNotificationDto(notification: {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  reportId: string | null
  createdAt: Date
}): NotificationDto {
  return {
    id: notification.id,
    type: notification.type as NotificationDto['type'],
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    reportId: notification.reportId,
    createdAt: notification.createdAt.toISOString()
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const url = new URL(request.url)
    const paginationParams = getPaginationParams(url.searchParams)
    const where = { userId: authResult.profile.id }

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: paginationParams.skip,
        take: paginationParams.take
      }),
      prisma.notification.count({ where })
    ])

    const data: NotificationListResponse = {
      items: notifications.map(toNotificationDto),
      pagination: createPaginationDto(paginationParams.page, paginationParams.limit, total)
    }

    return successResponse(data, 'notifications.messages.listRetrieved')
  } catch {
    return errorResponse('notifications.messages.unexpectedError', 500)
  }
}
