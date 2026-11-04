import { and, asc, eq } from 'drizzle-orm'
import type { Service } from '@/lib/catalog'
import { db } from '@/lib/db'
import { commerce, service } from '@/lib/db/schema'

const columnas = {
  id: service.id,
  title: service.title,
  provider: commerce.name,
  location: service.location,
  price: service.price,
  unit: service.unit,
  rating: service.rating,
  reviews: service.reviews,
  image: service.image,
  tag: service.tag,
  duration: service.duration,
  category: service.category,
  description: service.description,
  includes: service.includes,
  policy: service.policy,
}

/** Servicios visibles al público: activos y de comercios aprobados. */
export async function listPublicServices(): Promise<Service[]> {
  return db
    .select(columnas)
    .from(service)
    .innerJoin(commerce, eq(service.commerceId, commerce.id))
    .where(and(eq(service.active, true), eq(commerce.status, 'approved')))
    .orderBy(asc(service.createdAt), asc(service.id))
}
