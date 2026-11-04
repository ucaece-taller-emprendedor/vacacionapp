'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth/client'
import { LOGO_URL } from '@/lib/catalog'

export function SiteHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [accountMenu, setAccountMenu] = useState(false)
  const user = session?.user as { name: string; role?: string } | undefined
  const ingresar = `/app/ingresar?next=${encodeURIComponent(pathname)}`

  async function cerrarSesion() {
    await signOut()
    setAccountMenu(false)
    router.refresh()
  }

  const opciones = [
    { href: user?.role === 'admin' ? '/admin' : '/app', texto: user?.role === 'admin' ? 'Panel de administración' : 'Mi cuenta' },
    ...(user?.role === 'provider' ? [{ href: '/app/prestador', texto: 'Panel del proveedor' }] : []),
    ...(user?.role === 'client' ? [{ href: '/app/prestador/comercio', texto: 'Sumar mi comercio' }] : []),
  ]

  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-white/20 bg-[#123d51]/85 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo de VacacionApp" className="size-11 rounded-full bg-white object-contain p-1" />
          <span className="text-lg font-semibold">Vacacion<span className="text-[#f5a623]">App</span></span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/explorar" className="text-sm font-medium">Explorar</Link>
        </nav>
        <div className="relative hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <button onClick={() => setAccountMenu(!accountMenu)} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#2bc4c4] text-xs font-bold text-[#073d52]">{user.name[0]}</span>
                {user.name}
              </button>
              {accountMenu && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl bg-white p-2 text-sm text-[#183b4d] shadow-xl">
                  {opciones.map(o => <Link key={o.href} href={o.href} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[#eef7f5]">{o.texto}</Link>)}
                  <button onClick={cerrarSesion} className="w-full rounded-xl px-3 py-2 text-left hover:bg-[#eef7f5]">Cerrar sesión</button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href={ingresar} className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10">Ingresar</Link>
              <Link href="/app/registro" className="inline-flex h-8 items-center rounded-full bg-[#f5a623] px-4 text-sm font-semibold text-[#183b4d] hover:bg-[#ffc15a]">Registrarme</Link>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="text-white md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú"><Menu /></Button>
      </div>
      {mobileMenu && (
        <div className="flex flex-col items-start gap-4 border-t border-white/15 bg-[#123d51] px-5 py-5 text-sm">
          <Link href="/explorar">Explorar</Link>
          {user ? (
            <>
              {opciones.map(o => <Link key={o.href} href={o.href}>{o.texto}</Link>)}
              <button onClick={cerrarSesion}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href={ingresar}>Ingresar</Link>
              <Link href="/app/registro" className="font-semibold text-[#f5c36b]">Registrarme</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
