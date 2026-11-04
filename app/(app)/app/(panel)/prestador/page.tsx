import { ProviderDashboard } from '@/components/provider-dashboard'
import { requirePageRole } from '@/lib/auth/guards'

export const metadata = { title: 'Panel del proveedor | VacacionApp' }

export default async function PrestadorPage() {
  await requirePageRole('provider')
  return <ProviderDashboard />
}
