'use client'

import { X } from 'lucide-react'

export function InfoModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123d51]/50 p-5">
      <div className="max-w-md rounded-3xl bg-white p-7">
        <div className="flex justify-between gap-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar"><X /></button>
        </div>
        <p className="mt-4 text-sm text-[#6d858b]">
          {title === 'Contacto' ? 'Escribinos a hola@vacacionapp.com.ar y te ayudamos con tu viaje.' : 'Estamos preparando esta sección para la próxima versión del MVP.'}
        </p>
      </div>
    </div>
  )
}
