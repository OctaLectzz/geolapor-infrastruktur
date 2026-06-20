import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toReportDetailDto } from '@/lib/report-dto'
import { UserRole } from '../../../../../../generated/prisma/enums'

import { ReportTimeline } from '@/features/reports/components/report-timeline'

import type { ReportDetailDto } from '@/types/report'

interface ReportDetailPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

interface ReportAssignmentAccessRecord {
  officerId: string
  isActive: boolean
}

interface ReportAccessRecord {
  reporterId: string
  assignments: ReportAssignmentAccessRecord[]
}

function canReadReport(report: ReportAccessRecord, profileId: string, role: UserRole): boolean {
  if (role === UserRole.ADMIN || role === UserRole.SUPERADMIN) {
    return true
  }

  if (report.reporterId === profileId) {
    return true
  }

  if (role === UserRole.OFFICER) {
    return report.assignments.some((assignment) => assignment.isActive && assignment.officerId === profileId)
  }

  return false
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params
  const authResult = await requireAuth()

  if (!authResult.success) {
    notFound()
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true, icon: true }
      },
      photos: {
        orderBy: { createdAt: 'asc' }
      },
      histories: {
        orderBy: { createdAt: 'asc' }
      },
      assignments: {
        select: { officerId: true, isActive: true }
      }
    }
  })

  if (!report) {
    notFound()
  }

  if (!canReadReport(report, authResult.profile.id, authResult.profile.role)) {
    notFound()
  }

  const dto = toReportDetailDto(report)

  return <ReportDetailContent report={dto} />
}

interface ReportDetailContentProps {
  report: ReportDetailDto
}

function ReportDetailContent({ report }: ReportDetailContentProps): React.ReactElement {
  const t = useTranslations('reports.detail')
  const tCommon = useTranslations('common.actions')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" className="w-fit" asChild>
            <Link href="/dashboard/reports">← {tCommon('back')}</Link>
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm font-medium">
                {t('reportCode')}: {report.reportCode}
              </p>
              <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{report.title}</h1>
            </div>
            <StatusBadge status={report.status as ReportStatusValue} className="shrink-0" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{report.category.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-foreground text-sm leading-relaxed">{report.description}</p>

                {report.address ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs font-medium">{t('location')}</p>
                    <p className="text-foreground text-sm">{report.address}</p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground text-xs font-medium">{t('location')}</p>
                  <p className="text-foreground font-mono text-sm">
                    {report.latitude}, {report.longitude}
                  </p>
                </div>
              </CardContent>
            </Card>

            {report.status === 'REJECTED' ? <RejectionNoteAlert report={report} /> : null}

            <EvidenceSection report={report} />
          </div>

          <div className="flex flex-col gap-6">
            <MetadataCard report={report} />
            <ReportTimeline histories={report.histories} />
          </div>
        </div>
      </div>
    </main>
  )
}

function RejectionNoteAlert({ report }: { report: ReportDetailDto }): React.ReactElement | null {
  const t = useTranslations('reports.detail')
  const rejectionEntry = [...report.histories].reverse().find((entry) => entry.status === 'REJECTED' && entry.note)

  if (!rejectionEntry?.note) {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>{t('rejectionNote')}</AlertTitle>
      <AlertDescription>{rejectionEntry.note}</AlertDescription>
    </Alert>
  )
}

function EvidenceSection({ report }: { report: ReportDetailDto }): React.ReactElement {
  const t = useTranslations('reports.detail')
  const tEmpty = useTranslations('reports.emptyStates')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('evidence')}</CardTitle>
      </CardHeader>
      <CardContent>
        {report.photos.length === 0 ? (
          <p className="text-muted-foreground text-sm">{tEmpty('noEvidence')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {report.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-video overflow-hidden rounded-lg border">
                <Image src={photo.url} alt={photo.caption ?? t('evidence')} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetadataCard({ report }: { report: ReportDetailDto }): React.ReactElement {
  const t = useTranslations('reports.detail')

  return (
    <Card className="border-primary/10 bg-card/95">
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
        <CardDescription>{report.reportCode}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <MetadataRow label={t('createdAt')} value={new Date(report.createdAt).toLocaleDateString()} />
        <MetadataRow label={t('updatedAt')} value={new Date(report.updatedAt).toLocaleDateString()} />
      </CardContent>
    </Card>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}
