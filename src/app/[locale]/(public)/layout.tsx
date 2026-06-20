import type { ReactNode } from 'react'

import { PublicLayout } from '@/components/shared/public-layout'

interface PublicRouteLayoutProps {
  children: ReactNode
}

export default function PublicRouteLayout({ children }: PublicRouteLayoutProps): ReactNode {
  return <PublicLayout>{children}</PublicLayout>
}
