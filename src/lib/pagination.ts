import type { PaginationDto } from '@/types/report'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

export interface PaginationParams {
  page: number
  limit: number
  skip: number
  take: number
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback
  }

  return parsedValue
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parsePositiveInteger(searchParams.get('page'), DEFAULT_PAGE)
  const requestedLimit = parsePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT)
  const limit = Math.min(requestedLimit, MAX_LIMIT)

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  }
}

export function createPaginationDto(page: number, limit: number, total: number): PaginationDto {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
}
