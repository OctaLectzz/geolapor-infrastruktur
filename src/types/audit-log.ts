import type { JsonValue } from '@prisma/client/runtime/client'

export interface AuditLogDto {
  id: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  action: string
  entityType: string
  entityId: string | null
  metadata: JsonValue
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogListResponse {
  items: AuditLogDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
