import { useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { toReportListItemDto } from '@/lib/report-dto'

import type { ReportListItemDto } from '@/types/report'

interface AdminStatCardProps {
  label: string
  value: number
  accent?: boolean
}

function AdminStatCard({ label, value, accent }: AdminStatCardProps): React.ReactElement {
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

const RECENT_PENDING_LIMIT = 5

export default async function AdminOverviewPage(): Promise<React.ReactElement> {
  const [totalReports, pendingReports, verifiedReports, inProgressReports, needReviewReports, completedReports, rejectedReports, recentPending] =
    await prisma.$transaction([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.report.count({ where: { status: 'VERIFIED' } }),
      prisma.report.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.report.count({ where: { status: 'NEED_REVIEW' } }),
      prisma.report.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
      prisma.report.findMany({
        where: { status: 'PENDING_VERIFICATION' },
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
        take: RECENT_PENDING_LIMIT
      })
    ])

  return (
    <AdminOverviewContent
      totalReports={totalReports}
      pendingReports={pendingReports}
      verifiedReports={verifiedReports}
      inProgressReports={inProgressReports}
      needReviewReports={needReviewReports}
      completedReports={completedReports}
      rejectedReports={rejectedReports}
      recentPending={recentPending.map(toReportListItemDto)}
    />
  )
}

interface AdminOverviewContentProps {
  totalReports: number
  pendingReports: number
  verifiedReports: number
  inProgressReports: number
  needReviewReports: number
  completedReports: number
  rejectedReports: number
  recentPending: ReportListItemDto[]
}

function AdminOverviewContent({
  totalReports,
  pendingReports,
  verifiedReports,
  inProgressReports,
  needReviewReports,
  completedReports,
  rejectedReports,
  recentPending
}: AdminOverviewContentProps): React.ReactElement {
  const t = useTranslations('dashboard.admin')
  const tStats = useTranslations('dashboard.stats')
  const tColumns = useTranslations('dashboard.tables.columns')
  const tActions = useTranslations('dashboard.admin.actions')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t('title')}>
          <AdminStatCard label={tStats('totalReports')} value={totalReports} accent />
          <AdminStatCard label={tStats('pendingVerification')} value={pendingReports} />
          <AdminStatCard label={tStats('verifiedReports')} value={verifiedReports} />
          <AdminStatCard label={tStats('inProgressReports')} value={inProgressReports} />
          <AdminStatCard label={tStats('needReview')} value={needReviewReports} />
          <AdminStatCard label={tStats('completedReports')} value={completedReports} />
          <AdminStatCard label={tStats('rejectedReports')} value={rejectedReports} />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">{t('pendingReports')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reports/verification">{tActions('review')}</Link>
            </Button>
          </div>

          {recentPending.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">{t('empty.pendingReports')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tColumns('code')}</TableHead>
                    <TableHead>{tColumns('title')}</TableHead>
                    <TableHead>{tColumns('category')}</TableHead>
                    <TableHead>{tColumns('status')}</TableHead>
                    <TableHead>{tColumns('createdAt')}</TableHead>
                    <TableHead className="text-right">{tColumns('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPending.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">{report.reportCode}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">{report.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{report.category.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={report.status as ReportStatusValue} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/reports/${report.id}`}>{tActions('review')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
