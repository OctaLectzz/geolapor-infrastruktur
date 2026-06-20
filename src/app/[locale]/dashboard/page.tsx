import { useTranslations } from 'next-intl'

import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportListItemDto } from '@/lib/report-dto'

import { ReportCard } from '@/features/reports/components/report-card'

import type { ReportStatus } from '@/types/report'

interface StatCardProps {
  label: string
  value: number
  accent?: boolean
}

function StatCard({ label, value, accent }: StatCardProps): React.ReactElement {
  return (
    <Card className={accent ? 'border-primary/20 bg-primary/5' : undefined}>
      <CardHeader className="pb-2">
        <CardDescription className="text-sm">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

const RECENT_REPORTS_LIMIT = 5

export default async function DashboardPage(): Promise<React.ReactElement> {
  const authResult = await requireAuth()

  if (!authResult.success) {
    return <div />
  }

  const reporterId = authResult.profile.id

  const [totalReports, pendingReports, inProgressReports, completedReports, recentReports] = await prisma.$transaction([
    prisma.report.count({ where: { reporterId } }),
    prisma.report.count({
      where: { reporterId, status: 'PENDING_VERIFICATION' as ReportStatus }
    }),
    prisma.report.count({
      where: { reporterId, status: 'IN_PROGRESS' as ReportStatus }
    }),
    prisma.report.count({
      where: { reporterId, status: 'COMPLETED' as ReportStatus }
    }),
    prisma.report.findMany({
      where: { reporterId },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true }
        },
        photos: {
          orderBy: { createdAt: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: RECENT_REPORTS_LIMIT
    })
  ])

  return (
    <DashboardContent
      totalReports={totalReports}
      pendingReports={pendingReports}
      inProgressReports={inProgressReports}
      completedReports={completedReports}
      recentReports={recentReports.map(toReportListItemDto)}
    />
  )
}

interface DashboardContentProps {
  totalReports: number
  pendingReports: number
  inProgressReports: number
  completedReports: number
  recentReports: ReturnType<typeof toReportListItemDto>[]
}

function DashboardContent({
  totalReports,
  pendingReports,
  inProgressReports,
  completedReports,
  recentReports
}: DashboardContentProps): React.ReactElement {
  const t = useTranslations('dashboard')
  const tReports = useTranslations('reports')
  const tActions = useTranslations('common.actions')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('user.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('user.description')}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/reports/create">{t('user.createReport')}</Link>
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t('overview.title')}>
          <StatCard label={t('stats.totalReports')} value={totalReports} accent />
          <StatCard label={t('stats.pendingVerification')} value={pendingReports} />
          <StatCard label={t('stats.inProgressReports')} value={inProgressReports} />
          <StatCard label={t('stats.completedReports')} value={completedReports} />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">{tReports('list.myReports')}</h2>
            {totalReports > RECENT_REPORTS_LIMIT ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/reports">{tActions('viewDetail')}</Link>
              </Button>
            ) : null}
          </div>

          {recentReports.length === 0 ? (
            <EmptyState
              title={tReports('emptyStates.noReports')}
              action={
                <Button asChild>
                  <Link href="/dashboard/reports/create">{t('user.createReport')}</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
