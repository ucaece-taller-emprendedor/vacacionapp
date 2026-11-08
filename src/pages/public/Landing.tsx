import { CalendarCheck, Search, ShieldCheck, Star, Store, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { BotonLink } from '@/components/ui'
import { CATEGORIAS, LANDING } from '@/config/app'

const iconosBeneficio = [ShieldCheck, Star, Users]
const iconosPaso = [Search, CalendarCheck, Store]

function BuscadorHero() {
  const navegar = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  function buscar(e: FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (cat) p.set('categoria', cat)
    navegar(`/explorar?${p.toString()}`)
  }
  return (
    <form onSubmit={buscar} className="mt-10 flex max-w-2xl flex-col gap-2 rounded-tema bg-superficie p-3 text-texto sm:flex-row" role="search">
      <label className="sr-only" htmlFor="hero-q">¿Qué querés hacer?</label>
      <input id="hero-q" value={q} onChange={e => setQ(e.target.value)} placeholder="¿Qué querés hacer? Surf, spa, carpa…" className="min-h-11 flex-1 rounded-tema px-3" />
      <label className="sr-only" htmlFor="hero-cat">Categoría</label>
      <select id="hero-cat" value={cat} onChange={e => setCat(e.target.value)} className="min-h-11 rounded-tema border border-borde px-3">
        <option value="">Todas las categorías</option>
        {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
      </select>
      <button type="submit" className="min-h-11 rounded-full bg-primario px-6 font-semibold text-primario-texto">Buscar</button>
    </form>
  )
}

export default function Landing() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0d5369] text-white">
        <img src="/hero.webp" alt="Playa de Mar del Plata" className="absolute inset-0 size-full object-cover opacity-55" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#073d52]/90 via-[#0c5368]/55 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-24">
          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm">Todo lo que necesitás para disfrutar</span>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Organizá tus vacaciones.<br />
            <span className="text-[#f5c36b]">Disfrutá el viaje.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/85">Encontrá, compará y reservá experiencias únicas en Mar del Plata desde un solo lugar.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <BotonLink to="/app/registro" variante="acento">Registrarme</BotonLink>
            <BotonLink to="/app/ingresar" variante="borde" className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10">Ingresar</BotonLink>
          </div>
          <BuscadorHero />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2">
        {[LANDING.problema, LANDING.solucion].map((b, i) => (
          <div key={b.titulo}>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primario">{i === 0 ? 'El problema' : 'La solución'}</p>
            <h2 className="mt-3 text-3xl font-semibold">{b.titulo}</h2>
            <p className="mt-4 text-suave">{b.texto}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primario">Beneficios</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LANDING.beneficios.map((b, i) => {
            const Icono = iconosBeneficio[i] ?? Star
            return (
              <div key={b.titulo} className="rounded-tema bg-superficie p-5">
                <Icono className="text-primario" aria-hidden />
                <h3 className="mt-3 font-semibold">{b.titulo}</h3>
                <p className="mt-2 text-sm text-suave">{b.texto}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primario">Cómo funciona</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LANDING.pasos.map((p, i) => {
            const Icono = iconosPaso[i] ?? Search
            return (
              <div key={p.titulo} className="rounded-tema border border-borde bg-superficie p-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-primario/10 text-primario"><Icono className="size-5" aria-hidden /></span>
                <h3 className="mt-3 font-semibold">{i + 1}. {p.titulo}</h3>
                <p className="mt-2 text-sm text-suave">{p.texto}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl bg-[#123d51] p-8 text-center text-white sm:p-12">
          <h2 className="text-3xl font-semibold">{LANDING.cta.titulo}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">{LANDING.cta.texto}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <BotonLink to="/app/registro" variante="acento">Registrarme</BotonLink>
            <BotonLink to="/explorar" variante="borde" className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10">Explorar servicios</BotonLink>
            <BotonLink to="/app/registro?tipo=prestador" variante="borde" className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10">Sumar mi comercio</BotonLink>
          </div>
          <p className="mt-6 text-xs text-white/50">Proyecto académico del Taller Emprendedor · Los pagos son simulados.</p>
        </div>
      </section>
    </>
  )
}
