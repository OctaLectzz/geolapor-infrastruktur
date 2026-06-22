import { UserRole } from '@generated/prisma/enums'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prisma } from '@/lib/prisma'

export default async function AdminOfficersPage(): Promise<React.ReactElement> {
  const officers = await prisma.userProfile.findMany({
    where: {
      role: UserRole.OFFICER,
      isActive: true
    },
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      agencyId: true,
      agency: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return <AdminOfficersPageContent officers={officers} />
}

interface OfficerRow {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  agencyId: string | null
  agency: { id: string; name: string } | null
}

function AdminOfficersPageContent({ officers }: { officers: OfficerRow[] }): React.ReactElement {
  const t = useTranslations('common.admin.officers')

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
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('columns.email')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('columns.phone')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('columns.agency')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                    {t('empty.title')}
                    <p className="text-muted-foreground mt-1 text-xs">{t('empty.description')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                officers.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.fullName}</TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">{officer.email}</TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                      {officer.phoneNumber ?? <span className="italic">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                      {officer.agency ? (
                        <Badge variant="secondary">{officer.agency.name}</Badge>
                      ) : (
                        <span className="italic">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
