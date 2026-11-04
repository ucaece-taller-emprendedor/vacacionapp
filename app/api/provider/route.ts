import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, commerce, providerService } from '@/lib/db/schema'

async function sessionUser() { const current = await auth.api.getSession({ headers: await headers() }); return current?.user ?? null }
async function ownedCommerce(userId: string) { return db.select().from(commerce).where(eq(commerce.ownerId, userId)) }

export async function GET() {
  const user = await sessionUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const businesses = await ownedCommerce(user.id)
  const businessIds = businesses.map(item => item.id)
  const services = businessIds.length ? await db.select().from(providerService).where(eq(providerService.ownerId, user.id)).orderBy(desc(providerService.createdAt)) : []
  const reservations = businesses.length ? await db.select().from(booking).where(eq(booking.provider, businesses[0].name)).orderBy(desc(booking.createdAt)) : []
  const confirmed = reservations.filter(item => item.status === 'confirmed').length
  const cancelled = reservations.filter(item => item.status === 'cancelled').length
  return NextResponse.json({ commerce: businesses, services, bookings: reservations, metrics: { total: reservations.length, pending: reservations.filter(item => item.status === 'pending').length, confirmed, cancelled, completed: reservations.filter(item => item.status === 'completed').length, revenue: reservations.filter(item => item.status === 'confirmed' || item.status === 'completed').reduce((sum, item) => sum + item.total, 0), cancellationRate: reservations.length ? Math.round(cancelled / reservations.length * 100) : 0 } })
}

export async function POST(request: Request) {
  const user = await sessionUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { type?: string; commerceId?: string; title?: string; description?: string; category?: string; price?: number; unit?: string; active?: boolean }
  const businesses = await ownedCommerce(user.id); if (!businesses.some(item => item.id === body.commerceId)) return NextResponse.json({ error: 'Comercio no autorizado' }, { status: 403 })
  const price = body.price
  if (!body.title?.trim() || !body.description?.trim() || !body.category?.trim() || typeof price !== 'number' || !Number.isInteger(price) || price < 0) return NextResponse.json({ error: 'Completá los datos del servicio' }, { status: 400 })
  const row = { id: crypto.randomUUID(), commerceId: body.commerceId!, ownerId: user.id, title: body.title.trim(), description: body.description.trim(), category: body.category.trim(), price, unit: body.unit?.trim() || 'por día', active: body.active !== false && businesses.find(item => item.id === body.commerceId)?.status === 'approved' }
  await db.insert(providerService).values(row); return NextResponse.json(row, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await sessionUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { id?: string; title?: string; description?: string; category?: string; price?: number; unit?: string; active?: boolean; status?: string }
  if (!body.id) return NextResponse.json({ error: 'Falta el servicio' }, { status: 400 })
  const changes = { ...(body.title !== undefined ? { title: body.title.trim() } : {}), ...(body.description !== undefined ? { description: body.description.trim() } : {}), ...(body.category !== undefined ? { category: body.category.trim() } : {}), ...(body.price !== undefined ? { price: body.price } : {}), ...(body.unit !== undefined ? { unit: body.unit.trim() } : {}), ...(body.active !== undefined ? { active: body.active } : {}) }
  const result = await db.update(providerService).set(changes).where(and(eq(providerService.id, body.id), eq(providerService.ownerId, user.id))).returning(); if (!result.length) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 }); return NextResponse.json(result[0])
}
