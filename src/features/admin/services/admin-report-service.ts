import type { ApiResponse } from '@/types/api-response'
import type { OfficerDto, OfficerListResponse, ReportDetailDto, ReportListResponse } from '@/types/report'

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

function isReportListResponse(value: unknown): value is ReportListResponse {
  return isRecord(value) && Array.isArray(value.items) && isRecord(value.pagination)
}

function isReportDetailDto(value: unknown): value is ReportDetailDto {
  return isRecord(value) && typeof value.id === 'string' && typeof value.reportCode === 'string' && Array.isArray(value.photos)
}

function isOfficerDto(value: unknown): value is OfficerDto {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.fullName === 'string' &&
    typeof value.email === 'string' &&
    (typeof value.phoneNumber === 'string' || value.phoneNumber === null) &&
    (typeof value.avatarUrl === 'string' || value.avatarUrl === null) &&
    (typeof value.agencyId === 'string' || value.agencyId === null)
  )
}

function isOfficerListResponse(value: unknown): value is OfficerListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isOfficerDto)
}

export interface AdminReportFilters {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  regionId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

function buildQueryString(filters: AdminReportFilters): string {
  const params = new URLSearchParams()

  if (filters.page) {
    params.set('page', String(filters.page))
  }

  if (filters.limit) {
    params.set('limit', String(filters.limit))
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  if (filters.categoryId) {
    params.set('categoryId', filters.categoryId)
  }

  if (filters.regionId) {
    params.set('regionId', filters.regionId)
  }

  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom)
  }

  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo)
  }

  if (filters.search) {
    params.set('search', filters.search)
  }

  const queryString = params.toString()

  return queryString ? `?${queryString}` : ''
}

export async function fetchAdminReports(filters: AdminReportFilters = {}): Promise<ReportListResponse> {
  const queryString = buildQueryString(filters)
  const response = await fetch(`/api/admin/reports${queryString}`, { method: 'GET' })
  const body = await parseApiResponse(response)

  if (!isReportListResponse(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function fetchAdminReportDetail(id: string): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}`, { method: 'GET' })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function verifyReport(id: string, note?: string): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note })
  })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function rejectReport(id: string, rejectionNote: string): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectionNote })
  })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export interface AssignReportPayload {
  officerId: string
  dueDate?: string
  note?: string
}

export async function fetchActiveOfficers(): Promise<OfficerListResponse> {
  const response = await fetch('/api/admin/officers', { method: 'GET' })
  const body = await parseApiResponse(response)

  if (!isOfficerListResponse(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function assignReport(id: string, payload: AssignReportPayload): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export interface CompleteReportPayload {
  note?: string
}

export interface RequestRevisionPayload {
  note: string
}

export async function completeReport(id: string, payload: CompleteReportPayload): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}

export async function requestReportRevision(id: string, payload: RequestRevisionPayload): Promise<ReportDetailDto> {
  const response = await fetch(`/api/admin/reports/${encodeURIComponent(id)}/request-revision`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isReportDetailDto(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}
