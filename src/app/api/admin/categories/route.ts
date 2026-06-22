import type { Category } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { createCategorySchema } from '@/schemas/category-schema'
import type { CategoryDto, CategoryListResponse } from '@/types/category'
import { generateSlug } from '@/utils/slug'

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

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function GET(): Promise<Response> {
  try {
    const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPERADMIN])

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const data: CategoryListResponse = {
      items: categories.map(toCategoryDto)
    }

    return successResponse(data, 'categories.messages.listRetrieved')
  } catch {
    return errorResponse('categories.messages.unexpectedError', 500)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPERADMIN])

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const payload: unknown = await request.json()
    const validation = createCategorySchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('categories.messages.invalidPayload', 400)
    }

    const slug = validation.data.slug ?? generateSlug(validation.data.name)

    if (!slug) {
      return errorResponse('categories.messages.invalidPayload', 400)
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return errorResponse('categories.messages.slugConflict', 409)
    }

    const category = await prisma.$transaction(async (tx) => {
      const createdCategory = await tx.category.create({
        data: {
          name: validation.data.name,
          slug,
          description: validation.data.description ?? null,
          icon: validation.data.icon ?? null,
          isActive: validation.data.isActive ?? true
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'CATEGORY_CREATED',
          entityType: 'Category',
          entityId: createdCategory.id,
          ipAddress,
          userAgent,
          metadata: {
            name: createdCategory.name,
            slug: createdCategory.slug
          }
        }
      })

      return createdCategory
    })

    return successResponse(toCategoryDto(category), 'categories.messages.created', 201)
  } catch {
    return errorResponse('categories.messages.unexpectedError', 500)
  }
}
