'use client'

import { useState } from 'react'

import { Camera, Clock3, ExternalLink } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProgressUpdateForm } from '@/features/officer/components/progress-update-form'

import type { FieldUpdateDto, OfficerTaskDetailDto } from '@/types/report'

interface OfficerTaskDetailClientProps {
  task: OfficerTaskDetailDto
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function OfficerTaskDetailClient({ task }: OfficerTaskDetailClientProps): React.ReactElement {
  const [currentTask, setCurrentTask] = useState(task)
  const t = useTranslations('reports.officer')
  const locale = useLocale()

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentTask.latitude},${currentTask.longitude}`)}`

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/20 bg-card/95">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{t('fieldStatusTitle')}</CardTitle>
            <p className="text-muted-foreground text-sm">{t('fieldStatusDescription')}</p>
          </div>
          <StatusBadge status={currentTask.status as ReportStatusValue} />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" asChild>
            <a id="officer-task-open-location" href={mapUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              {t('openLocation')}
            </a>
          </Button>
          <div className="bg-muted/30 rounded-lg border px-3 py-2 text-sm">
            <p className="text-muted-foreground">{t('coordinates')}</p>
            <p className="text-foreground font-mono">
              {currentTask.latitude}, {currentTask.longitude}
            </p>
          </div>
        </CardContent>
      </Card>

      <ProgressUpdateForm task={currentTask} onTaskUpdated={setCurrentTask} />

      <FieldUpdateList updates={currentTask.fieldUpdates} locale={locale} />
    </div>
  )
}

function FieldUpdateList({ updates, locale }: { updates: FieldUpdateDto[]; locale: string }): React.ReactElement {
  const t = useTranslations('reports.officer')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('fieldUpdatesTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('emptyFieldUpdates')}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {updates.map((update) => (
              <FieldUpdateItem key={update.id} update={update} locale={locale} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FieldUpdateItem({ update, locale }: { update: FieldUpdateDto; locale: string }): React.ReactElement {
  const t = useTranslations('reports.officer')

  return (
    <article className="bg-card rounded-xl border p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock3 className="size-4" aria-hidden="true" />
            {formatDate(update.createdAt, locale)}
          </div>
          <span className="text-foreground font-mono text-sm font-semibold">{update.progress}%</span>
        </div>
        <Progress value={update.progress} className="h-2" />
        <p className="text-foreground text-sm leading-relaxed">{update.note}</p>
        {update.photoUrl ? (
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <a href={update.photoUrl} target="_blank" rel="noreferrer">
              <Camera className="size-4" aria-hidden="true" />
              {t('viewProgressPhoto')}
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  )
}
