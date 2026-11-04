import Link from 'next/link'
import { CalendarCheck, Search, ShieldCheck, Star, Store, Users } from 'lucide-react'
import { HeroSearch } from '@/components/landing/hero-search'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { HERO_URL } from '@/lib/catalog'

export const metadata = {
  title: 'VacacionApp | Organizá tus vacaciones',
  description: 'Encontrá, compará y reservá experiencias únicas en Mar del Plata desde un solo lugar.',
}

const beneficios = [
  { Icono: ShieldCheck, color: 'text-[#2bbfc2]', titulo: 'Reservá con confianza', texto: 'Proveedores verificados por nuestro equipo antes de publicarse.' },
  { Icono: Star, color: 'text-[#f5a623]', titulo: 'Experiencias reales', texto: 'Opiniones de viajeros que ya disfrutaron.' },
  { Icono: Users, color: 'text-[#2bbfc2]', titulo: 'Todo organizado', texto: 'Tu viaje completo en un solo lugar.' },
]

const pasos = [
  { Icono: Search, titulo: 'Explorá y compará', texto: 'Carpas, actividades acuáticas, spa y gastronomía, con precios y valoraciones lado a lado.' },
  { Icono: CalendarCheck, titulo: 'Reservá online', texto: 'Elegí fecha y horario, y gestioná tus reservas desde tu cuenta.' },
  { Icono: Store, titulo: 'Sumá tu comercio', texto: 'Si sos prestador, publicás tus servicios y recibís reservas en un panel simple.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#183b4d]">
      <SiteHeader />
      <section className="relative flex min-h-[700px] items-center overflow-hidden bg-[#0d5369] pt-24">
        <img src={HERO_URL} alt="Playa de Mar del Plata" className="absolute inset-0 size-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#073d52]/90 via-[#0c5368]/55 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-20 lg:px-10">
          <div className="max-w-2xl">
            <span className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white">Todo lo que necesitás para disfrutar</span>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl">Organizá tus vacaciones.<br /><span className="text-[#f5c36b]">Disfrutá el viaje.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">Encontrá, compará y reservá experiencias únicas en Mar del Plata desde un solo lugar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/registro" className="inline-flex h-11 items-center rounded-full bg-[#f5a623] px-7 font-semibold text-[#183b4d] hover:bg-[#ffc15a]">Registrarme</Link>
              <Link href="/app/ingresar" className="inline-flex h-11 items-center rounded-full border border-white/40 px-7 font-semibold text-white hover:bg-white/10">Ingresar</Link>
            </div>
          </div>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">El problema</p>
          <h2 className="mt-3 text-3xl font-semibold">Reservar servicios turísticos locales es un lío</h2>
          <p className="mt-4 text-[#55707a]">La información está dispersa en redes y llamados, los precios son difíciles de comparar y reservar suele ser informal. Del otro lado, los prestadores no tienen un canal simple para ofrecerse.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">La solución</p>
          <h2 className="mt-3 text-3xl font-semibold">Un solo lugar para encontrar, comparar y reservar</h2>
          <p className="mt-4 text-[#55707a]">VacacionApp reúne balnearios, actividades, bienestar y gastronomía de Mar del Plata. Los turistas reservan en pocos pasos y los prestadores administran sus servicios y reservas desde un panel propio.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Beneficios</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {beneficios.map(({ Icono, color, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl bg-white p-5">
              <Icono className={color} />
              <h3 className="mt-3 font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm text-[#6d858b]">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Cómo funciona</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {pasos.map(({ Icono, titulo, texto }, i) => (
            <div key={titulo} className="rounded-2xl border border-[#dbe8e5] bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#eef7f5] text-[#147e88]"><Icono className="size-5" /></span>
              <h3 className="mt-3 font-semibold">{i + 1}. {titulo}</h3>
              <p className="mt-2 text-sm text-[#6d858b]">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <div className="rounded-3xl bg-[#123d51] p-8 text-center text-white sm:p-12">
          <h2 className="text-3xl font-semibold">Empezá a organizar tus vacaciones</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">Creá tu cuenta gratis, o sumá tu comercio para recibir reservas.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/app/registro" className="inline-flex h-11 items-center rounded-full bg-[#f5a623] px-7 font-semibold text-[#183b4d] hover:bg-[#ffc15a]">Registrarme</Link>
            <Link href="/explorar" className="inline-flex h-11 items-center rounded-full border border-white/40 px-7 font-semibold hover:bg-white/10">Explorar servicios</Link>
            <Link href="/app/registro?tipo=provider" className="inline-flex h-11 items-center rounded-full border border-white/40 px-7 font-semibold hover:bg-white/10">Sumar mi comercio</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
