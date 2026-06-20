import type { Category } from '@generated/prisma/client'

import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import type { CategoryDto, CategoryListResponse } from '@/types/category'

function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  }
}

export async function GET(): Promise<Response> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    const data: CategoryListResponse = {
      items: categories.map(toCategoryDto)
    }

    return successResponse(data, 'categories.messages.listRetrieved')
  } catch {
    return errorResponse('categories.messages.unexpectedError', 500)
  }
}
