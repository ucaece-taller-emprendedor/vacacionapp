import Link from 'next/link'
import type { ReactNode } from 'react'
import { LOGO_URL } from '@/lib/catalog'

/** Marco visual de las pantallas de ingreso y registro (mobile first). */
export function AuthPage({ titulo, kicker, children, pie }: { titulo: string; kicker: string; children: ReactNode; pie?: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf7] px-5 py-10 text-[#183b4d]">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <img src={LOGO_URL} alt="Logo de VacacionApp" className="size-11 rounded-full bg-white object-contain p-1 shadow" />
        <span className="text-lg font-semibold">Vacacion<span className="text-[#f5a623]">App</span></span>
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-[#dbe8e5] bg-white p-7 shadow-xl">
        <p className="text-sm font-semibold text-[#147e88]">{kicker}</p>
        <h1 className="mt-1 text-2xl font-semibold">{titulo}</h1>
        {children}
      </div>
      {pie}
    </main>
  )
}
