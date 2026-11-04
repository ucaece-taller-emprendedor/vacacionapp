export const ROLES = ['client', 'provider', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = { client: 'Turista', provider: 'Prestador', admin: 'Administrador' }

export const USER_STATUSES = ['active', 'suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const COMMERCE_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const
export type CommerceStatus = (typeof COMMERCE_STATUSES)[number]

export const COMMERCE_STATUS_LABELS: Record<CommerceStatus, string> = {
  pending: 'pendiente de revisión',
  approved: 'aprobado',
  rejected: 'rechazado',
  suspended: 'suspendido',
}

export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'pendiente',
  confirmed: 'confirmada',
  completed: 'completada',
  cancelled: 'cancelada',
}
