import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'

interface ReadRouteContext {
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

export async function PATCH(_request: Request, context: ReadRouteContext): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const { id } = await context.params

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true }
    })

    if (!notification) {
      return errorResponse('notifications.messages.notFound', 404)
    }

    if (notification.userId !== authResult.profile.id) {
      return errorResponse('auth.errors.forbidden', 403)
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return successResponse(null, 'notifications.messages.markedAsRead')
  } catch {
    return errorResponse('notifications.messages.unexpectedError', 500)
  }
}
