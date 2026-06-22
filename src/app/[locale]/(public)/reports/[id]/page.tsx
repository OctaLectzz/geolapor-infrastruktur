import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ReportStatus } from '@generated/prisma/enums'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { toPublicReportDetailDto } from '@/lib/public-report-dto'
import { PUBLIC_REPORT_STATUSES } from '@/schemas/report-schema'

import type { PublicReportDetailDto, ReportPhotoDto, ReportStatus as PublicReportStatus } from '@/types/report'

interface PublicReportDetailPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

interface DetailItemProps {
  label: string
  value: string
}

const STATUS_BADGE_VARIANTS: Record<PublicReportStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING_VERIFICATION: 'secondary',
  VERIFIED: 'default',
  REJECTED: 'destructive',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'outline',
  NEED_REVIEW: 'outline',
  COMPLETED: 'default',
  CANCELLED: 'secondary'
}

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

const getPublicReportDetail = cache(async (id: string): Promise<PublicReportDetailDto | null> => {
  try {
    const report = await prisma.report.findFirst({
      where: {
        id,
        status: {
          in: toReportStatusValues(PUBLIC_REPORT_STATUSES)
        }
      },
      select: {
        id: true,
        reportCode: true,
        title: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        region: {
          select: {
            id: true,
            province: true,
            city: true,
            district: true,
            village: true
          }
        },
        photos: {
          select: {
            id: true,
            url: true,
            type: true,
            caption: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        },
        histories: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        },
        createdAt: true,
        updatedAt: true
      }
    })

    if (!report) {
      return null
    }

    return toPublicReportDetailDto(report)
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: PublicReportDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const report = await getPublicReportDetail(id)

  if (!report) {
    return {
      title: 'Report Not Found'
    }
  }

  return {
    title: `${report.reportCode}: ${report.title}`,
    description: report.description
  }
}

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function formatRegion(report: PublicReportDetailDto): string | null {
  if (!report.region) {
    return null
  }

  return [report.region.village, report.region.district, report.region.city, report.region.province]
    .filter((item): item is string => Boolean(item))
    .join(', ')
}

function getMapUrl(report: PublicReportDetailDto): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${report.latitude},${report.longitude}`)}`
}

export default async function PublicReportDetailPage({ params }: PublicReportDetailPageProps): Promise<React.ReactElement> {
  const { id, locale } = await params
  const [report, t, statusT] = await Promise.all([
    getPublicReportDetail(id),
    getTranslations('common.publicReportDetail'),
    getTranslations('common.publicMap.status')
  ])

  if (!report) {
    notFound()
  }

  const region = formatRegion(report)
  const coordinates = `${report.latitude}, ${report.longitude}`

  return (
    <main className="bg-muted/30 min-h-screen">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="w-fit px-0">
            <Link href="/map">← {t('backToMap')}</Link>
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{t('reportCode')}: {report.reportCode}</Badge>
                <StatusBadge status={report.status} label={statusT(report.status)} />
              </div>
              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  {report.title}
                </h1>
                <p className="text-muted-foreground max-w-3xl text-base leading-7 sm:text-lg">
                  {report.description}
                </p>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-2 p-4">
                <p className="text-primary text-sm font-semibold">{t('privacyNote')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('description')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label={t('category')} value={report.category.name} />
                <DetailItem label={t('status')} value={statusT(report.status)} />
                <DetailItem label={t('createdAt')} value={formatDateTime(report.createdAt, locale)} />
                <DetailItem label={t('updatedAt')} value={formatDateTime(report.updatedAt, locale)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('evidencePhotos')}</CardTitle>
            </CardHeader>
            <CardContent>
              {report.photos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {report.photos.map((photo) => (
                    <EvidencePhoto key={photo.id} photo={photo} title={report.title} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('noPhotos')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('timeline')}</CardTitle>
              <CardDescription>{t('timelineDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-s pl-6">
                {report.histories.map((history) => (
                  <li key={history.id} className="relative">
                    <span className="bg-primary absolute -start-[1.95rem] top-1 flex size-3 rounded-full ring-4 ring-background" />
                    <div className="space-y-1">
                      <StatusBadge status={history.status} label={statusT(history.status)} />
                      <p className="text-muted-foreground text-sm">{formatDateTime(history.createdAt, locale)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('location')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem label={t('coordinates')} value={coordinates} />
              {report.address ? <DetailItem label={t('address')} value={report.address} /> : null}
              {region ? <DetailItem label={t('region')} value={region} /> : null}
              <Separator />
              <Button asChild className="w-full">
                <a href={getMapUrl(report)} target="_blank" rel="noreferrer">
                  {t('openMap')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  )
}

function DetailItem({ label, value }: DetailItemProps): React.ReactElement {
  return (
    <div className="space-y-1 rounded-xl border bg-card p-4">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-foreground text-sm font-semibold leading-6">{value}</p>
    </div>
  )
}

function StatusBadge({ status, label }: { status: PublicReportStatus; label: string }): React.ReactElement {
  return <Badge variant={STATUS_BADGE_VARIANTS[status]}>{label}</Badge>
}

async function EvidencePhoto({ photo, title }: { photo: ReportPhotoDto; title: string }): Promise<React.ReactElement> {
  const t = await getTranslations('common.publicReportDetail')

  return (
    <figure className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="bg-muted aspect-video overflow-hidden">
        <Image
          src={photo.url}
          alt={photo.caption ?? t('photoAlt', { title })}
          width={720}
          height={405}
          className="size-full object-cover"
          unoptimized
        />
      </div>
      <figcaption className="space-y-1 p-4">
        <Badge variant="outline">{t(`photoType.${photo.type}`)}</Badge>
        {photo.caption ? <p className="text-muted-foreground text-sm">{photo.caption}</p> : null}
      </figcaption>
    </figure>
  )
}
