import { Archive, ClipboardCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/shared/empty-state'
import { requireRole } from '@/lib/auth'
import { toOfficerTaskListItemDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { TaskCard } from '@/features/officer/components/task-card'

import type { OfficerTaskListItemDto } from '@/types/report'

interface OfficerHistoryContentProps {
  tasks: OfficerTaskListItemDto[]
}

function OfficerHistoryContent({ tasks }: OfficerHistoryContentProps): React.ReactElement {
  const t = useTranslations('reports.officer')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="bg-card/95 shadow-primary/5 rounded-3xl border p-6 shadow-xl sm:p-8">
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="bg-background/70 text-muted-foreground flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <Archive className="text-primary size-3.5" aria-hidden="true" />
              {t('historyEyebrow')}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">{t('historyTitle')}</h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">{t('historyDescription')}</p>
            </div>
          </div>
        </section>

        {tasks.length === 0 ? (
          <EmptyState title={t('emptyHistoryTitle')} description={t('emptyHistoryDescription')} icon={ClipboardCheck} />
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default async function OfficerHistoryPage(): Promise<React.ReactElement> {
  const authResult = await requireRole([UserRole.OFFICER])

  if (!authResult.success) {
    notFound()
  }

  const tasks = await prisma.assignment.findMany({
    where: {
      officerId: authResult.profile.id,
      OR: [
        { isActive: false },
        {
          report: {
            status: {
              in: [ReportStatus.NEED_REVIEW, ReportStatus.COMPLETED, ReportStatus.CANCELLED]
            }
          }
        }
      ]
    },
    include: {
      report: {
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true }
          },
          photos: {
            orderBy: { createdAt: 'asc' },
            take: 1
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return <OfficerHistoryContent tasks={tasks.map(toOfficerTaskListItemDto)} />
}
