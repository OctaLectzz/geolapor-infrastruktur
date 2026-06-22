import 'server-only'

import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@generated/prisma/enums'

interface CreateNotificationInput {
  userId: string
  reportId: string
  type: NotificationType
  title: string
  message: string
}

/**
 * Create a single in-app notification record.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      reportId: input.reportId,
      type: input.type,
      title: input.title,
      message: input.message
    }
  })
}
