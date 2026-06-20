import { useLocale, useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

import type { ReportStatusHistoryDto } from '@/types/report'

interface ReportTimelineProps {
  histories: ReportStatusHistoryDto[]
  className?: string
}

function formatDateTime(isoDate: string, locale: string): string {
  const date = new Date(isoDate)

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ReportTimeline({ histories, className }: ReportTimelineProps): React.ReactNode {
  const t = useTranslations('reports.detail')
  const locale = useLocale()

  if (histories.length === 0) {
    return null
  }

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <h3 className="text-foreground text-lg font-semibold">{t('timeline')}</h3>
      <ol className="border-border relative ml-3 border-l-2" aria-label={t('timeline')}>
        {histories.map((entry, index) => {
          const isLatest = index === histories.length - 1

          return (
            <li key={entry.id} className="relative mb-6 ml-6 last:mb-0">
              <span
                className={cn(
                  'ring-background absolute -left-6.5 flex size-3 items-center justify-center rounded-full ring-4',
                  isLatest ? 'bg-primary' : 'bg-muted-foreground/40'
                )}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={entry.status as ReportStatusValue} />
                  <time className="text-muted-foreground text-xs" dateTime={entry.createdAt}>
                    {formatDateTime(entry.createdAt, locale)}
                  </time>
                </div>
                {entry.note ? <p className="text-muted-foreground text-sm leading-relaxed">{entry.note}</p> : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
