'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Compass, LogOut, Store, UserRound } from 'lucide-react'
import { signOut } from '@/lib/auth/client'
import { LOGO_URL } from '@/lib/catalog'
import type { Role } from '@/lib/roles'

/** Marco de /app: barra superior + navegación inferior en el celular (mobile first). */
export function AppShell({ name, role, children }: { name: string; role: Role; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const items = [
    { href: '/explorar', texto: 'Explorar', Icono: Compass },
    { href: '/app/cuenta', texto: 'Mi cuenta', Icono: UserRound },
    role === 'provider' ? { href: '/app/prestador', texto: 'Prestador', Icono: Store } : { href: '/app/prestador/comercio', texto: 'Sumar comercio', Icono: Store },
  ]
  const activo = (href: string) => pathname === href || (href !== '/explorar' && pathname.startsWith(`${href}/`))

  async function cerrarSesion() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-20 text-[#183b4d] md:pb-0">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-[#123d51] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo de VacacionApp" className="size-9 rounded-full bg-white object-contain p-1" />
            <span className="font-semibold">Vacacion<span className="text-[#f5a623]">App</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map(({ href, texto }) => (
              <Link key={href} href={href} className={`rounded-full px-4 py-2 text-sm font-medium ${activo(href) ? 'bg-white/15' : 'hover:bg-white/10'}`}>{texto}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/80 sm:inline">{name}</span>
            <button onClick={cerrarSesion} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm" aria-label="Cerrar sesión"><LogOut className="size-4" /><span className="hidden sm:inline">Cerrar sesión</span></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[#dbe8e5] bg-white md:hidden">
        {items.map(({ href, texto, Icono }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold ${activo(href) ? 'text-[#147e88]' : 'text-[#6d858b]'}`}><Icono className="size-5" />{texto}</Link>
        ))}
      </nav>
    </div>
  )
}
