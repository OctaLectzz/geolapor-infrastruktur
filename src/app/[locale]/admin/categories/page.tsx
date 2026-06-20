import { useTranslations } from 'next-intl'

import { PlaceholderPage } from '@/components/shared/placeholder-page'

export default function CategoriesPage(): React.ReactElement {
  const t = useTranslations('common.navigation')
  const app = useTranslations('common.app')

  return <PlaceholderPage title={t('categories')} description={app('tagline')} />
}
