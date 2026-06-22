'use client'

import { useCallback, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'

import type { AuditLogListResponse } from '@/types/audit-log'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

export function AdminAuditLogListClient(): React.ReactElement {
  const t = useTranslations('common.admin.auditLogs')
  const tPagination = useTranslations('dashboard.tables.pagination')

  const [page, setPage] = useState(DEFAULT_PAGE)
  const limit = DEFAULT_LIMIT

  const { data, isLoading, isError } = useQuery<AuditLogListResponse>({
    queryKey: ['admin', 'audit-logs', { page, limit }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/audit-logs?page=${page}&limit=${limit}`)
      const result = await response.json()
      return result.data as AuditLogListResponse
    }
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  const handlePageChange = useCallback((newPage: number): void => {
    setPage(newPage)
  }, [])

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.time')}</TableHead>
                <TableHead>{t('columns.actor')}</TableHead>
                <TableHead>{t('columns.action')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('columns.entity')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('columns.details')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingSkeleton />
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    {t('messages.unexpectedError')}
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    {t('empty.title')}
                    <p className="text-muted-foreground mt-1 text-xs">{t('empty.description')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{log.actorName ?? log.actorEmail ?? <span className="italic">—</span>}</TableCell>
                    <TableCell>
                      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{log.action}</code>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">
                      <span className="text-muted-foreground text-xs">
                        {log.entityType}:{log.entityId ? log.entityId.slice(0, 8) : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-xs lg:table-cell">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) : <span className="italic">—</span>}
                    </TableCell>
                  </TableRow>
                ))
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
    </main>
  )
}

function TableLoadingSkeleton(): React.ReactElement {
  const SKELETON_ROW_COUNT = 5

  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
        <TableRow key={`skeleton-${String(index)}`}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-4 w-40" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
