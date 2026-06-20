'use client'

import { useCallback, useState, useTransition } from 'react'

import { useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link } from '@/i18n/navigation'
import { REPORT_STATUSES } from '@/types/report'
import { useQuery } from '@tanstack/react-query'

import { fetchAdminReports } from '@/features/admin/services/admin-report-service'

import type { AdminReportFilters } from '@/features/admin/services/admin-report-service'
import type { ReportListItemDto } from '@/types/report'

interface CategoryOption {
  id: string
  name: string
}

interface AdminReportTableProps {
  categories: CategoryOption[]
  fixedStatus?: string
  showStatusFilter?: boolean
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export function AdminReportTable({ categories, fixedStatus, showStatusFilter = true }: AdminReportTableProps): React.ReactElement {
  const t = useTranslations('dashboard')
  const tReports = useTranslations('reports')
  const tColumns = useTranslations('dashboard.tables.columns')
  const tPagination = useTranslations('dashboard.tables.pagination')
  const tFilters = useTranslations('dashboard.filters')
  const tEmpty = useTranslations('dashboard.emptyStates')

  const [filters, setFilters] = useState<AdminReportFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    status: fixedStatus
  })
  const [searchInput, setSearchInput] = useState('')
  const [isPending, startTransition] = useTransition()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'reports', filters],
    queryFn: () => fetchAdminReports(filters)
  })

  const updateFilter = useCallback((key: keyof AdminReportFilters, value: string | undefined): void => {
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: DEFAULT_PAGE
      }))
    })
  }, [])

  const handleSearch = useCallback((): void => {
    updateFilter('search', searchInput.trim() || undefined)
  }, [searchInput, updateFilter])

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handlePageChange = useCallback((newPage: number): void => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, page: newPage }))
    })
  }, [])

  const items: ReportListItemDto[] = data?.items ?? []
  const pagination = data?.pagination
  const isLoadingState = isLoading || isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder={tFilters('search')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="max-w-xs"
          />
          <Button variant="secondary" size="sm" onClick={handleSearch}>
            {tFilters('search')}
          </Button>
        </div>

        {showStatusFilter ? (
          <Select value={filters.status ?? 'ALL'} onValueChange={(value) => updateFilter('status', value === 'ALL' ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={tFilters('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tFilters('status')}</SelectItem>
              {REPORT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {tReports(`statuses.${statusToTranslationKey(status)}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {categories.length > 0 ? (
          <Select value={filters.categoryId ?? 'ALL'} onValueChange={(value) => updateFilter('categoryId', value === 'ALL' ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={tFilters('category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tFilters('category')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tColumns('code')}</TableHead>
              <TableHead>{tColumns('title')}</TableHead>
              <TableHead>{tColumns('category')}</TableHead>
              <TableHead>{tColumns('status')}</TableHead>
              <TableHead>{tColumns('location')}</TableHead>
              <TableHead>{tColumns('createdAt')}</TableHead>
              <TableHead className="text-right">{tColumns('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingState ? (
              <TableLoadingSkeleton />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  {t('emptyStates.noData')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  {tEmpty('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((report) => <ReportTableRow key={report.id} report={report} />)
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            {tPagination('page')} {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
              {tPagination('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              {tPagination('next')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ReportTableRow({ report }: { report: ReportListItemDto }): React.ReactElement {
  const tActions = useTranslations('dashboard.admin.actions')

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{report.reportCode}</TableCell>
      <TableCell className="max-w-[200px] truncate font-medium">{report.title}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{report.category.name}</TableCell>
      <TableCell>
        <StatusBadge status={report.status as ReportStatusValue} />
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[150px] truncate text-sm">
        {report.address ?? `${report.latitude}, ${report.longitude}`}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/reports/${report.id}`}>{tActions('review')}</Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function TableLoadingSkeleton(): React.ReactElement {
  const SKELETON_ROW_COUNT = 5

  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
        <TableRow key={`skeleton-${String(index)}`}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

const STATUS_TRANSLATION_MAP: Record<string, string> = {
  PENDING_VERIFICATION: 'pendingVerification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'inProgress',
  NEED_REVIEW: 'needReview',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

function statusToTranslationKey(status: string): string {
  return STATUS_TRANSLATION_MAP[status] ?? status
}
