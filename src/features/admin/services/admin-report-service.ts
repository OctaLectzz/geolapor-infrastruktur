import type { ApiResponse } from '@/types/api-response'
import type { ReportDetailDto, ReportListResponse } from '@/types/report'

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
