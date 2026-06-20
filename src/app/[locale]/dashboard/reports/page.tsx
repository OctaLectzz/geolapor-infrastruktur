import { useTranslations } from 'next-intl'

import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportListItemDto } from '@/lib/report-dto'

import { ReportCard } from '@/features/reports/components/report-card'

import type { ReportListItemDto } from '@/types/report'

interface MyReportsContentProps {
  reports: ReportListItemDto[]
}

function MyReportsContent({ reports }: MyReportsContentProps): React.ReactElement {
  const t = useTranslations('reports')
  const tDashboard = useTranslations('dashboard')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('list.myReports')}</h1>
            <p className="text-muted-foreground text-sm">{tDashboard('user.description')}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/reports/create">{tDashboard('user.createReport')}</Link>
          </Button>
        </section>

        {reports.length === 0 ? (
          <EmptyState
            title={t('emptyStates.noReports')}
            action={
              <Button asChild>
                <Link href="/dashboard/reports/create">{tDashboard('user.createReport')}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default async function MyReportsPage(): Promise<React.ReactElement> {
  const authResult = await requireAuth()

  if (!authResult.success) {
    return <div />
  }

  const reports = await prisma.report.findMany({
    where: { reporterId: authResult.profile.id },
    include: {
      category: {
        select: { id: true, name: true, slug: true, icon: true }
      },
      photos: {
        orderBy: { createdAt: 'asc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <MyReportsContent reports={reports.map(toReportListItemDto)} />
}
