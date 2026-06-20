import { CalendarClock, MapPin, Navigation, Wrench } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { OfficerTaskListItemDto } from '@/types/report'

interface TaskCardProps {
  task: OfficerTaskListItemDto
  href?: string
  className?: string
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

export function TaskCard({ task, href = `/officer/tasks/${task.id}`, className }: TaskCardProps): React.ReactElement {
  const t = useTranslations('reports.officer')
  const locale = useLocale()

  return (
    <Card
      className={cn(
        'group border-primary/10 bg-card/95 hover:border-primary/30 hover:shadow-primary/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
    >
      <div className="from-primary via-info to-success h-1 bg-linear-to-r" />
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-muted-foreground font-mono text-xs font-medium tracking-[0.18em] uppercase">{task.reportCode}</p>
            <h2 className="text-foreground line-clamp-2 text-lg font-semibold tracking-tight">{task.title}</h2>
          </div>
          <StatusBadge status={task.status as ReportStatusValue} className="shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{task.description}</p>

        <div className="grid gap-3 text-sm">
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2">
            <Wrench className="text-primary size-4" aria-hidden="true" />
            <span className="text-foreground font-medium">{task.category.name}</span>
          </div>
          <div className="bg-muted/50 flex items-start gap-3 rounded-lg px-3 py-2">
            <MapPin className="text-info mt-0.5 size-4" aria-hidden="true" />
            <span className="text-muted-foreground line-clamp-2">{task.address ?? t('unknownAddress')}</span>
          </div>
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2">
            <CalendarClock className="text-warning size-4" aria-hidden="true" />
            <span className="text-muted-foreground">{t('dueDateValue', { value: formatDate(task.dueDate, locale) })}</span>
          </div>
        </div>

        {task.note ? <p className="border-primary/40 text-muted-foreground border-l-2 pl-3 text-sm">{task.note}</p> : null}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full justify-between">
          <Link href={href}>
            {t('viewTask')}
            <Navigation className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
