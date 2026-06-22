import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative Wave Backgrounds (Mockup Style) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-[650px] text-primary/[0.04] dark:text-primary/[0.02] fill-current"
          viewBox="0 0 1440 650"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 L1440,0 L1440,220 C1100,380 950,150 600,420 C300,680 150,520 0,600 Z" />
        </svg>
        <svg
          className="absolute top-0 left-0 w-full h-[720px] text-emerald-500/[0.02] dark:text-emerald-500/[0.01] fill-current"
          viewBox="0 0 1440 720"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 L1440,0 L1440,250 C1150,400 920,200 650,470 C350,700 200,550 0,700 Z" />
        </svg>
      </div>

      <LandingHeader dashboardPath={dashboardPath} />
      
      <main>
        <HeroSection dashboardPath={dashboardPath} stats={stats} />
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
    <header className="sticky top-0 z-[1050] w-full border-b border-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
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
              <Button size="sm" asChild className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5">
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
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.25] dark:opacity-[0.08]" aria-hidden="true" />
      
      {/* Decorative Blur Circles */}
      <div className="absolute top-[-10%] left-[-15%] -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/5 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[20%] right-[-10%] -z-10 h-[35rem] w-[35rem] rounded-full bg-emerald-500/10 blur-[150px] dark:bg-emerald-500/5 pointer-events-none" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column (Text & Call-To-Action) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <FadeIn y={20}>
              <Badge variant="secondary" className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <span className="relative mr-2 flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                {t('eyebrow') ?? 'Platform Laporan Geospasial'}
              </Badge>
            </FadeIn>

            <FadeIn y={25} delay={0.05}>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.12] lg:max-w-md">
                Your roadmap to infrastructure improvement
              </h1>
            </FadeIn>

            <FadeIn y={20} delay={0.1}>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t('description')}
              </p>
            </FadeIn>

            {/* Newsletter-styled Status Check box */}
            <FadeIn y={20} delay={0.15}>
              <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-border/80 bg-card p-1.5 shadow-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div className="flex flex-1 items-center gap-2 pl-4">
                  <Mail className="size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter report code (e.g. REP-1234)"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-6 py-2">
                  CHECK
                </Button>
              </div>
            </FadeIn>

            {/* Public Stats summary row */}
            {stats && (
              <FadeIn y={20} delay={0.2} className="pt-4">
                <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                  <div>
                    <span className="text-3xl font-extrabold text-foreground">{stats.total.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{statsT('totalReports')}</p>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-primary">{stats.completed.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{statsT('completed')}</p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right Column (Floating Dashboard Mockup UI) */}
          <div className="lg:col-span-7 flex justify-center">
            <FadeIn y={30} delay={0.2} className="relative w-full max-w-lg lg:max-w-none">
              
              {/* Main Dashboard Panel */}
              <div className="relative rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden aspect-[4/3] p-4 group transition-transform duration-500 hover:scale-[1.01] hover:shadow-primary/5">
                
                {/* Styled Map Background Representation */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                  
                  {/* Decorative Winding Road (SVG Path) */}
                  <svg className="absolute inset-0 w-full h-full text-primary/20 dark:text-primary/10 stroke-current fill-none stroke-[8] stroke-linecap-round" viewBox="0 0 400 300">
                    <path d="M50,250 C120,200 80,100 200,120 C320,140 280,40 380,50" />
                  </svg>
                  
                  {/* Glowing Map Pins */}
                  <div className="absolute top-[35%] left-[20%] animate-bounce duration-1000">
                    <div className="flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg border-2 border-white">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                  <div className="absolute top-[42%] left-[50%] animate-bounce duration-1000 delay-300">
                    <div className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg border-2 border-white">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                  <div className="absolute top-[18%] left-[72%] animate-bounce duration-1000 delay-500">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white">
                      <MapPin className="size-3.5" />
                    </div>
                  </div>
                </div>

                {/* Floating Card A: Report Card Mockup */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-none font-semibold text-[10px] rounded-full px-2">
                        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        In Progress
                      </Badge>
                      <h4 className="text-sm font-bold text-foreground mt-2">REP-4819: Pothole on Main St.</h4>
                      <p className="text-xs text-muted-foreground mt-1">Reported 2 mins ago by Citizen</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <Camera className="size-5" />
                    </div>
                  </div>
                </div>

                {/* Floating Card B: Stats Chip */}
                <div className="absolute top-6 left-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-lg flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">RESOLVED REPORTS</p>
                    <span className="text-sm font-extrabold text-foreground">99.2% rate</span>
                  </div>
                </div>

                {/* Floating Card C: Officer Avatar Chip */}
                <div className="absolute top-6 right-6 rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <div className="size-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                    BW
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-foreground">Budiman W.</span>
                    <span className="block text-[9px] text-muted-foreground">Officer Dispatched</span>
                  </div>
                </div>

              </div>
              
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── HOW IT WORKS (OUR OFFER) ─────────────────────────── */

function HowItWorksSection(): React.ReactElement {
  const t = useTranslations('common.home.howItWorks')

  const steps = [
    {
      number: '01',
      icon: <Camera className="size-6 text-primary" />,
      title: t('step1Title'),
      description: t('step1Description')
    },
    {
      number: '02',
      icon: <ShieldCheck className="size-6 text-primary" />,
      title: t('step2Title'),
      description: t('step2Description')
    },
    {
      number: '03',
      icon: <Wrench className="size-6 text-primary" />,
      title: t('step3Title'),
      description: t('step3Description')
    }
  ]

  return (
    <section id="how-it-works" className="relative overflow-hidden border-t border-border/40 bg-muted/20 py-20 sm:py-24">
      {/* Decorative radial color shadow */}
      <div className="absolute bottom-[-10%] right-[-5%] -z-10 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none" aria-hidden="true" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">WHAT WE DO</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Our Process</h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t('description') ?? 'Dari temuan kerusakan hingga selesai diperbaiki secara transparan.'}
          </p>
        </div>

        {/* Connected Steps Timeline */}
        <div className="relative mt-16">
          
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 hidden md:block z-0" aria-hidden="true" />
          
          <AnimatedContainer className="relative grid gap-8 md:grid-cols-3 z-10" delay={0.1}>
            {steps.map((step, idx) => (
              <AnimatedItem key={step.number}>
                <div className="flex flex-col items-center text-center bg-card md:bg-transparent p-6 md:p-0 rounded-2xl border border-border md:border-none shadow-sm md:shadow-none">
                  
                  {/* Step Icon Wrapper */}
                  <div className="relative flex size-16 items-center justify-center rounded-full bg-card border-2 border-primary/20 shadow-md transition-transform duration-300 hover:scale-105 z-10">
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {step.number}
                    </span>
                    {step.icon}
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="mt-6 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>

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
  const t = useTranslations('common.home')

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
    <section id="features" className="relative overflow-hidden py-20 sm:py-24">
      {/* Decorative Blob */}
      <div className="absolute top-[20%] left-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" aria-hidden="true" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Left Side: Header & Controls */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">LEARN MORE</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Platform Features</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              We empower citizens, administrators, and field officers with geolocalized tools designed for transparency and velocity.
            </p>
            
            {/* Slider Controls Mockup (Matching the uploaded design) */}
            <div className="flex items-center gap-3 pt-2">
              <Button size="icon" variant="outline" className="rounded-full size-10 border-primary/20 text-primary hover:bg-primary/10">
                <ChevronLeft className="size-5" />
              </Button>
              <Button size="icon" className="rounded-full size-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {/* Right Side: Features Cards Grid */}
          <div className="lg:col-span-8">
            <AnimatedContainer className="grid gap-6 sm:grid-cols-2" delay={0.1}>
              {features.map((feature, idx) => (
                <AnimatedItem key={idx}>
                  <Card className="group h-full border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5">
                    <CardContent className="flex flex-col items-start p-6">
                      
                      {/* Icon wrapper */}
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        {feature.icon}
                      </div>

                      <h3 className="mt-4 text-base font-bold text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                      
                      {/* "Learn More" Link */}
                      <Link href="/help" className="inline-flex items-center text-xs font-bold text-primary mt-5 hover:underline gap-1">
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
    <section id="benefits" className="relative overflow-hidden py-20 sm:py-24 border-t border-border/40 bg-muted/10">
      {/* Decorative glow */}
      <div className="absolute top-[10%] right-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Climbing Mountain Progress Mockup (Custom SVG) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-square bg-card/50 rounded-3xl border border-border/50 p-6 shadow-xl flex items-center justify-center overflow-hidden">
              
              {/* Graphic Backdrop Wave */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] to-transparent -z-10" />

              {/* Mountains SVG Illustration */}
              <svg className="w-full h-full text-muted-foreground/30 fill-none stroke-current" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                {/* Hills */}
                <path d="M 0,280 Q 75,200 150,280" className="text-emerald-500/10 fill-current" />
                <path d="M 100,280 Q 200,160 300,280" className="text-primary/10 fill-current" />
                
                {/* Winding climb line */}
                <path d="M 30,280 C 60,250 80,180 140,190 C 200,200 200,100 250,70" className="stroke-primary stroke-[3] stroke-dasharray-[5,5]" />
                
                {/* Checkpoint Markers */}
                <circle cx="30" cy="280" r="8" className="fill-blue-500 stroke-white stroke-[2]" />
                <circle cx="140" cy="190" r="8" className="fill-amber-500 stroke-white stroke-[2]" />
                <circle cx="250" cy="70" r="10" className="fill-emerald-500 stroke-white stroke-[2]" />

                {/* Decorative Sun */}
                <circle cx="260" cy="40" r="16" className="text-amber-400/20 fill-current" />
                <circle cx="260" cy="40" r="8" className="text-amber-500 fill-current" />
              </svg>

              {/* Woven Text Badges on Mock Illustration */}
              <div className="absolute bottom-10 left-10 rounded-xl border border-border bg-card p-3 shadow-md">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase">STEP 1</span>
                <span className="block text-xs font-bold text-foreground">Issue Spotted</span>
              </div>
              <div className="absolute top-[48%] right-8 rounded-xl border border-border bg-card p-3 shadow-md">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase">STEP 2</span>
                <span className="block text-xs font-bold text-foreground">Admin Verified</span>
              </div>
              <div className="absolute top-12 left-[20%] rounded-xl border border-border bg-card p-3 shadow-md">
                <span className="block text-[9px] font-bold text-emerald-600 uppercase">RESOLVED!</span>
                <span className="block text-xs font-bold text-foreground">Facility Repaired</span>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits Description & Grid */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">WHY OUR PROGRAM</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Platform Benefits</h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
              Roostvasum bridges the communication gap between citizens reporting damage and the civil departments responsible for maintaining facilities.
            </p>

            {/* Checkmark 2x2 Grid */}
            <div className="grid gap-6 sm:grid-cols-2 pt-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{benefit.desc}</p>
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
      {/* Glowing Blob */}
      <div className="absolute top-[10%] left-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" aria-hidden="true" />
      
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
    <section id="map-preview" className="relative overflow-hidden border-t border-border/40 bg-emerald-50/20 dark:bg-emerald-950/5 py-20 sm:py-24">
      {/* Glowing blob behind map */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[35rem] w-[35rem] rounded-full bg-primary/5 blur-[130px] pointer-events-none" aria-hidden="true" />
      
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
            <Button asChild variant="outline" className="group shrink-0 rounded-full border-primary/20 text-primary hover:bg-primary/5">
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
  const navT = useTranslations('common.navigation')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          
          <div className="space-y-3">
            <AppLogo />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{t('builtWith')}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Navigation</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">{navT('home')}</Link>
              </li>
              <li>
                <Link href="/map" className="text-xs text-muted-foreground hover:text-foreground">{navT('map')}</Link>
              </li>
              <li>
                <Link href="/help" className="text-xs text-muted-foreground hover:text-foreground">{navT('help')}</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Features</h4>
            <ul className="mt-4 space-y-2">
              <li className="text-xs text-muted-foreground">Geotagged Maps</li>
              <li className="text-xs text-muted-foreground">Verification flow</li>
              <li className="text-xs text-muted-foreground">Task Assignment</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-xs text-muted-foreground cursor-not-allowed">{t('links.privacy')}</span>
              </li>
              <li>
                <span className="text-xs text-muted-foreground cursor-not-allowed">{t('links.terms')}</span>
              </li>
              <li>
                <span className="text-xs text-muted-foreground cursor-not-allowed">{t('links.contact')}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-border/50 pt-6 text-center">
          <p className="text-xs text-muted-foreground">{t('copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  )
}
