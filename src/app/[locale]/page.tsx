import { useTranslations } from 'next-intl'

export default function HomePage(): React.ReactElement {
  const t = useTranslations('common.home')
  const common = useTranslations('common')

  return (
    <main className="min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-primary)/12,transparent_32rem),linear-gradient(135deg,var(--background),var(--muted))]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16 sm:px-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:py-24">
        <div className="space-y-8">
          <div className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
            {t('eyebrow')}
          </div>

          <div className="space-y-6">
            <h1 className="text-foreground max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">{t('title')}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-8 text-pretty sm:text-xl">{t('description')}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#report"
              className="bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/25 inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t('primaryCta')}
            </a>
            <a
              href="#map"
              className="border-border bg-background/75 text-foreground hover:bg-accent inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold shadow-sm backdrop-blur transition hover:-translate-y-0.5"
            >
              {t('secondaryCta')}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="bg-primary/10 absolute -inset-4 rounded-[2.5rem] blur-3xl" aria-hidden="true" />
          <div className="border-border/70 bg-background/75 relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-primary text-primary-foreground rounded-3xl p-5 shadow-lg">
                <p className="text-4xl font-semibold">24</p>
                <p className="text-primary-foreground/80 mt-3 text-sm leading-5">{t('stats.reportsLabel')}</p>
              </div>
              <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
                <p className="text-foreground text-4xl font-semibold">4</p>
                <p className="text-muted-foreground mt-3 text-sm leading-5">{t('stats.rolesLabel')}</p>
              </div>
              <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
                <p className="text-foreground text-4xl font-semibold">8</p>
                <p className="text-muted-foreground mt-3 text-sm leading-5">{t('stats.trackingLabel')}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="border-border bg-card/80 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.locationTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.locationDescription')}</p>
              </article>
              <article className="border-border bg-card/80 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.evidenceTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.evidenceDescription')}</p>
              </article>
              <article className="border-border bg-card/80 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.workflowTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.workflowDescription')}</p>
              </article>
            </div>

            <p className="bg-muted text-muted-foreground mt-6 rounded-2xl px-4 py-3 text-sm font-medium">{common('app.tagline')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
