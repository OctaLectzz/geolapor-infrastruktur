import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Mail,
  Map,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AnimatedContainer, AnimatedItem, FadeIn } from '@/components/shared/animated-entrance'
import { AppLogo } from '@/components/shared/app-logo'
import { CategoryIcon } from '@/components/shared/category-icon'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { MobileNav } from '@/components/shared/mobile-nav'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getRoleRedirectPath } from '@/features/auth/utils/role-redirect'
import { MapPreviewClient } from '@/features/map/components/map-preview-client'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { toPublicReportListItemDto } from '@/lib/public-report-dto'
import { createClient } from '@/lib/supabase/server'

import type { PublicReportListItemDto } from '@/types/report'
import type { ReportStatus } from '@generated/prisma/enums'

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

export default async function HomePage(): Promise<React.ReactElement> {
  const [stats, categories, reports] = await Promise.all([getPublicStats(), getCategories(), getPublicReports()])

  let dashboardPath: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

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
    <div className="bg-background relative min-h-screen">
      {/* Decorative Topographic & Coordinates Grid Backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Topographic Contour Lines */}
        <svg
          className="text-primary/[0.03] dark:text-primary/[0.015] absolute top-0 left-0 h-[800px] w-full"
          viewBox="0 0 1440 800"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M -100 150 C 300 50, 500 350, 900 100 C 1200 -50, 1300 250, 1600 150" />
          <path d="M -100 200 C 300 100, 500 400, 900 150 C 1200 0, 1300 300, 1600 200" />
          <path d="M -100 250 C 300 150, 500 450, 900 200 C 1200 50, 1300 350, 1600 250" strokeDasharray="4 4" />
          <path d="M -100 300 C 300 200, 500 500, 900 250 C 1200 100, 1300 400, 1600 300" />
          <path d="M -100 350 C 300 250, 500 550, 900 300 C 1200 150, 1300 450, 1600 350" />
          <path d="M -100 400 C 300 300, 500 600, 900 350 C 1200 200, 1300 500, 1600 400" />
          <path d="M -100 450 C 300 350, 500 650, 900 400 C 1200 250, 1300 550, 1600 450" strokeDasharray="2 2" />
        </svg>

        {/* Dynamic Mapping Radar & Node Network overlay */}
        <svg
          className="absolute -top-[10%] -left-[10%] size-[600px] text-emerald-500/[0.02] dark:text-emerald-500/[0.01]"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="30" />
          <circle cx="100" cy="100" r="60" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="90" />
          <path d="M 0 100 H 200 M 100 0 V 200" />
        </svg>

        {/* Floating Geographic Coordinates Text */}
        <div className="text-primary/20 dark:text-primary/10 absolute top-[12%] left-[4%] font-mono text-[9px] tracking-widest select-none">
          LAT: -6.2088° S / LON: 106.8456° E
        </div>
        <div className="text-primary/20 dark:text-primary/10 absolute top-[22%] right-[6%] hidden font-mono text-[9px] tracking-widest select-none md:block">
          ELEVATION: 12.5M // ACCURACY: HIGH
        </div>
      </div>

      <LandingHeader dashboardPath={dashboardPath} />

      <main>
        <HeroSection stats={stats} />
        <HowItWorksSection />
        <FeaturesSection />
        <BenefitsSection />
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
    <header className="border-border/50 bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label={t('home')} className="shrink-0">
          <AppLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label={t('publicNavigation')}>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-full text-sm font-medium">
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-full text-sm font-medium">
            <Link href="/map" className="flex items-center gap-1.5">
              <Map className="size-3.5" />
              {t('map')}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-full text-sm font-medium">
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
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-medium">
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

function HeroSection({ stats }: { stats: PublicStats | null }): React.ReactElement {
  const t = useTranslations('common.home')
  const statsT = useTranslations('common.home.publicStats')

  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.25] dark:opacity-[0.08]"
        aria-hidden="true"
      />

      {/* Decorative Blur Circles */}
      <div
        className="bg-primary/10 dark:bg-primary/5 pointer-events-none absolute top-[-10%] left-[-15%] -z-10 h-[30rem] w-[30rem] rounded-full blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[20%] right-[-10%] -z-10 h-[35rem] w-[35rem] rounded-full bg-emerald-500/10 blur-[150px] dark:bg-emerald-500/5"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column (Text & Call-To-Action) */}
          <div className="space-y-6 text-left lg:col-span-5">
            <FadeIn y={20}>
              <Badge
                variant="secondary"
                className="border-primary/20 bg-primary/5 text-primary rounded-full border px-4 py-1.5 text-xs font-semibold"
              >
                <span className="relative mr-2 flex size-1.5">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex size-1.5 rounded-full" />
                </span>
                {t('eyebrow') ?? 'Platform Laporan Geospasial'}
              </Badge>
            </FadeIn>

            <FadeIn y={25} delay={0.05}>
              <h1 className="text-foreground text-4xl leading-[1.12] font-extrabold tracking-tight sm:text-5xl lg:max-w-md lg:text-6xl">
                Your roadmap to infrastructure improvement
              </h1>
            </FadeIn>

            <FadeIn y={20} delay={0.1}>
              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">{t('description')}</p>
            </FadeIn>

            {/* Main Action Call-to-Actions with SVG styling */}
            <FadeIn y={20} delay={0.12} className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-primary/25 hover:shadow-primary/30 group relative overflow-hidden rounded-full px-7 py-5 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                asChild
              >
                <Link href="/login" className="relative z-10 flex items-center gap-2">
                  {/* Decorative target/circle SVG */}
                  <svg
                    className="text-primary-foreground/50 group-hover:text-primary-foreground size-4 transition-all duration-500 ease-out group-hover:rotate-90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  </svg>
                  <span>{t('primaryCta') ?? 'Create Report'}</span>
                  <ArrowRight className="ml-0.5 size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  {/* Background rotating dashed circle */}
                  <svg
                    className="text-primary-foreground pointer-events-none absolute -right-3 -bottom-3 size-12 opacity-15 transition-transform duration-500 group-hover:scale-120"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" />
                    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5 group relative overflow-hidden rounded-full px-7 py-5 font-semibold transition-all duration-300 hover:-translate-y-0.5"
                asChild
              >
                <Link href="/map" className="relative z-10 flex items-center gap-2">
                  <Route className="mr-0.5 size-4 transition-transform group-hover:translate-x-0.5" />
                  <span>{t('secondaryCta') ?? 'Explore Map'}</span>
                  {/* Background crosshair line */}
                  <svg
                    className="text-primary pointer-events-none absolute -top-4 -left-4 size-12 opacity-10 transition-transform duration-500 group-hover:scale-120"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2.5" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Link>
              </Button>
            </FadeIn>

            {/* Newsletter-styled Status Check box */}
            <FadeIn y={20} delay={0.15}>
              <div className="border-border/80 bg-card focus-within:ring-primary/20 flex w-full max-w-md items-center gap-2 rounded-full border p-1.5 shadow-md transition-all focus-within:ring-2">
                <div className="flex flex-1 items-center gap-2 pl-4">
                  <Mail className="text-muted-foreground size-4" />
                  <input
                    type="text"
                    placeholder="Enter report code (e.g. REP-1234)"
                    className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/95 text-primary-foreground group relative overflow-hidden rounded-full px-6 py-2.5 text-xs font-bold">
                  <span className="relative z-10 flex items-center gap-1">
                    <span>CHECK</span>
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <svg
                    className="pointer-events-none absolute -right-2 -bottom-2 size-8 text-white opacity-25 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12"
                    viewBox="0 0 40 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="20" cy="20" r="14" />
                    <line x1="20" y1="6" x2="20" y2="34" />
                    <line x1="6" y1="20" x2="34" y2="20" />
                  </svg>
                </Button>
              </div>
            </FadeIn>

            {/* Public Stats summary row */}
            {stats && (
              <FadeIn y={20} delay={0.2} className="pt-4">
                <div className="border-border/50 grid grid-cols-2 gap-4 border-t pt-6">
                  <div>
                    <span className="text-foreground text-3xl font-extrabold">{stats.total.toLocaleString()}</span>
                    <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">{statsT('totalReports')}</p>
                  </div>
                  <div>
                    <span className="text-primary text-3xl font-extrabold">{stats.completed.toLocaleString()}</span>
                    <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">{statsT('completed')}</p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column (Floating Dashboard Mockup UI) */}
          <div className="flex justify-center lg:col-span-7">
            <FadeIn y={30} delay={0.2} className="relative w-full max-w-lg lg:max-w-none">
              {/* Main Dashboard Panel */}
              <div className="border-border/80 bg-card group hover:shadow-primary/5 relative aspect-[4/3] overflow-hidden rounded-3xl border p-4 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                {/* Styled Map Background Representation */}
                <div className="absolute inset-0 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

                  {/* Decorative Winding Road (SVG Path) */}
                  <svg
                    className="text-primary/20 dark:text-primary/10 stroke-linecap-round absolute inset-0 h-full w-full fill-none stroke-current stroke-[8]"
                    viewBox="0 0 400 300"
                  >
                    <path d="M50,250 C120,200 80,100 200,120 C320,140 280,40 380,50" />
                  </svg>

                  {/* Glowing Map Pins */}
                  <div className="absolute top-[35%] left-[20%] animate-bounce duration-1000">
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-lg">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                  <div className="absolute top-[42%] left-[50%] animate-bounce delay-300 duration-1000">
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-lg">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                  <div className="absolute top-[18%] left-[72%] animate-bounce delay-500 duration-1000">
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                </div>

                {/* Floating Card A: Report Card Mockup */}
                <div className="border-border bg-card/95 absolute right-6 bottom-6 left-6 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:right-auto sm:w-80">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="rounded-full border-none bg-amber-500/10 px-2 text-[10px] font-semibold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400">
                        <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-amber-500" />
                        In Progress
                      </Badge>
                      <h4 className="text-foreground mt-2 text-sm font-bold">REP-4819: Pothole on Main St.</h4>
                      <p className="text-muted-foreground mt-1 text-xs">Reported 2 mins ago by Citizen</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <Camera className="size-5" />
                    </div>
                  </div>
                </div>

                {/* Floating Card B: Stats Chip */}
                <div className="border-border bg-card/95 absolute top-6 left-6 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">RESOLVED REPORTS</p>
                    <span className="text-foreground text-sm font-extrabold">99.2% rate</span>
                  </div>
                </div>

                {/* Floating Card C: Officer Avatar Chip */}
                <div className="border-border bg-card/95 absolute top-6 right-6 flex items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-md">
                  <div className="bg-primary/20 text-primary flex size-7 items-center justify-center rounded-full text-[10px] font-bold">BW</div>
                  <div>
                    <span className="text-foreground block text-[11px] font-bold">Budiman W.</span>
                    <span className="text-muted-foreground block text-[9px]">Officer Dispatched</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-[-1] opacity-30 lg:opacity-100">
        <svg width="364" height="201" viewBox="0 0 364 201" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.88928 72.3303C33.6599 66.4798 101.397 64.9086 150.178 105.427C211.155 156.076 229.59 162.093 264.333 166.607C299.076 171.12 337.718 183.657 362.889 212.24"
            stroke="url(#paint0_linear)"
          />
          <path
            d="M-22.1107 72.3303C5.65989 66.4798 73.3965 64.9086 122.178 105.427C183.155 156.076 201.59 162.093 236.333 166.607C271.076 171.12 309.718 183.657 334.889 212.24"
            stroke="url(#paint1_linear)"
          />
          <path
            d="M-53.1107 72.3303C-25.3401 66.4798 42.3965 64.9086 91.1783 105.427C152.155 156.076 170.59 162.093 205.333 166.607C240.076 171.12 278.718 183.657 303.889 212.24"
            stroke="url(#paint2_linear)"
          />
          <path
            d="M-98.1618 65.0889C-68.1416 60.0601 4.73364 60.4882 56.0734 102.431C120.248 154.86 139.905 161.419 177.137 166.956C214.37 172.493 255.575 186.165 281.856 215.481"
            stroke="url(#paint3_linear)"
          />
          <circle opacity="0.8" cx="214.505" cy="60.5054" r="49.7205" transform="rotate(-13.421 214.505 60.5054)" stroke="url(#paint4_linear)" />
          <circle cx="220" cy="63" r="43" fill="url(#paint5_radial)" />

          <defs>
            <linearGradient id="paint0_linear" x1="184.389" y1="69.2405" x2="184.389" y2="212.24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" stopOpacity="0" />
              <stop offset="1" stopColor="#4A6CF7" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="156.389" y1="69.2405" x2="156.389" y2="212.24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" stopOpacity="0" />
              <stop offset="1" stopColor="#4A6CF7" />
            </linearGradient>
            <linearGradient id="paint2_linear" x1="125.389" y1="69.2405" x2="125.389" y2="212.24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" stopOpacity="0" />
              <stop offset="1" stopColor="#4A6CF7" />
            </linearGradient>
            <linearGradient id="paint3_linear" x1="93.8507" y1="67.2674" x2="89.9278" y2="210.214" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" stopOpacity="0" />
              <stop offset="1" stopColor="#4A6CF7" />
            </linearGradient>
            <linearGradient id="paint4_linear" x1="214.505" y1="10.2849" x2="212.684" y2="99.5816" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
            <radialGradient
              id="paint5_radial"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(220 63) rotate(90) scale(43)"
            >
              <stop offset="0.145833" stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" stopOpacity="0.08" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <span className="absolute top-0 left-0 z-[-1]">
        <svg width="287" height="254" viewBox="0 0 287 254" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.1" d="M286.5 0.5L-14.5 254.5V69.5L286.5 0.5Z" fill="url(#leftGradient)" />
          <defs>
            <linearGradient id="leftGradient" x1="-40.5" y1="117" x2="301.926" y2="-97.1485" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      <span className="absolute top-0 right-0 z-[-1]">
        <svg width="628" height="258" viewBox="0 0 628 258" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.1" d="M669.125 257.002L345.875 31.9983L524.571 -15.8832L669.125 257.002Z" fill="url(#rightGradient1)" />
          <path opacity="0.1" d="M0.0716344 182.78L101.988 -15.0769L142.154 81.4093L0.0716344 182.78Z" fill="url(#rightGradient2)" />
          <defs>
            <linearGradient id="rightGradient1" x1="644" y1="221" x2="429.946" y2="37.0429" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rightGradient2" x1="18.3648" y1="166.016" x2="105.377" y2="32.3398" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </section>
  )
}

/* ─────────────────────────── HOW IT WORKS (OUR OFFER) ─────────────────────────── */

function HowItWorksSection(): React.ReactElement {
  const t = useTranslations('common.home.howItWorks')

  const steps = [
    {
      number: '01',
      icon: <Camera className="text-primary size-6" />,
      title: t('step1Title'),
      description: t('step1Description')
    },
    {
      number: '02',
      icon: <ShieldCheck className="text-primary size-6" />,
      title: t('step2Title'),
      description: t('step2Description')
    },
    {
      number: '03',
      icon: <Wrench className="text-primary size-6" />,
      title: t('step3Title'),
      description: t('step3Description')
    }
  ]

  return (
    <section id="how-it-works" className="border-border/40 relative overflow-hidden border-y bg-slate-50/70 py-20 sm:py-24 dark:bg-slate-900/35">
      {/* Decorative grid pattern in background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 dark:opacity-10" />

      {/* Decorative topographic lines in section */}
      <svg
        className="text-primary/[0.04] dark:text-primary/[0.02] pointer-events-none absolute top-[10%] -right-[5%] -z-10 h-[350px] w-[350px]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <circle cx="50" cy="50" r="15" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="45" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="60" />
        <circle cx="50" cy="50" r="75" />
      </svg>

      {/* Decorative radial color shadow */}
      <div
        className="bg-primary/5 pointer-events-none absolute right-[-5%] bottom-[-10%] -z-10 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <span className="text-primary text-[11px] font-bold tracking-wider uppercase">WHAT WE DO</span>
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">Our Process</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t('description') ?? 'Dari temuan kerusakan hingga selesai diperbaiki secara transparan.'}
          </p>
        </div>

        {/* Connected Steps Timeline */}
        <div className="relative mt-16">
          {/* Connector Line (Desktop) */}
          <div className="bg-border/60 absolute top-1/2 right-0 left-0 z-0 hidden h-0.5 -translate-y-1/2 md:block" aria-hidden="true" />

          <AnimatedContainer className="relative z-10 grid gap-8 md:grid-cols-3" delay={0.1}>
            {steps.map((step) => (
              <AnimatedItem key={step.number}>
                <div className="bg-card border-border flex flex-col items-center rounded-2xl border p-6 text-center shadow-sm md:border-none md:bg-transparent md:p-0 md:shadow-none">
                  {/* Step Icon Wrapper */}
                  <div className="bg-card border-primary/20 relative z-10 flex size-16 items-center justify-center rounded-full border-2 shadow-md transition-transform duration-300 hover:scale-105">
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[9px] font-bold">
                      {step.number}
                    </span>
                    {step.icon}
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-foreground mt-6 text-lg font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">{step.description}</p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── FEATURES (LEFT HEADING, RIGHT CARDS) ─────────────────────────── */

function FeaturesSection(): React.ReactElement {
  const features = [
    {
      icon: <MapPin className="size-5" />,
      title: 'Geotagged Reports',
      description: 'Pinpoint precise locations using GPS coordinates to speed up dispatching.'
    },
    {
      icon: <ShieldCheck className="size-5" />,
      title: 'Admin Verification',
      description: 'Reports are vetted by administrators first to prevent spam or duplicate tasks.'
    },
    {
      icon: <Route className="size-5" />,
      title: 'Real-time Updates',
      description: 'Receive real-time progress alerts as reports transition from verification to repair.'
    },
    {
      icon: <Wrench className="size-5" />,
      title: 'Smart Resolution',
      description: 'Automated task routing and tools mapping for designated field officers.'
    }
  ]

  return (
    <section
      id="features"
      className="from-background via-muted/10 to-background dark:from-background dark:via-muted/5 dark:to-background relative overflow-hidden bg-gradient-to-b py-20 sm:py-24"
    >
      {/* Decorative Blob */}
      <div
        className="pointer-events-none absolute top-[20%] left-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[120px]"
        aria-hidden="true"
      />

      {/* Floating coordinates indicator */}
      <div className="text-muted-foreground/35 absolute top-[10%] right-[10%] hidden font-mono text-[8px] select-none md:block">
        GRID ZONE 48P // GEOREF: WGS84
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Side: Header & Controls */}
          <div className="space-y-6 text-left lg:col-span-4">
            <span className="text-primary text-[11px] font-bold tracking-wider uppercase">LEARN MORE</span>
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">Platform Features</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We empower citizens, administrators, and field officers with geolocalized tools designed for transparency and velocity.
            </p>

            {/* Slider Controls Mockup (Matching the uploaded design) */}
            <div className="flex items-center gap-3 pt-2">
              <Button size="icon" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 size-10 rounded-full">
                <ChevronLeft className="size-5" />
              </Button>
              <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground size-10 rounded-full">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {/* Right Side: Features Cards Grid */}
          <div className="lg:col-span-8">
            <AnimatedContainer className="grid gap-6 sm:grid-cols-2" delay={0.1}>
              {features.map((feature) => (
                <AnimatedItem key={feature.title}>
                  <Card className="group border-border/60 bg-card hover:border-primary/20 h-full shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="flex flex-col items-start p-6">
                      {/* Icon wrapper */}
                      <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 items-center justify-center rounded-xl transition-all duration-300">
                        {feature.icon}
                      </div>

                      <h3 className="text-foreground group-hover:text-primary mt-4 text-base font-bold transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.description}</p>

                      {/* "Learn More" Link */}
                      <Link href="/help" className="text-primary mt-5 inline-flex items-center gap-1 text-xs font-bold hover:underline">
                        Learn More
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── BENEFITS (LEFT ILLUSTRATION, RIGHT CHECKLIST) ─────────────────────────── */

function BenefitsSection(): React.ReactElement {
  const benefits = [
    {
      title: 'Reliable Geolocation Data',
      desc: 'GPS parameters eliminate verification mistakes and speed up repair routing.'
    },
    {
      title: 'Full Citizen Transparency',
      desc: 'Public status logs build trust and active community civic participation.'
    },
    {
      title: 'Accelerated Dispatch Flow',
      desc: 'Quick verification and instant assignment direct tasks to the right teams.'
    },
    {
      title: 'Optimized Task Reporting',
      desc: 'Field officers submit photos of completed repairs directly from their mobile devices.'
    }
  ]

  return (
    <section
      id="benefits"
      className="border-border/40 relative overflow-hidden border-y bg-emerald-500/[0.02] py-20 sm:py-24 dark:bg-emerald-500/[0.01]"
    >
      {/* Topographic curves in background */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 size-full text-emerald-500/[0.02] dark:text-emerald-500/[0.008]"
        viewBox="0 0 1440 600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        preserveAspectRatio="none"
      >
        <path d="M-100,100 Q300,300 700,100 T1500,100" />
        <path d="M-100,150 Q300,350 700,150 T1500,150" strokeDasharray="3 3" />
        <path d="M-100,200 Q300,400 700,200 T1500,200" />
      </svg>

      {/* Decorative glow */}
      <div
        className="bg-primary/5 pointer-events-none absolute top-[10%] right-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Climbing Mountain Progress Mockup (Custom SVG) */}
          <div className="flex justify-center lg:col-span-5">
            <div className="bg-card/50 border-border/50 relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border p-6 shadow-xl">
              {/* Graphic Backdrop Wave */}
              <div className="from-primary/[0.03] absolute inset-0 -z-10 bg-gradient-to-tr to-transparent" />

              {/* Mountains SVG Illustration */}
              <svg
                className="text-muted-foreground/30 h-full w-full fill-none stroke-current"
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hills */}
                <path d="M 0,280 Q 75,200 150,280" className="fill-current text-emerald-500/10" />
                <path d="M 100,280 Q 200,160 300,280" className="text-primary/10 fill-current" />

                {/* Winding climb line */}
                <path d="M 30,280 C 60,250 80,180 140,190 C 200,200 200,100 250,70" className="stroke-primary stroke-dasharray-[5,5] stroke-[3]" />

                {/* Checkpoint Markers */}
                <circle cx="30" cy="280" r="8" className="fill-blue-500 stroke-white stroke-[2]" />
                <circle cx="140" cy="190" r="8" className="fill-amber-500 stroke-white stroke-[2]" />
                <circle cx="250" cy="70" r="10" className="fill-emerald-500 stroke-white stroke-[2]" />

                {/* Decorative Sun */}
                <circle cx="260" cy="40" r="16" className="fill-current text-amber-400/20" />
                <circle cx="260" cy="40" r="8" className="fill-current text-amber-500" />
              </svg>

              {/* Woven Text Badges on Mock Illustration */}
              <div className="border-border bg-card absolute bottom-10 left-10 rounded-xl border p-3 shadow-md">
                <span className="text-muted-foreground block text-[9px] font-bold uppercase">STEP 1</span>
                <span className="text-foreground block text-xs font-bold">Issue Spotted</span>
              </div>
              <div className="border-border bg-card absolute top-[48%] right-8 rounded-xl border p-3 shadow-md">
                <span className="text-muted-foreground block text-[9px] font-bold uppercase">STEP 2</span>
                <span className="text-foreground block text-xs font-bold">Admin Verified</span>
              </div>
              <div className="border-border bg-card absolute top-12 left-[20%] rounded-xl border p-3 shadow-md">
                <span className="block text-[9px] font-bold text-emerald-600 uppercase">RESOLVED!</span>
                <span className="text-foreground block text-xs font-bold">Facility Repaired</span>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits Description & Grid */}
          <div className="space-y-6 text-left lg:col-span-7">
            <span className="text-primary text-[11px] font-bold tracking-wider uppercase">WHY OUR PROGRAM</span>
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">Platform Benefits</h2>
            <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
              Roostvasum bridges the communication gap between citizens reporting damage and the civil departments responsible for maintaining
              facilities.
            </p>

            {/* Checkmark 2x2 Grid */}
            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-foreground text-sm font-bold">{benefit.title}</h4>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── CATEGORIES PREVIEW ─────────────────────────── */

function CategoryPreviewSection({ categories }: { categories: CategoryPreview[] }): React.ReactElement {
  const t = useTranslations('common.home.categoryPreview')

  return (
    <section id="categories" className="relative overflow-hidden py-20 sm:py-24">
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] [background-size:2.5rem_2.5rem] opacity-[0.35] dark:opacity-[0.12]" />

      {/* Glowing Blob */}
      <div
        className="pointer-events-none absolute top-[10%] left-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <FadeIn className="max-w-2xl">
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">{t('description')}</p>
          </FadeIn>
        </div>

        {categories.length > 0 ? (
          <AnimatedContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
            {categories.map((category) => (
              <AnimatedItem key={category.id}>
                <Card className="group border-border/50 bg-card/80 hover:border-primary/30 h-full backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300">
                      <CategoryIcon iconKey={category.icon} className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground text-sm font-bold">{category.name}</h3>
                      {category.description && (
                        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">{category.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        ) : (
          <p className="text-muted-foreground mt-12 text-center text-sm">{t('empty')}</p>
        )}
      </div>
    </section>
  )
}

/* ─────────────────────────── MAP PREVIEW ─────────────────────────── */

function MapPreviewSection({ reports }: { reports: PublicReportListItemDto[] }): React.ReactElement {
  const t = useTranslations('common.home.mapPreview')

  return (
    <section
      id="map-preview"
      className="border-border/40 to-muted/20 dark:to-muted/5 relative overflow-hidden border-y bg-gradient-to-b from-emerald-50/30 py-20 sm:py-24 dark:from-emerald-950/10"
    >
      {/* Coordinates Grid Line SVG */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 size-full text-emerald-500/[0.03] dark:text-emerald-500/[0.015]"
        viewBox="0 0 1440 600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <line x1="360" y1="0" x2="360" y2="600" strokeDasharray="4 4" />
        <line x1="720" y1="0" x2="720" y2="600" />
        <line x1="1080" y1="0" x2="1080" y2="600" strokeDasharray="4 4" />
        <line x1="0" y1="300" x2="1440" y2="300" />
      </svg>

      {/* Glowing blob behind map */}
      <div
        className="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[35rem] w-[35rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="space-y-10" y={30}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                Live
              </div>
              <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">{t('title')}</h2>
              <p className="text-muted-foreground text-base">{t('description')}</p>
            </div>
            <Button asChild variant="outline" className="group border-primary/20 text-primary hover:bg-primary/5 shrink-0 rounded-full">
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
    <section
      id="cta"
      className="from-primary via-primary/95 dark:from-primary/90 text-primary-foreground relative overflow-hidden bg-gradient-to-br to-emerald-800 py-20 sm:py-24 dark:to-emerald-950"
    >
      {/* Glowing concentric target rings */}
      <svg
        className="pointer-events-none absolute top-[-25%] right-[-10%] -z-0 size-[500px] text-white/5"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="100" cy="100" r="40" />
        <circle cx="100" cy="100" r="70" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="100" />
        <circle cx="100" cy="100" r="130" />
      </svg>
      <svg
        className="pointer-events-none absolute bottom-[-25%] left-[-5%] -z-0 size-[400px] text-white/5"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="60" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="95" />
      </svg>

      {/* Decorative dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.06),transparent_40%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.04),transparent_30%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn y={20}>
          <div className="bg-primary-foreground/10 mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl backdrop-blur-sm">
            <Zap className="size-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t('title')}</h2>
          <p className="text-primary-foreground/80 mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">{t('description')}</p>
        </FadeIn>
        <FadeIn y={15} delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="group hover:shadow-primary/20 text-primary relative overflow-hidden rounded-full bg-white px-8 py-6 font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
              asChild
            >
              <Link href={dashboardPath ?? '/login'} className="relative z-10 flex items-center gap-2">
                {/* Decorative map target/circle SVG */}
                <svg
                  className="text-primary/40 group-hover:text-primary size-5 transition-all duration-500 ease-out group-hover:rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
                <span>{actions('getStarted')}</span>
                <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                {/* Background rotating dashed circle */}
                <svg
                  className="text-primary pointer-events-none absolute -right-4 -bottom-4 size-16 opacity-10 transition-transform duration-500 group-hover:scale-125"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" />
                  <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 group relative overflow-hidden rounded-full px-8 py-6 font-semibold transition-all duration-300 hover:-translate-y-1"
            >
              <Link href="/map" className="relative z-10 flex items-center gap-2">
                <Route className="mr-1 size-4 transition-transform group-hover:translate-x-0.5" />
                <span>{actions('viewMap')}</span>
                {/* Background decorative coordinates/crosshair line */}
                <svg
                  className="text-primary-foreground pointer-events-none absolute -top-6 -left-6 size-16 opacity-10 transition-transform duration-500 group-hover:scale-125"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" />
                </svg>
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
  const navT = useTranslations('common.navigation')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-border/50 bg-background border-t py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <AppLogo />
            <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">{t('builtWith')}</p>
          </div>

          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">Navigation</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground text-xs">
                  {navT('home')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-foreground text-xs">
                  {navT('map')}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground text-xs">
                  {navT('help')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">Features</h4>
            <ul className="mt-4 space-y-2">
              <li className="text-muted-foreground text-xs">Geotagged Maps</li>
              <li className="text-muted-foreground text-xs">Verification flow</li>
              <li className="text-muted-foreground text-xs">Task Assignment</li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-muted-foreground cursor-not-allowed text-xs">{t('links.privacy')}</span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed text-xs">{t('links.terms')}</span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed text-xs">{t('links.contact')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border/50 mt-12 border-t pt-6 text-center">
          <p className="text-muted-foreground text-xs">{t('copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}
