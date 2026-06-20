import { useTranslations } from 'next-intl'

import { ReportForm } from '@/features/reports/components/report-form'

export default function CreateReportPage(): React.ReactElement {
  const t = useTranslations('reports.form')

  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-primary/10 absolute inset-x-6 top-0 -z-10 h-52 rounded-full blur-3xl" />
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">{t('eyebrow')}</p>
            <div className="flex flex-col gap-3">
              <h1 className="text-foreground max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t('title')}</h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7">{t('description')}</p>
            </div>
          </div>
          <aside className="border-primary/15 bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur">
            <p className="text-foreground text-sm font-medium">{t('guidance.title')}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{t('guidance.description')}</p>
          </aside>
        </section>

        <ReportForm />
      </div>
    </main>
  )
}
