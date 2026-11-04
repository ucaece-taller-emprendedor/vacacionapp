import type { ReactNode } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { requirePageRole } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

export default async function PanelAdminLayout({ children }: { children: ReactNode }) {
  const actual = await requirePageRole('admin', '/admin/login')
  return <AdminShell name={actual.name}>{children}</AdminShell>
}
