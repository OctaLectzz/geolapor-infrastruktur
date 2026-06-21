'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { CategoryDto } from '@/types/category'

const PUBLIC_STATUS_OPTIONS = ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'NEED_REVIEW', 'COMPLETED'] as const

interface MapFilterPanelProps {
  categories: CategoryDto[]
  selectedStatus: string
  selectedCategory: string
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onReset: () => void
  isLoading: boolean
}

export function MapFilterPanel({
  categories,
  selectedStatus,
  selectedCategory,
  onStatusChange,
  onCategoryChange,
  onReset,
  isLoading
}: MapFilterPanelProps): React.ReactElement {
  const t = useTranslations('common.publicMap.filters')
  const statusT = useTranslations('common.publicMap.status')

  return (
    <Card className="shrink-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            {PUBLIC_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {statusT(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ''}
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="flex-1" disabled={isLoading}>
            {t('reset')}
          </Button>
        </div>

        {isLoading ? <p className="text-muted-foreground text-center text-xs">{t('loading')}</p> : null}
      </CardContent>
    </Card>
  )
}
