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

  const hasActiveFilters = selectedStatus !== 'all' || selectedCategory !== 'all'

  return (
    <div className="flex flex-col gap-2 shrink-0 border-b pb-3 mb-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{t('title')}</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80"
            disabled={isLoading}
          >
            {t('reset')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">{t('allStatuses')}</SelectItem>
            {PUBLIC_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {statusT(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">{t('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="text-xs">
                {category.icon ? `${category.icon} ` : ''}
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground text-center text-[10px]">{t('loading')}</p> : null}
    </div>
  )
}
