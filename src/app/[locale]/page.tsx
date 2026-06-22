import { useTranslations } from 'next-intl'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Globe,
  HelpCircle,
  Map,
  MapPin,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  Zap
} from 'lucide-react'

import { AppLogo } from '@/components/shared/app-logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { MobileNav } from '@/components/shared/mobile-nav'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { getRoleRedirectPath } from '@/features/auth/utils/role-redirect'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { toPublicReportListItemDto } from '@/lib/public-report-dto'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MapPreviewClient } from '@/features/map/components/map-preview-client'
import { FadeIn, AnimatedContainer, AnimatedItem } from '@/components/shared/animated-entrance'

import type { ReportStatus } from '@generated/prisma/enums'
import type { PublicReportListItemDto } from '@/types/report'

export const dynamic = 'force-dynamic'

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
      take: 6
    })

    return categories
  } catch {
    return []
  }
}

async function getPublicReports(): Promise<PublicReportListItemDto[]> {
  try {
    const publicStatuses: ReportStatus[] = ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'NEED_REVIEW', 'COMPLETED']
    const reports = await prisma.report.findMany({
      where: { status: { in: publicStatuses } },
      select: {
        id: true,
        reportCode: true,
        title: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        category: { select: { id: true, name: true, slug: true, icon: true } },
        region: { select: { id: true, province: true, city: true, district: true, village: true } },
        photos: {
          select: { id: true, url: true, type: true, caption: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
          take: 1
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 40
    })

    return reports.map(toPublicReportListItemDto)
  } catch {
    return []
  }
}

function getStepIcon(index: number): React.ReactNode {
  const cls = 'size-6'
  switch (index) {
    case 0:
      return <Camera className={cls} />
    case 1:
      return <ShieldCheck className={cls} />
    case 2:
      return <Wrench className={cls} />
    case 3:
      return <Compass className={cls} />
    default:
      return <HelpCircle className={cls} />
  }
}

const STEP_NUMBERS = ['01', '02', '03', '04'] as const

export default async function HomePage(): Promise<React.ReactElement> {
  const [stats, categories, reports] = await Promise.all([
    getPublicStats(),
    getCategories(),
    getPublicReports()
  ])

  let dashboardPath: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const profile = await prisma.userProfile.findUnique({
        where: { supabaseUserId: user.id }
      })

      if (profile) {
        dashboardPath = getRoleRedirectPath(profile.role)
      }
    }
  } catch (err) {
    console.error('Failed to resolve auth session on home page:', err)
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader dashboardPath={dashboardPath} />
      <main>
        <HeroSection dashboardPath={dashboardPath} stats={stats} />
        <HowItWorksSection />
        <CategoryPreviewSection categories={categories} />
        <MapPreviewSection reports={reports} />
        <CtaSection dashboardPath={dashboardPath} />
      </main>
      <LandingFooter />
    </div>
  )
}

/* ─────────────────────────── HEADER ─────────────────────────── */

function LandingHeader({ dashboardPath }: { dashboardPath: string | null }): React.ReactElement {
  const t = useTranslations('common.navigation')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label={t('home')} className="shrink-0">
          <AppLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label={t('publicNavigation')}>
          <Button variant="ghost" size="sm" asChild className="rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
            <Link href="/map" className="flex items-center gap-1.5">
              <Map className="size-3.5" />
              {t('map')}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
            <Link href="/help" className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5" />
              {t('help')}
            </Link>
          </Button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden md:flex">
            {dashboardPath ? (
              <Button size="sm" asChild variant="outline" className="rounded-full">
                <Link href={dashboardPath}>{t('dashboard')}</Link>
              </Button>
            ) : (
              <Button size="sm" asChild className="rounded-full shadow-sm">
                <Link href="/login">{t('login')}</Link>
              </Button>
            )}
          </div>
          <MobileNav dashboardPath={dashboardPath} />
        </div>
      </div>
    </header>
  )
}

/* ─────────────────────────── HERO ─────────────────────────── */

function HeroSection({ dashboardPath, stats }: { dashboardPath: string | null; stats: PublicStats | null }): React.ReactElement {
  const t = useTranslations('common.home')
  const statsT = useTranslations('common.home.publicStats')

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(var(--primary)/0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(var(--primary)/0.06),transparent)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(var(--border)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="flex flex-col items-center text-center">
          <FadeIn y={20}>
            <Badge variant="secondary" className="mb-8 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <span className="relative mr-2 flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              {t('eyebrow')}
            </Badge>
          </FadeIn>

          <FadeIn y={30} delay={0.05}>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {t('title')}
            </h1>
          </FadeIn>

          <FadeIn y={25} delay={0.1}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
              {t('description')}
            </p>
          </FadeIn>

          <FadeIn y={20} delay={0.15}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" asChild className="rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                <Link href={dashboardPath ?? '/login'}>
                  {t('primaryCta')}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-sm font-semibold transition-all hover:-translate-y-0.5">
                <Link href="/map">
                  <MapPin className="mr-2 size-4" />
                  {t('secondaryCta')}
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Stats row */}
          {stats && (
            <FadeIn y={20} delay={0.25} className="mt-16 w-full max-w-3xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <StatChip icon={<FileText className="size-4" />} value={stats.total} label={statsT('totalReports')} />
                <StatChip icon={<ShieldCheck className="size-4" />} value={stats.verified} label={statsT('verified')} />
                <StatChip icon={<TrendingUp className="size-4" />} value={stats.inProgress} label={statsT('inProgress')} />
                <StatChip icon={<CheckCircle2 className="size-4" />} value={stats.completed} label={statsT('completed')} />
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  )
}

function StatChip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-4 py-5 shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-md">
      <div className="text-primary">{icon}</div>
      <span className="text-2xl font-extrabold tabular-nums text-foreground sm:text-3xl">{value.toLocaleString()}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */

function HowItWorksSection(): React.ReactElement {
  const t = useTranslations('common.home.howItWorks')

  const steps = STEP_NUMBERS.map((number, idx) => ({
    number,
    icon: getStepIcon(idx),
    title: t(`step${idx + 1}Title` as 'step1Title' | 'step2Title' | 'step3Title' | 'step4Title'),
    description: t(`step${idx + 1}Description` as 'step1Description' | 'step2Description' | 'step3Description' | 'step4Description')
  }))

  return (
    <section id="how-it-works" className="border-t border-border/40 bg-muted/30 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t('title')}</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t('description')}</p>
        </FadeIn>

        <AnimatedContainer className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8" delay={0.1}>
          {steps.map((step) => (
            <AnimatedItem key={step.number}>
              <div className="group relative flex h-full flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                {/* Step number */}
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-primary-foreground">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mt-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="mt-5 text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </div>
    </section>
  )
}

/* ─────────────────────────── CATEGORIES ─────────────────────────── */

function CategoryPreviewSection({ categories }: { categories: CategoryPreview[] }): React.ReactElement {
  const t = useTranslations('common.home.categoryPreview')

  return (
    <section id="categories" className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <FadeIn className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t('title')}</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t('description')}</p>
          </FadeIn>
        </div>

        {categories.length > 0 ? (
          <AnimatedContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
            {categories.map((category) => (
              <AnimatedItem key={category.id}>
                <Card className="group h-full border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <CategoryIcon iconKey={category.icon} className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">{t('empty')}</p>
        )}
      </div>
    </section>
  )
}

/* ─────────────────────────── MAP PREVIEW ─────────────────────────── */

function MapPreviewSection({ reports }: { reports: PublicReportListItemDto[] }): React.ReactElement {
  const t = useTranslations('common.home.mapPreview')

  return (
    <section id="map-preview" className="border-t border-border/40 bg-muted/30 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="space-y-10" y={30}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                Live
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t('title')}</h2>
              <p className="text-base text-muted-foreground">{t('description')}</p>
            </div>
            <Button asChild variant="outline" className="group shrink-0 rounded-full">
              <Link href="/map">
                {t('openMap')}
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          <MapPreviewClient reports={reports} />
        </FadeIn>
      </div>
    </section>
  )
}

/* ─────────────────────────── CTA ─────────────────────────── */

function CtaSection({ dashboardPath }: { dashboardPath: string | null }): React.ReactElement {
  const t = useTranslations('common.home')
  const actions = useTranslations('common.actions')

  return (
    <section id="cta" className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
      {/* Decorative dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.06),transparent_40%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.04),transparent_30%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn y={20}>
          <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <Zap className="size-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t('title')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">{t('description')}</p>
        </FadeIn>
        <FadeIn y={15} delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8 font-semibold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5">
              <Link href={dashboardPath ?? '/login'}>
                {actions('getStarted')}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-primary-foreground/25 px-8 font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10 hover:-translate-y-0.5"
            >
              <Link href="/map">
                <Route className="mr-2 size-4" />
                {actions('viewMap')}
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─────────────────────────── FOOTER ─────────────────────────── */

function LandingFooter(): React.ReactElement {
  const t = useTranslations('common.home.footer')
  const nav = useTranslations('common.navigation')
  const app = useTranslations('common.app')
  const currentYear = new Date().getFullYear().toString()

  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Top */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <AppLogo showTagline />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">{t('builtWith')}</p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{nav('publicNavigation')}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-muted-foreground transition hover:text-foreground">{nav('home')}</Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-muted-foreground transition hover:text-foreground">{nav('map')}</Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground transition hover:text-foreground">{nav('help')}</Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{app('name')}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-muted-foreground transition hover:text-foreground">{nav('login')}</Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-muted-foreground transition hover:text-foreground">{nav('register')}</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('links.terms')}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground transition hover:text-foreground">{t('links.privacy')}</Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground transition hover:text-foreground">{t('links.terms')}</Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground transition hover:text-foreground">{t('links.contact')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t('copyright', { year: currentYear })}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{app('tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
