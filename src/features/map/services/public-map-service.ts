import axios from 'axios'

import type { ApiResponse } from '@/types/api-response'
import type { CategoryDto, CategoryListResponse } from '@/types/category'
import type { PublicReportListItemDto, PublicReportListResponse } from '@/types/report'

interface PublicReportQueryParams {
  status?: string
  categoryId?: string
  page?: number
  limit?: number
}

function isPublicReportListResponse(value: unknown): value is PublicReportListResponse {
  return typeof value === 'object' && value !== null && Array.isArray((value as Record<string, unknown>).items)
}

function isCategoryListResponse(value: unknown): value is CategoryListResponse {
  return typeof value === 'object' && value !== null && Array.isArray((value as Record<string, unknown>).items)
}

export async function fetchPublicReports(params: PublicReportQueryParams): Promise<PublicReportListItemDto[]> {
  const searchParams = new URLSearchParams()

  if (params.status) {
    searchParams.set('status', params.status)
  }
  if (params.categoryId) {
    searchParams.set('categoryId', params.categoryId)
  }
  if (params.page) {
    searchParams.set('page', String(params.page))
  }
  if (params.limit) {
    searchParams.set('limit', String(params.limit))
  }

  const response = await axios.get<ApiResponse<PublicReportListResponse>>(`/api/reports/public?${searchParams.toString()}`)

  const data = response.data.data

  if (!isPublicReportListResponse(data)) {
    return []
  }

  return data.items
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const response = await axios.get<ApiResponse<CategoryListResponse>>('/api/categories')

  const data = response.data.data

  if (!isCategoryListResponse(data)) {
    return []
  }

  return data.items
}
