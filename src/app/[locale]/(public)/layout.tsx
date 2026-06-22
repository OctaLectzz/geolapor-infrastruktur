import type { ReactNode } from 'react'

import { PublicLayout } from '@/components/shared/public-layout'

export const dynamic = 'force-dynamic'

interface PublicRouteLayoutProps {
  children: ReactNode
}

export default async function PublicRouteLayout({ children }: PublicRouteLayoutProps): Promise<ReactNode> {
  return <PublicLayout>{children}</PublicLayout>
}
