import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

export function PestanasPanel({ titulo, pestanas, arriba }: { titulo: string; pestanas: { to: string; etiqueta: string; fin?: boolean }[]; arriba?: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      {arriba && <div className="mt-3">{arriba}</div>}
      <nav aria-label="Secciones del panel" className="mt-4 flex gap-1 overflow-x-auto border-b border-borde pb-2">
        {pestanas.map(p => (
          <NavLink key={p.to} to={p.to} end={p.fin} className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${isActive ? 'bg-primario text-primario-texto' : 'hover:bg-primario/10'}`}>
            {p.etiqueta}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}
