import type { Estado, Rol } from '@/config/app'

export type Usuario = { email: string; displayName: string; role: Rol; status: Estado; isDemo: boolean }

export type EstadoComercio = 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'
export type Comercio = {
  ownerId: string
  name: string
  category: string
  description: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  status: EstadoComercio
  isDemo: boolean
}

export type Servicio = {
  ownerId: string
  commerceName: string
  title: string
  description: string
  category: string
  location: string
  price: number
  unit: string
  rating: number
  reviews: number
  image: string
  tag: string
  duration: string
  includes: string[]
  policy: string
  active: boolean
  isDemo: boolean
}

export type EstadoReserva = 'confirmada' | 'cancelada' | 'completada'
export type Reserva = {
  userId: string
  userName: string
  userEmail: string
  serviceId: string
  ownerId: string
  serviceTitle: string
  commerceName: string
  location: string
  fromDate: string
  toDate: string
  people: number
  shift: string
  total: number
  status: EstadoReserva
  payment: { metodo: string; estado: 'simulado'; monto: number }
  /** Timestamp de Firestore (puede ser null un instante antes de que el servidor lo confirme). */
  createdAt?: { toDate: () => Date } | null
}
