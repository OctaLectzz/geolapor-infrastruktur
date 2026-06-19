import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from '@/i18n/routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale

  const [common, auth, reports, dashboard] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/reports.json`),
    import(`../../messages/${locale}/dashboard.json`)
  ])

  return {
    locale,
    messages: {
      common: common.default,
      auth: auth.default,
      reports: reports.default,
      dashboard: dashboard.default
    }
  }
})
