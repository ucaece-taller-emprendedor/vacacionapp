import Link from 'next/link'
import { adminStats } from '@/lib/data/admin'
import { money } from '@/lib/catalog'

export default async function AdminResumen() {
  const s = await adminStats()
  const tarjetas = [
    ['Usuarios', s.usuarios, '/admin/usuarios'],
    ['Comercios pendientes', s.comerciosPendientes, '/admin/comercios'],
    ['Comercios aprobados', s.comerciosAprobados, '/admin/comercios'],
    ['Servicios', s.servicios, '/admin/servicios'],
    ['Reservas', s.reservas, '/admin/reservas'],
    ['Ingresos (simulados)', money(s.ingresos), '/admin/reservas'],
  ] as const
  return (
    <section>
      <h1 className="text-3xl font-semibold">Resumen</h1>
      <p className="mt-2 text-[#6d858b]">Estado general de la plataforma.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map(([titulo, valor, href]) => (
          <Link key={titulo} href={href} className="rounded-3xl border border-[#dbe8e5] bg-white p-5 hover:shadow-md">
            <p className="text-sm text-[#6d858b]">{titulo}</p>
            <p className="mt-1 text-3xl font-semibold">{valor}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
