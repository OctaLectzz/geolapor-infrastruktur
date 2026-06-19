import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export default function ForgotPasswordPage(): React.ReactElement {
  const t = useTranslations('auth')

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-primary)/14,transparent_30rem),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_28rem),linear-gradient(135deg,var(--background),var(--muted))] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden flex-col gap-6 lg:flex">
          <div className="border-border/70 bg-background/70 text-muted-foreground w-fit rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
            {t('layout.eyebrow')}
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="text-foreground max-w-xl text-5xl font-semibold tracking-tight text-balance">{t('layout.title')}</h1>
            <p className="text-muted-foreground max-w-lg text-lg leading-8 text-pretty">{t('layout.description')}</p>
          </div>
          <div className="grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="border-border/70 bg-card/75 text-muted-foreground rounded-2xl border p-4 text-sm shadow-sm backdrop-blur">
              {t('layout.featureLocation')}
            </div>
            <div className="border-border/70 bg-card/75 text-muted-foreground rounded-2xl border p-4 text-sm shadow-sm backdrop-blur">
              {t('layout.featureWorkflow')}
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-background/85 mx-auto w-full max-w-md shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">{t('forgotPassword.title')}</CardTitle>
            <CardDescription>{t('forgotPassword.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
