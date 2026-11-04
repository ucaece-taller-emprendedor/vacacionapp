import { Catalog } from '@/components/catalog/catalog'
import { SiteHeader } from '@/components/site-header'
import { listPublicServices } from '@/lib/data/catalog'
import { env } from '@/lib/env'
import { LOCATIONS } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Explorar servicios | VacacionApp', description: 'Compará y reservá carpas, actividades acuáticas, spa y gastronomía en Mar del Plata.' }

export default async function ExplorarPage({ searchParams }: { searchParams: Promise<{ zona?: string; desde?: string; hasta?: string }> }) {
  const { zona = '', desde = '', hasta = '' } = await searchParams
  const services = await listPublicServices()
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#183b4d]">
      <SiteHeader />
      <Catalog services={services} googleEnabled={env.googleEnabled} initialZone={LOCATIONS.includes(zona) ? zona : ''} initialFrom={desde} initialTo={hasta} />
    </main>
  )
}
