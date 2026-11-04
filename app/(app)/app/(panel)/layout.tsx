import type { ReactNode } from 'react'
import { AppShell } from '@/components/app/app-shell'
import { requirePageRole } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const actual = await requirePageRole(['client', 'provider'])
  return <AppShell name={actual.name} role={actual.role}>{children}</AppShell>
}
