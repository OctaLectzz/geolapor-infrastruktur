import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { PUBLIC_REPORT_STATUSES } from '@/schemas/report-schema'
import { ReportStatus } from '@generated/prisma/enums'

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const locales = ['id', 'en']
  const paths = ['', '/map', '/help']
  
  // Static pages sitemap entries
  const staticEntries = locales.flatMap((locale) => 
    paths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: path === '' ? 1.0 : 0.8,
    }))
  )
  
  // Dynamic report sitemap entries
  let reports: Array<{ id: string; updatedAt: Date }> = []
  try {
    reports = await prisma.report.findMany({
      where: {
        status: {
          in: toReportStatusValues(PUBLIC_REPORT_STATUSES)
        }
      },
      select: {
        id: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Sitemap generation failed to fetch reports:', error)
  }
  
  const reportEntries = locales.flatMap((locale) =>
    reports.map((report) => ({
      url: `${baseUrl}/${locale}/reports/${report.id}`,
      lastModified: report.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  )
  
  return [...staticEntries, ...reportEntries]
}
