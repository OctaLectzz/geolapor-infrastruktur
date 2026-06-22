import type { ApiResponse } from '@/types/api-response'
import type { CategoryDto } from '@/types/category'

interface CreateCategoryPayload {
  name: string
  description?: string | null
  icon?: string | null
}

interface UpdateCategoryPayload {
  name?: string
  slug?: string
  description?: string | null
  icon?: string | null
  isActive?: boolean
}

export async function createCategory(payload: CreateCategoryPayload): Promise<ApiResponse<CategoryDto>> {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return response.json() as Promise<ApiResponse<CategoryDto>>
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<ApiResponse<CategoryDto>> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return response.json() as Promise<ApiResponse<CategoryDto>>
}

export async function deactivateCategory(id: string): Promise<ApiResponse<CategoryDto>> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE'
  })

  return response.json() as Promise<ApiResponse<CategoryDto>>
}
