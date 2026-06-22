import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { PUBLIC_REPORT_STATUSES } from '@/schemas/report-schema'
import { ReportStatus } from '@generated/prisma/enums'

export const alt = 'Roostvasum Report'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function toReportStatusValues(statuses: readonly string[]): ReportStatus[] {
  return statuses.map((status) => status as ReportStatus)
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING_VERIFICATION: { bg: '#475569', text: '#ffffff' }, // Slate
  VERIFIED: { bg: '#2563eb', text: '#ffffff' }, // Blue
  REJECTED: { bg: '#dc2626', text: '#ffffff' }, // Red
  ASSIGNED: { bg: '#4f46e5', text: '#ffffff' }, // Indigo
  IN_PROGRESS: { bg: '#d97706', text: '#ffffff' }, // Amber
  NEED_REVIEW: { bg: '#ea580c', text: '#ffffff' }, // Orange
  COMPLETED: { bg: '#16a34a', text: '#ffffff' }, // Green
  CANCELLED: { bg: '#64748b', text: '#ffffff' } // Light slate
}

export default async function Image({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  
  // Fetch Inter Bold font
  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp5GPjty.ttf')
  ).then((res) => res.arrayBuffer())

  // Fetch report details from database
  let report = null
  try {
    report = await prisma.report.findFirst({
      where: {
        id,
        status: {
          in: toReportStatusValues(PUBLIC_REPORT_STATUSES)
        }
      },
      select: {
        reportCode: true,
        title: true,
        description: true,
        status: true,
        category: { select: { name: true } },
        photos: { select: { url: true }, take: 1 }
      }
    })
  } catch (error) {
    console.error('OG Image Prisma Query Error:', error)
  }

  // Fallback if report not found
  if (!report) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#020617',
            color: '#ef4444',
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          Report Not Found
        </div>
      ),
      {
        ...size,
        fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 700 }]
      }
    )
  }

  const statusT = await getTranslations({ locale, namespace: 'common.publicMap.status' })
  const statusLabel = statusT(report.status)
  const badgeColors = STATUS_COLORS[report.status] || { bg: '#475569', text: '#ffffff' }
  const photoUrl = report.photos[0]?.url

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          background: '#020617',
          fontFamily: 'Inter',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Section: Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: photoUrl ? '60%' : '100%',
            height: '100%',
            padding: 60,
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #020617, #0f172a)',
            borderRight: photoUrl ? '1px solid #1e293b' : 'none',
          }}
        >
          {/* Header branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#10b981',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
              Roostvasum
            </span>
            <span style={{ fontSize: 16, color: '#64748b', marginLeft: 8 }}>
              • {report.category.name}
            </span>
          </div>

          {/* Report Code, Status and Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                {report.reportCode}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: badgeColors.text,
                  background: badgeColors.bg,
                  padding: '6px 12px',
                  borderRadius: 6,
                }}
              >
                {statusLabel}
              </div>
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#ffffff',
              }}
            >
              {report.title.length > 80 ? `${report.title.slice(0, 80)}...` : report.title}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.5,
                color: '#94a3b8',
              }}
            >
              {report.description.length > 150
                ? `${report.description.slice(0, 150)}...`
                : report.description}
            </div>
          </div>

          {/* Footer branding */}
          <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
            {locale === 'id'
              ? 'Laporan Infrastruktur Publik Geolapor'
              : 'Public Infrastructure Geolocation Report'}
          </div>
        </div>

        {/* Right Section: Image Preview (If photo available) */}
        {photoUrl && (
          <div
            style={{
              display: 'flex',
              width: '40%',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={report.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
