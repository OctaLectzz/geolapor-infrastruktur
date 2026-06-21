import { useTranslations } from 'next-intl'

import { AppLogo } from '@/components/shared/app-logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'

import type { ReportStatus } from '@generated/prisma/enums'

interface PublicStats {
  total: number
  verified: number
  completed: number
  inProgress: number
}

interface CategoryPreview {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const publicStatuses: ReportStatus[] = ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'NEED_REVIEW', 'COMPLETED']

    const [total, verified, completed, inProgress] = await prisma.$transaction([
      prisma.report.count({ where: { status: { in: publicStatuses } } }),
      prisma.report.count({ where: { status: 'VERIFIED' } }),
      prisma.report.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: { in: ['ASSIGNED', 'IN_PROGRESS', 'NEED_REVIEW'] } } })
    ])

    return { total, verified, completed, inProgress }
  } catch {
    return null
  }
}

async function getCategories(): Promise<CategoryPreview[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, icon: true, description: true },
      orderBy: { name: 'asc' },
      take: 8
    })

    return categories
  } catch {
    return []
  }
}

const STEP_ICONS = ['📸', '✅', '🔧', '📍'] as const
const STEP_NUMBERS = ['01', '02', '03', '04'] as const

export default async function HomePage(): Promise<React.ReactElement> {
  const [stats, categories] = await Promise.all([getPublicStats(), getCategories()])

  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <PublicStatsSection stats={stats} />
        <HowItWorksSection />
        <CategoryPreviewSection categories={categories} />
        <MapPreviewSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  )
}

function LandingHeader(): React.ReactElement {
  const t = useTranslations('common.navigation')

  return (
    <header className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t('home')}>
          <AppLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t('publicNavigation')}>
          <Button variant="ghost" asChild>
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/map">{t('map')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/help">{t('help')}</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function HeroSection(): React.ReactElement {
  const t = useTranslations('common.home')
  const common = useTranslations('common')

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="bg-primary/8 dark:bg-primary/4 absolute inset-0" aria-hidden="true" />
      <div className="bg-primary/12 absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-20 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
        <div className="space-y-8">
          <div className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
            {t('eyebrow')}
          </div>

          <div className="space-y-6">
            <h1 className="text-foreground max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{t('title')}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">{t('description')}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="rounded-full px-8 shadow-lg">
              <Link href="/login">{t('primaryCta')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8">
              <Link href="/map">{t('secondaryCta')}</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="bg-primary/10 absolute -inset-4 rounded-[2.5rem] blur-3xl" aria-hidden="true" />
          <div className="border-border/70 bg-background/75 relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-lg">
                <p className="text-4xl font-bold">24</p>
                <p className="text-primary-foreground/80 mt-3 text-sm leading-5">{t('stats.reportsLabel')}</p>
              </div>
              <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
                <p className="text-foreground text-4xl font-bold">4</p>
                <p className="text-muted-foreground mt-3 text-sm leading-5">{t('stats.rolesLabel')}</p>
              </div>
              <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
                <p className="text-foreground text-4xl font-bold">8</p>
                <p className="text-muted-foreground mt-3 text-sm leading-5">{t('stats.trackingLabel')}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <article className="border-border bg-card/80 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.locationTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.locationDescription')}</p>
              </article>
              <article className="border-border bg-card/80 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.evidenceTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.evidenceDescription')}</p>
              </article>
              <article className="border-border bg-card/80 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h2 className="text-foreground text-lg font-semibold">{t('features.workflowTitle')}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{t('features.workflowDescription')}</p>
              </article>
            </div>

            <p className="bg-muted text-muted-foreground mt-6 rounded-xl px-4 py-3 text-sm font-medium">{common('app.tagline')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PublicStatsSection({ stats }: { stats: PublicStats | null }): React.ReactElement {
  const t = useTranslations('common.home.publicStats')

  const statItems = stats
    ? [
        { label: t('totalReports'), value: stats.total },
        { label: t('verified'), value: stats.verified },
        { label: t('inProgress'), value: stats.inProgress },
        { label: t('completed'), value: stats.completed }
      ]
    : []

  return (
    <section id="stats" className="bg-muted/40 border-y">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">{t('description')}</p>
        </div>

        {stats ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
              <Card key={item.label} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-primary text-4xl font-bold tabular-nums">{item.value.toLocaleString()}</p>
                  <p className="text-muted-foreground mt-2 text-sm font-medium">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-12 text-center text-sm">{t('loadError')}</p>
        )}
      </div>
    </section>
  )
}

function HowItWorksSection(): React.ReactElement {
  const t = useTranslations('common.home.howItWorks')

  const steps = STEP_NUMBERS.map((number, index) => ({
    number,
    icon: STEP_ICONS[index],
    title: t(`step${index + 1}Title` as 'step1Title' | 'step2Title' | 'step3Title' | 'step4Title'),
    description: t(`step${index + 1}Description` as 'step1Description' | 'step2Description' | 'step3Description' | 'step4Description')
  }))

  return (
    <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">{t('description')}</p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.number} className="group relative text-center">
            <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-2xl text-2xl shadow-sm transition group-hover:scale-105 group-hover:shadow-md">
              {step.icon}
            </div>
            <Badge variant="secondary" className="mt-4">
              {step.number}
            </Badge>
            <h3 className="text-foreground mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoryPreviewSection({ categories }: { categories: CategoryPreview[] }): React.ReactElement {
  const t = useTranslations('common.home.categoryPreview')

  return (
    <section id="categories" className="bg-muted/40 border-y">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">{t('description')}</p>
        </div>

        {categories.length > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {category.icon ? (
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {category.icon}
                      </span>
                    ) : (
                      <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl text-sm font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <CardTitle className="text-base">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                {category.description ? (
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{category.description}</p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-12 text-center text-sm">{t('empty')}</p>
        )}
      </div>
    </section>
  )
}

function MapPreviewSection(): React.ReactElement {
  const t = useTranslations('common.home.mapPreview')

  return (
    <section id="map-preview" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">{t('description')}</p>
      </div>

      <div className="mt-12">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/60 flex aspect-[16/7] items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl text-3xl">🗺️</div>
                <p className="text-muted-foreground max-w-md text-sm">{t('description')}</p>
                <Button asChild className="rounded-full px-8">
                  <Link href="/map">{t('openMap')}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function CtaSection(): React.ReactElement {
  const t = useTranslations('common.home')
  const actions = useTranslations('common.actions')

  return (
    <section id="cta" className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
        <p className="text-primary-foreground/80 mx-auto mt-4 max-w-2xl text-lg">{t('description')}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" variant="secondary" asChild className="rounded-full px-8 shadow-lg">
            <Link href="/login">{actions('getStarted')}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8"
          >
            <Link href="/map">{actions('viewMap')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function LandingFooter(): React.ReactElement {
  const t = useTranslations('common.home.footer')
  const app = useTranslations('common.app')
  const currentYear = new Date().getFullYear().toString()

  return (
    <footer className="bg-muted/40 border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <AppLogo showTagline />
            <p className="text-muted-foreground text-sm">{t('builtWith')}</p>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/help" className="text-muted-foreground hover:text-foreground text-sm transition">
              {t('links.contact')}
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground text-sm transition">
              {t('links.privacy')}
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground text-sm transition">
              {t('links.terms')}
            </Link>
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-sm">{t('copyright', { year: currentYear })}</p>
          <p className="text-muted-foreground text-xs">{app('tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
