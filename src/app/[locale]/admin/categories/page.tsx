import { prisma } from '@/lib/prisma'

import { AdminCategoryListClient } from '@/features/admin/components/admin-category-list-client'

import type { CategoryDto } from '@/types/category'

export default async function AdminCategoriesPage(): Promise<React.ReactElement> {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const initialCategories: CategoryDto[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  }))

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AdminCategoryListClient initialCategories={initialCategories} />
      </div>
    </main>
  )
}
