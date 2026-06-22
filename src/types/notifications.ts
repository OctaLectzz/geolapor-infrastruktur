import type { NotificationType } from '@generated/prisma/enums'

export interface NotificationDto {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  reportId: string | null
  createdAt: string
}

export interface NotificationListResponse {
  items: NotificationDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
