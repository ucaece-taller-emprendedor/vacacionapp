'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/lib/auth/client'
import { LOGO_URL } from '@/lib/catalog'

const secciones = [
  { href: '/admin', texto: 'Resumen' },
  { href: '/admin/usuarios', texto: 'Usuarios' },
  { href: '/admin/comercios', texto: 'Comercios' },
  { href: '/admin/servicios', texto: 'Servicios' },
  { href: '/admin/reservas', texto: 'Reservas' },
]

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function cerrarSesion() {
    await signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#183b4d]">
      <header className="bg-[#123d51] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo de VacacionApp" className="size-9 rounded-full bg-white object-contain p-1" />
            <span className="font-semibold">Vacacion<span className="text-[#f5a623]">App</span> <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">Admin</span></span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/80 sm:inline">{name}</span>
            <button onClick={cerrarSesion} className="rounded-full bg-white/10 px-3 py-2">Cerrar sesión</button>
          </div>
        </div>
        <nav aria-label="Secciones de administración" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {secciones.map(({ href, texto }) => {
            const activa = href === '/admin' ? pathname === href : pathname.startsWith(href)
            return <Link key={href} href={href} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${activa ? 'bg-white/20' : 'hover:bg-white/10'}`}>{texto}</Link>
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
