// Constantes y tipos del catálogo, seguros para usar tanto en el servidor como en el cliente.

export const LOGO_URL =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20vacacion%20app-XBRbOP4b0xurwGQXE7Ej5OejRR5850.png'
export const HERO_URL =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/balneario%20alfonsina-tmtgXmM00TjCqMbkMQCV6Cb3XHjLCV.png'

export const LOCATIONS = ['Todas las zonas', 'Playa Grande', 'Varese', 'La Perla', 'Bristol', 'Punta Iglesia', 'Puerto']
export const CATEGORIES = ['Todas', 'Carpas y sombrillas', 'Actividades acuáticas', 'Bienestar y spa', 'Gastronomía']

export type Service = {
  id: string
  title: string
  provider: string
  location: string
  price: number
  unit: string
  rating: number
  reviews: number
  image: string
  tag: string
  duration: string
  category: string
  description: string
  includes: string[]
  policy: string
}

export type BookingForm = { from: string; to: string; people: string; shift: string }

export const today = () => new Date().toISOString().split('T')[0]
export const money = (n: number) => `$${n.toLocaleString('es-AR')}`

export const shifts = (category: string) =>
  category === 'Carpas y sombrillas'
    ? ['Día completo']
    : category === 'Actividades acuáticas'
      ? ['09:00 · 2 h', '11:00 · 2 h', '15:00 · 2 h']
      : category === 'Bienestar y spa'
        ? ['10:00 · 60 min', '13:00 · 60 min', '17:00 · 60 min']
        : ['12:00–13:30', '13:30–15:00', '20:30–22:00']

/** Las carpas se cobran por día; el resto, por persona. Lo usa el cliente (vista previa) y el servidor (monto real). */
export const bookingTotal = (service: Pick<Service, 'category' | 'price'>, people: number) =>
  service.category === 'Carpas y sombrillas' ? service.price : service.price * Math.max(1, people)
