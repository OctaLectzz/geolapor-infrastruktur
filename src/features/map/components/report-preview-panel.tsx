'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'

import type { PublicReportListItemDto } from '@/types/report'

interface ReportPreviewPanelProps {
  report: PublicReportListItemDto | null
  onClose: () => void
}

const STATUS_VARIANT_MAP: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  VERIFIED: 'default',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'outline',
  NEED_REVIEW: 'outline',
  COMPLETED: 'default'
}

export function ReportPreviewPanel({ report, onClose }: ReportPreviewPanelProps): React.ReactElement | null {
  const t = useTranslations('common.publicMap.preview')
  const statusT = useTranslations('common.publicMap.status')

  if (!report) {
    return null
  }

  const statusKey = report.status as keyof typeof STATUS_VARIANT_MAP
  const variant = STATUS_VARIANT_MAP[statusKey] ?? 'secondary'

  return (
    <Card className="absolute bottom-4 inset-x-4 md:bottom-auto md:top-4 md:right-4 md:left-auto md:inset-x-auto z-[1000] w-auto max-w-sm md:w-80 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-sm">{report.title}</CardTitle>
          <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label={t('close')}>
            ✕
          </Button>
        </div>
        <Badge variant={variant} className="w-fit text-xs">
          {statusT(report.status as 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'NEED_REVIEW' | 'COMPLETED')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {report.photo ? (
          <div className="bg-muted aspect-video overflow-hidden rounded-lg">
            <Image
              src={report.photo.url}
              alt={report.photo.caption ?? report.title}
              className="size-full object-cover"
              width={320}
              height={180}
              unoptimized
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <p className="text-muted-foreground line-clamp-2 text-xs">{report.description}</p>
          <p className="text-muted-foreground text-xs">{report.address ?? t('noAddress')}</p>
        </div>

        {report.category ? (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              {report.category.icon ? (
                <span className="text-sm" role="img" aria-hidden="true">
                  {report.category.icon}
                </span>
              ) : null}
              <span className="text-muted-foreground text-xs">{report.category.name}</span>
            </div>
          </>
        ) : null}

        <Button size="sm" asChild className="w-full">
          <Link href={`/reports/${report.id}`}>{t('viewDetail')}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
