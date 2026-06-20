import { ClipboardList, RadioTower } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { requireRole } from '@/lib/auth'
import { toOfficerTaskListItemDto } from '@/lib/officer-task-dto'
import { prisma } from '@/lib/prisma'
import { ReportStatus, UserRole } from '@generated/prisma/enums'

import { TaskCard } from '@/features/officer/components/task-card'

import type { OfficerTaskListItemDto } from '@/types/report'

interface OfficerTasksContentProps {
  tasks: OfficerTaskListItemDto[]
}

function OfficerTasksContent({ tasks }: OfficerTasksContentProps): React.ReactElement {
  const t = useTranslations('reports.officer')
  const tEmpty = useTranslations('reports.emptyStates')

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="bg-card/95 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8">
          <div className="from-primary via-info to-success absolute inset-x-0 top-0 h-1 bg-linear-to-r" aria-hidden="true" />
          <div className="bg-primary/10 absolute -top-20 -right-16 size-56 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <div className="bg-background/70 text-muted-foreground flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                <RadioTower className="text-primary size-3.5" aria-hidden="true" />
                {t('tasksEyebrow')}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">{t('tasksTitle')}</h1>
                <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">{t('tasksDescription')}</p>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5 lg:min-w-48">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">{t('activeTasks')}</p>
                <p className="text-foreground mt-2 text-3xl font-semibold">{tasks.length}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {tasks.length === 0 ? (
          <EmptyState title={tEmpty('noAssignedTasks')} description={t('emptyTasksDescription')} icon={ClipboardList} />
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

export default async function OfficerTasksPage(): Promise<React.ReactElement> {
  const authResult = await requireRole([UserRole.OFFICER])

  if (!authResult.success) {
    notFound()
  }

  const tasks = await prisma.assignment.findMany({
    where: {
      officerId: authResult.profile.id,
      isActive: true,
      report: {
        status: {
          in: [ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS]
        }
      }
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
    orderBy: { createdAt: 'desc' }
  })

  return <OfficerTasksContent tasks={tasks.map(toOfficerTaskListItemDto)} />
}
