import type { ApiResponse } from '@/types/api-response'
import type { CategoryDto, CategoryListResponse } from '@/types/category'
import type { ReportCreateResponse, ReportCreationInput } from '@/types/report'
import type { UploadedPhotoResult } from '@/types/upload'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return isRecord(value) && typeof value.success === 'boolean' && 'data' in value && typeof value.message === 'string'
}

function isCategoryDto(value: unknown): value is CategoryDto {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    (typeof value.description === 'string' || value.description === null) &&
    (typeof value.icon === 'string' || value.icon === null) &&
    typeof value.isActive === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isCategoryListResponse(value: unknown): value is CategoryListResponse {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isCategoryDto)
}

function isUploadedPhotoResult(value: unknown): value is UploadedPhotoResult {
  return isRecord(value) && typeof value.path === 'string' && typeof value.url === 'string'
}

function isReportCreateResponse(value: unknown): value is ReportCreateResponse {
  return isRecord(value) && isRecord(value.report) && typeof value.report.id === 'string'
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

export async function fetchCategories(signal?: AbortSignal): Promise<CategoryListResponse> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    signal
  })
  const body = await parseApiResponse(response)

  if (!isCategoryListResponse(body.data)) {
    throw new Error('categories.messages.unexpectedError')
  }

  return body.data
}

export async function uploadReportPhoto(file: File): Promise<UploadedPhotoResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/report-photo', {
    method: 'POST',
    body: formData
  })
  const body = await parseApiResponse(response)

  if (!isUploadedPhotoResult(body.data)) {
    throw new Error('upload.errors.uploadFailed')
  }

  return body.data
}

export async function createReport(payload: ReportCreationInput): Promise<ReportCreateResponse> {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const body = await parseApiResponse(response)

  if (!isReportCreateResponse(body.data)) {
    throw new Error('reports.messages.unexpectedError')
  }

  return body.data
}
