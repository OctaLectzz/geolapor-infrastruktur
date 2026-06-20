import { useTranslations } from 'next-intl'

import { PlaceholderPage } from '@/components/shared/placeholder-page'

export default function MyReportsPage(): React.ReactElement {
  const t = useTranslations('common.navigation')
  const app = useTranslations('common.app')

  return <PlaceholderPage title={t('myReports')} description={app('tagline')} />
}
