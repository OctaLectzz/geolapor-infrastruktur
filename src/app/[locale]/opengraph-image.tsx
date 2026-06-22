import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const alt = 'Roostvasum'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  
  // Fetch Inter Bold font from Google Fonts CDN
  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp5GPjty.ttf')
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #020617, #064e3b)',
          fontFamily: 'Inter',
          color: 'white',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* Decorative Grid Lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            opacity: 0.08,
            backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Logo and App Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {/* Location Marker SVG representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#10b981',
              color: 'white',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '-0.05em',
              color: '#ffffff',
            }}
          >
            Roostvasum
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            textAlign: 'center',
            maxWidth: 1000,
            lineHeight: 1.25,
            marginBottom: 24,
            letterSpacing: '-0.03em',
            color: '#ffffff',
          }}
        >
          {locale === 'id'
            ? 'Bantu Kota Bergerak Lebih Cepat dari Laporan Hingga Perbaikan'
            : 'Help the City Move Faster from Report to Repair'}
        </div>

        {/* Subtitle / Tagline */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.5,
            color: '#94a3b8',
          }}
        >
          {t('app.tagline')}
        </div>

        {/* Footer Info Row */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 16,
            fontWeight: 600,
            color: '#10b981',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          <span>● GEOLOCATION REPORTING</span>
          <span>● COMMUNITY-DRIVEN</span>
          <span>● TRANSPARENT PROGRESS</span>
        </div>
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
