import { useTranslations } from 'next-intl'

import { PublicMapClient } from '@/features/map/components/public-map-client'
import { prisma } from '@/lib/prisma'

import type { CategoryDto } from '@/types/category'

async function getActiveCategories(): Promise<CategoryDto[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }))
  } catch {
    return []
  }
}

export default async function PublicMapPage(): Promise<React.ReactElement> {
  const categories = await getActiveCategories()

  return <PublicMapPageContent initialCategories={categories} />
}

interface PublicMapPageContentProps {
  initialCategories: CategoryDto[]
}

function PublicMapPageContent({ initialCategories }: PublicMapPageContentProps): React.ReactElement {
  const t = useTranslations('common.publicMap')

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col min-h-0 overflow-hidden">
      <div className="bg-background border-b px-4 py-3 sm:px-6 shrink-0">
        <h1 className="text-foreground text-lg font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>
      <PublicMapClient initialCategories={initialCategories} />
    </div>
  )
}
