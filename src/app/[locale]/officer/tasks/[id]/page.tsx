import { ArrowLeft, CalendarClock, MapPin, Wrench } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { requireRole } from '@/lib/auth'
import { toOfficerTaskDetailDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@generated/prisma/enums'

import { OfficerTaskDetailClient } from '@/features/officer/components/officer-task-detail-client'
import { ReportTimeline } from '@/features/reports/components/report-timeline'

import type { OfficerTaskDetailDto } from '@/types/report'

interface OfficerTaskDetailPageProps {
  params: Promise<{
    id: string
  }>
}

function formatDate(value: string | null, locale: string): string {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export default async function OfficerTaskDetailPage({ params }: OfficerTaskDetailPageProps): Promise<React.ReactElement> {
  const authResult = await requireRole([UserRole.OFFICER])

  if (!authResult.success) {
    notFound()
  }

  const { id } = await params
  const task = await prisma.assignment.findUnique({
    where: { id },
    include: {
      fieldUpdates: {
        orderBy: { createdAt: 'desc' }
      },
      report: {
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true }
          },
          photos: {
            orderBy: { createdAt: 'asc' }
          },
          histories: {
            orderBy: { createdAt: 'asc' }
          }
        }
      }
    }
  })

  if (!task || task.officerId !== authResult.profile.id) {
    notFound()
  }

  return <OfficerTaskDetailContent task={toOfficerTaskDetailDto(task)} />
}

function OfficerTaskDetailContent({ task }: { task: OfficerTaskDetailDto }): React.ReactElement {
  const t = useTranslations('reports.officer')
  const tCommon = useTranslations('common.actions')
  const locale = useLocale()

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" className="w-fit" asChild>
            <Link href="/officer/tasks">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {tCommon('back')}
            </Link>
          </Button>

          <div className="bg-card/95 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
            <div className="from-primary via-info to-success absolute inset-x-0 top-0 h-1 bg-linear-to-r" aria-hidden="true" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex max-w-3xl flex-col gap-2">
                <p className="text-muted-foreground font-mono text-xs font-medium tracking-[0.18em] uppercase">{task.reportCode}</p>
                <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">{task.title}</h1>
                <p className="text-muted-foreground text-sm leading-6 sm:text-base">{task.description}</p>
              </div>
              <StatusBadge status={task.status as ReportStatusValue} className="shrink-0" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="text-primary size-4" aria-hidden="true" />
                  {task.category.name}
                </CardTitle>
                <CardDescription>{t('assignedTask')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <MetadataTile
                  icon={<MapPin className="size-4" aria-hidden="true" />}
                  label={t('address')}
                  value={task.address ?? t('unknownAddress')}
                />
                <MetadataTile
                  icon={<CalendarClock className="size-4" aria-hidden="true" />}
                  label={t('dueDate')}
                  value={formatDate(task.dueDate, locale)}
                />
              </CardContent>
            </Card>

            <EvidenceSection task={task} />

            <OfficerTaskDetailClient task={task} />
          </div>

          <aside className="flex flex-col gap-6">
            <Card className="border-primary/10 bg-card/95">
              <CardHeader>
                <CardTitle className="text-base">{t('taskBriefTitle')}</CardTitle>
                <CardDescription>{task.reportCode}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <MetadataRow label={t('assignedAt')} value={formatDate(task.createdAt, locale)} />
                <MetadataRow label={t('updatedAt')} value={formatDate(task.updatedAt, locale)} />
                <MetadataRow label={t('dueDate')} value={formatDate(task.dueDate, locale)} />
              </CardContent>
            </Card>

            <ReportTimeline histories={task.histories} />
          </aside>
        </div>
      </div>
    </main>
  )
}

function EvidenceSection({ task }: { task: OfficerTaskDetailDto }): React.ReactElement {
  const t = useTranslations('reports.detail')
  const tEmpty = useTranslations('reports.emptyStates')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('evidence')}</CardTitle>
      </CardHeader>
      <CardContent>
        {task.photos.length === 0 ? (
          <p className="text-muted-foreground text-sm">{tEmpty('noEvidence')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {task.photos.map((photo) => (
              <div key={photo.id} className="bg-muted relative aspect-video overflow-hidden rounded-xl border">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? t('evidence')}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetadataTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }): React.ReactElement {
  return (
    <div className="bg-muted/30 rounded-xl border p-4">
      <div className="text-primary mb-2 flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>
      <p className="text-foreground text-sm leading-6">{value}</p>
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}
