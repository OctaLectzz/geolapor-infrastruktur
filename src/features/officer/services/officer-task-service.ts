import type { ApiResponse } from '@/types/api-response'
import type { OfficerTaskDetailDto, OfficerTaskListResponse } from '@/types/report'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return isRecord(value) && typeof value.success === 'boolean' && 'data' in value && typeof value.message === 'string'
}

async function parseApiResponse(response: Response): Promise<ApiResponse<unknown>> {
  const body: unknown = await response.json()

  if (!isApiResponse(body)) {
    throw new Error('common.errors.unexpectedError')
  }

  if (!response.ok || !body.success) {
    throw new Error(body.message)
  }

  return body
}

function isOfficerTaskListResponse(value: unknown): value is OfficerTaskListResponse {
  return isRecord(value) && Array.isArray(value.items) && isRecord(value.pagination)
}

function isOfficerTaskDetailDto(value: unknown): value is OfficerTaskDetailDto {
  return isRecord(value) && typeof value.id === 'string' && typeof value.reportCode === 'string' && Array.isArray(value.fieldUpdates)
}

export interface OfficerTaskFilters {
  page?: number
  limit?: number
}

export interface FieldUpdatePayload {
  note: string
  progress: number
  photoUrl?: string
  photoPath?: string
}

export interface SubmitReviewPayload {
  note?: string
}

function buildQueryString(filters: OfficerTaskFilters): string {
  const params = new URLSearchParams()

  if (filters.page) {
    params.set('page', String(filters.page))
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit))
  }

  const queryString = params.toString()

  return queryString ? `?${queryString}` : ''
}

export async function fetchOfficerTasks(filters: OfficerTaskFilters = {}): Promise<OfficerTaskListResponse> {
  const response = await fetch(`/api/officer/tasks${buildQueryString(filters)}`, { method: 'GET' })
  const body = await parseApiResponse(response)

  if (!isOfficerTaskListResponse(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function fetchOfficerTaskDetail(id: string): Promise<OfficerTaskDetailDto> {
  const response = await fetch(`/api/officer/tasks/${encodeURIComponent(id)}`, { method: 'GET' })
  const body = await parseApiResponse(response)

  if (!isOfficerTaskDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function createFieldUpdate(id: string, payload: FieldUpdatePayload): Promise<OfficerTaskDetailDto> {
  const response = await fetch(`/api/officer/tasks/${encodeURIComponent(id)}/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isOfficerTaskDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function submitTaskReview(id: string, payload: SubmitReviewPayload = {}): Promise<OfficerTaskDetailDto> {
  const response = await fetch(`/api/officer/tasks/${encodeURIComponent(id)}/submit-review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isOfficerTaskDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}
