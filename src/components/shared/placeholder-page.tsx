import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: ReactNode
  description: ReactNode
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps): ReactNode {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-muted/40 border-b">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div className="bg-card rounded-xl border p-4 shadow-sm">
            <div className="bg-primary/30 h-2 w-20 rounded-full" />
            <div className="bg-muted mt-4 h-8 rounded-lg" />
          </div>
          <div className="bg-card rounded-xl border p-4 shadow-sm">
            <div className="bg-info/30 h-2 w-24 rounded-full" />
            <div className="bg-muted mt-4 h-8 rounded-lg" />
          </div>
          <div className="bg-card rounded-xl border p-4 shadow-sm">
            <div className="bg-success/30 h-2 w-16 rounded-full" />
            <div className="bg-muted mt-4 h-8 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
