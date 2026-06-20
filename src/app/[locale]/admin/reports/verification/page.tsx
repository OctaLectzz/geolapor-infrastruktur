import { useTranslations } from 'next-intl'

import { prisma } from '@/lib/prisma'

import { AdminReportTable } from '@/features/admin/components/admin-report-table'

interface CategoryOption {
  id: string
  name: string
}

export default async function VerificationPage(): Promise<React.ReactElement> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    name: category.name
  }))

  return <VerificationPageContent categories={categoryOptions} />
}

interface VerificationPageContentProps {
  categories: CategoryOption[]
}

function VerificationPageContent({ categories }: VerificationPageContentProps): React.ReactElement {
  const t = useTranslations('dashboard.admin')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('pendingReports')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </section>

        <AdminReportTable categories={categories} fixedStatus="PENDING_VERIFICATION" showStatusFilter={false} />
      </div>
    </main>
  )
}
