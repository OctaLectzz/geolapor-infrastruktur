'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Search,
  HelpCircle,
  Shield,
  ShieldCheck,
  User,
  Wrench,
  ChevronDown,
  ArrowRight,
  Mail,
  Route,
  MessageSquare
} from 'lucide-react'

import { AnimatedContainer, AnimatedItem, FadeIn } from '@/components/shared/animated-entrance'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'

interface FAQItem {
  id: number
  qKey: string
  aKey: string
  category: 'citizen' | 'admin' | 'officer' | 'privacy'
}

export default function HelpPage(): React.ReactElement {
  const t = useTranslations('common.helpPage')
  const navT = useTranslations('common.navigation')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    { id: 1, qKey: 'q1', aKey: 'a1', category: 'citizen' },
    { id: 2, qKey: 'q2', aKey: 'a2', category: 'citizen' },
    { id: 3, qKey: 'q3', aKey: 'a3', category: 'citizen' },
    { id: 4, qKey: 'q4', aKey: 'a4', category: 'privacy' },
    { id: 5, qKey: 'q5', aKey: 'a5', category: 'admin' },
    { id: 6, qKey: 'q6', aKey: 'a6', category: 'officer' }
  ]

  const categories = [
    {
      id: 'citizen',
      title: t('categories.citizenTitle'),
      desc: t('categories.citizenDesc'),
      icon: <User className="text-primary size-5" />
    },
    {
      id: 'admin',
      title: t('categories.adminTitle'),
      desc: t('categories.adminDesc'),
      icon: <ShieldCheck className="text-primary size-5" />
    },
    {
      id: 'officer',
      title: t('categories.officerTitle'),
      desc: t('categories.officerDesc'),
      icon: <Wrench className="text-primary size-5" />
    },
    {
      id: 'privacy',
      title: t('categories.privacyTitle'),
      desc: t('categories.privacyDesc'),
      icon: <Shield className="text-primary size-5" />
    }
  ]

  const filteredFaqs = faqItems.filter((faq) => {
    const matchesCategory = activeCategory ? faq.category === activeCategory : true
    const qText = t(`faqs.${faq.qKey}`).toLowerCase()
    const aText = t(`faqs.${faq.aKey}`).toLowerCase()
    const matchesSearch = qText.includes(searchQuery.toLowerCase()) || aText.includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="bg-background relative min-h-screen">
      {/* Decorative Spatial Grid & Topographic Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="text-primary/15 dark:text-primary/10 absolute top-0 left-0 h-[500px] w-full"
          viewBox="0 0 1440 500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M -100 100 C 300 20, 500 250, 900 80 C 1200 -20, 1300 180, 1600 100" />
          <path d="M -100 150 C 300 70, 500 300, 900 130 C 1200 30, 1300 230, 1600 150" strokeDasharray="3 3" />
          <path d="M -100 200 C 300 120, 500 350, 900 180 C 1200 80, 1300 280, 1600 200" />
        </svg>

        <div className="text-primary/15 absolute top-[8%] left-[6%] font-mono text-[8px] tracking-widest select-none">
          SYSTEM_PORT: HELP_CENTER // WGS84
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
        {/* Help Hero Header */}
        <FadeIn className="mx-auto max-w-3xl space-y-6 text-center">
          <Badge variant="secondary" className="border-primary/20 bg-primary/5 text-primary rounded-full border px-4 py-1.5 text-xs font-semibold">
            <HelpCircle className="mr-1.5 size-3.5 animate-pulse" />
            {navT('help')}
          </Badge>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
          <p className="text-muted-foreground text-base sm:text-lg">{t('subtitle')}</p>

          {/* Interactive FAQ Search Bar */}
          <div className="border-border/80 bg-card focus-within:ring-primary/20 relative mx-auto mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border p-1.5 shadow-lg transition-all focus-within:ring-2">
            <div className="flex flex-1 items-center gap-2 pl-4">
              <Search className="text-muted-foreground size-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="text-foreground placeholder:text-muted-foreground h-9 w-full border-none bg-transparent pl-0 text-sm shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="mr-1 h-8 rounded-full px-3 text-xs">
                Clear
              </Button>
            )}
          </div>
        </FadeIn>

        {/* Categories Grid Section */}
        <div className="mt-16">
          <AnimatedContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" delay={0.1}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <AnimatedItem key={cat.id}>
                  <Card
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className={`border-border/60 h-full cursor-pointer transition-all duration-300 select-none hover:-translate-y-1 hover:shadow-md ${
                      isActive ? 'border-primary bg-primary/[0.03] shadow-inner' : 'bg-card/70 hover:border-primary/20 backdrop-blur-sm'
                    }`}
                  >
                    <CardContent className="flex h-full flex-col p-6">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl transition-all ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                        }`}
                      >
                        {cat.icon}
                      </div>
                      <h3 className="text-foreground mt-4 text-base font-bold">{cat.title}</h3>
                      <p className="text-muted-foreground mt-2 flex-1 text-xs leading-relaxed">{cat.desc}</p>
                      <div className="text-primary mt-4 flex items-center gap-1 text-xs font-bold">
                        <span>{isActive ? 'Showing Category' : 'Filter by Category'}</span>
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              )
            })}
          </AnimatedContainer>
        </div>

        {/* Workflow Roadmap Layout */}
        <div className="border-border/40 relative mt-24 overflow-hidden rounded-3xl border-y bg-muted/50 p-8 dark:bg-muted/15">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-10" />

          <div className="relative mx-auto max-w-3xl space-y-4 text-center">
            <span className="text-primary text-[10px] font-bold tracking-widest uppercase">STEPS ROADMAP</span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{t('workflow.title')}</h2>
            <p className="text-muted-foreground mx-auto max-w-xl text-sm">{t('workflow.desc')}</p>
          </div>

          <div className="relative mt-12">
            {/* Timeline connection line (Desktop) */}
            <div className="bg-border/60 absolute top-1/2 right-0 left-0 z-0 hidden h-0.5 -translate-y-1/2 lg:block" aria-hidden="true" />

            <AnimatedContainer className="relative z-10 grid gap-8 lg:grid-cols-4" delay={0.15}>
              <AnimatedItem>
                <div className="bg-card border-border/60 flex h-full flex-col items-center rounded-2xl border p-5 text-center shadow-sm">
                  <div className="bg-primary text-primary-foreground mb-3 flex size-8 items-center justify-center rounded-full text-xs font-extrabold">
                    01
                  </div>
                  <h4 className="text-foreground text-sm font-bold">{t('workflow.step1')}</h4>
                  <p className="text-muted-foreground mt-1.5 text-xs">{t('workflow.step1Desc')}</p>
                </div>
              </AnimatedItem>
              <AnimatedItem>
                <div className="bg-card border-border/60 flex h-full flex-col items-center rounded-2xl border p-5 text-center shadow-sm">
                  <div className="bg-primary text-primary-foreground mb-3 flex size-8 items-center justify-center rounded-full text-xs font-extrabold">
                    02
                  </div>
                  <h4 className="text-foreground text-sm font-bold">{t('workflow.step2')}</h4>
                  <p className="text-muted-foreground mt-1.5 text-xs">{t('workflow.step2Desc')}</p>
                </div>
              </AnimatedItem>
              <AnimatedItem>
                <div className="bg-card border-border/60 flex h-full flex-col items-center rounded-2xl border p-5 text-center shadow-sm">
                  <div className="bg-primary text-primary-foreground mb-3 flex size-8 items-center justify-center rounded-full text-xs font-extrabold">
                    03
                  </div>
                  <h4 className="text-foreground text-sm font-bold">{t('workflow.step3')}</h4>
                  <p className="text-muted-foreground mt-1.5 text-xs">{t('workflow.step3Desc')}</p>
                </div>
              </AnimatedItem>
              <AnimatedItem>
                <div className="bg-card border-border/60 flex h-full flex-col items-center rounded-2xl border p-5 text-center shadow-sm">
                  <div className="bg-primary text-primary-foreground mb-3 flex size-8 items-center justify-center rounded-full text-xs font-extrabold">
                    04
                  </div>
                  <h4 className="text-foreground text-sm font-bold">{t('workflow.step4')}</h4>
                  <p className="text-muted-foreground mt-1.5 text-xs">{t('workflow.step4Desc')}</p>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          </div>
        </div>

        {/* FAQ Accordions Section */}
        <div className="mx-auto mt-24 max-w-3xl">
          <div className="mb-12 space-y-3 text-center">
            <span className="text-primary text-[10px] font-bold tracking-widest uppercase">FAQ</span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          {filteredFaqs.length > 0 ? (
            <AnimatedContainer className="space-y-4" delay={0.2}>
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id
                return (
                  <AnimatedItem key={faq.id}>
                    <div className="border-border/60 bg-card overflow-hidden rounded-2xl border transition-all duration-300">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="text-foreground hover:bg-muted/35 flex w-full items-center justify-between p-5 text-left text-sm font-semibold transition-colors sm:text-base"
                      >
                        <span className="pr-4">{t(`faqs.${faq.qKey}`)}</span>
                        <ChevronDown
                          className={`text-muted-foreground size-4 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'text-primary rotate-180' : ''
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? 'border-border/40 max-h-[300px] border-t' : 'max-h-0'
                        }`}
                      >
                        <div className="text-muted-foreground p-5 text-xs leading-relaxed sm:text-sm">{t(`faqs.${faq.aKey}`)}</div>
                      </div>
                    </div>
                  </AnimatedItem>
                )
              })}
            </AnimatedContainer>
          ) : (
            <FadeIn className="py-12 text-center">
              <p className="text-muted-foreground text-sm">No questions found matching your search.</p>
              {activeCategory || searchQuery ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory(null)
                  }}
                  className="text-primary mt-2 text-xs font-bold"
                >
                  Reset all filters
                </Button>
              ) : null}
            </FadeIn>
          )}
        </div>

        {/* Support Call To Action */}
        <FadeIn className="mx-auto mt-24 max-w-4xl" y={20}>
          <div className="from-primary via-primary/95 dark:from-primary/90 text-primary-foreground relative overflow-hidden rounded-3xl bg-gradient-to-br to-emerald-800 p-8 text-center shadow-xl sm:p-12 dark:to-emerald-950">
            {/* Background vector rings */}
            <svg
              className="pointer-events-none absolute top-[-25%] right-[-10%] -z-0 size-[300px] text-white/5"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="100" cy="100" r="60" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="95" />
            </svg>
            <svg
              className="pointer-events-none absolute bottom-[-25%] left-[-5%] -z-0 size-[250px] text-white/5"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="100" cy="100" r="80" />
            </svg>

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <MessageSquare className="size-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">{t('contact.title')}</h2>
              <p className="text-primary-foreground/80 text-sm leading-relaxed sm:text-base">{t('contact.desc')}</p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group text-primary relative overflow-hidden rounded-full bg-white px-8 py-5 font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                  asChild
                >
                  <a href="mailto:support@roostvasum.gov" className="relative z-10 flex items-center gap-2">
                    <Mail className="size-4" />
                    <span>{t('contact.button')}</span>
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent px-8 py-5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                  asChild
                >
                  <Link href="/map" className="flex items-center gap-2">
                    <Route className="size-4" />
                    <span>View Map</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
    </div>
  )
}
