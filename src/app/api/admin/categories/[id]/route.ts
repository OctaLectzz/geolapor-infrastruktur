import type { Category } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/response'
import { updateCategorySchema } from '@/schemas/category-schema'
import type { CategoryDto } from '@/types/category'
import { generateSlug } from '@/utils/slug'

interface CategoryRouteContext {
  params: Promise<{
    id: string
  }>
}

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

export async function PATCH(request: Request, context: CategoryRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPERADMIN])

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const { id } = await context.params
    const payload: unknown = await request.json()
    const validation = updateCategorySchema.safeParse(payload)

    if (!validation.success) {
      return errorResponse('categories.messages.invalidPayload', 400)
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return errorResponse('categories.messages.notFound', 404)
    }

    const nextSlug = validation.data.slug ?? (validation.data.name ? generateSlug(validation.data.name) : undefined)

    if (nextSlug !== undefined) {
      if (!nextSlug) {
        return errorResponse('categories.messages.invalidPayload', 400)
      }

      const conflictingCategory = await prisma.category.findUnique({
        where: { slug: nextSlug }
      })

      if (conflictingCategory && conflictingCategory.id !== id) {
        return errorResponse('categories.messages.slugConflict', 409)
      }
    }

    const category = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          ...(validation.data.name !== undefined ? { name: validation.data.name } : {}),
          ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
          ...(validation.data.description !== undefined ? { description: validation.data.description } : {}),
          ...(validation.data.icon !== undefined ? { icon: validation.data.icon } : {}),
          ...(validation.data.isActive !== undefined ? { isActive: validation.data.isActive } : {})
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'CATEGORY_UPDATED',
          entityType: 'Category',
          entityId: updatedCategory.id,
          ipAddress,
          userAgent,
          metadata: {
            previousSlug: existingCategory.slug,
            nextSlug: updatedCategory.slug
          }
        }
      })

      return updatedCategory
    })

    return successResponse(toCategoryDto(category), 'categories.messages.updated')
  } catch {
    return errorResponse('categories.messages.unexpectedError', 500)
  }
}

export async function DELETE(request: Request, context: CategoryRouteContext): Promise<Response> {
  try {
    const authResult = await requireRole([UserRole.SUPERADMIN])

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    const { id } = await context.params
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return errorResponse('categories.messages.notFound', 404)
    }

    const category = await prisma.$transaction(async (tx) => {
      const deactivatedCategory = await tx.category.update({
        where: { id },
        data: { isActive: false }
      })

      await tx.auditLog.create({
        data: {
          actorId: authResult.profile.id,
          action: 'CATEGORY_DEACTIVATED',
          entityType: 'Category',
          entityId: deactivatedCategory.id,
          ipAddress,
          userAgent,
          metadata: {
            slug: deactivatedCategory.slug
          }
        }
      })

      return deactivatedCategory
    })

    return successResponse(toCategoryDto(category), 'categories.messages.deactivated')
  } catch {
    return errorResponse('categories.messages.unexpectedError', 500)
  }
}
