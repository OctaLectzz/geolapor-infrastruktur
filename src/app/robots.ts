import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/id',
        '/en',
        '/id/map',
        '/en/map',
        '/id/help',
        '/en/help',
        '/id/reports/',
        '/en/reports/',
      ],
      disallow: [
        '/*/admin/',
        '/*/officer/',
        '/*/dashboard/',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
