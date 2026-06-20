export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryListResponse {
  items: CategoryDto[]
}
