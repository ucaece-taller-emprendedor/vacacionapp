import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, favorite } from '@/lib/db/schema'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [favorites, bookings] = await Promise.all([
    db.select().from(favorite).where(eq(favorite.userId, userId)),
    db.select().from(booking).where(eq(booking.userId, userId)).orderBy(desc(booking.createdAt)),
  ])
  return NextResponse.json({ favorites, bookings })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { type?: string; serviceTitle?: string; provider?: string; location?: string; fromDate?: string; toDate?: string; people?: number; shift?: string; total?: number }
  if (body.type === 'favorite' && body.serviceTitle) {
    const row = { id: crypto.randomUUID(), userId, serviceTitle: body.serviceTitle }
    await db.insert(favorite).values(row).onConflictDoNothing()
    return NextResponse.json(row, { status: 201 })
  }
  if (body.type === 'booking' && body.serviceTitle && body.provider && body.location && body.fromDate && body.toDate && body.shift && Number.isInteger(body.people) && Number.isInteger(body.total)) {
    const row = { id: crypto.randomUUID(), userId, serviceTitle: body.serviceTitle, provider: body.provider, location: body.location, fromDate: body.fromDate, toDate: body.toDate, people: body.people!, shift: body.shift, total: body.total! }
    await db.insert(booking).values(row)
    return NextResponse.json(row, { status: 201 })
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const serviceTitle = searchParams.get('serviceTitle')
  if (!serviceTitle) return NextResponse.json({ error: 'Missing serviceTitle' }, { status: 400 })
  await db.delete(favorite).where(and(eq(favorite.userId, userId), eq(favorite.serviceTitle, serviceTitle)))
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { bookingId?: string; action?: string }
  if (!body.bookingId || body.action !== 'cancel') return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const result = await db.update(booking).set({ status: 'cancelled', cancelledAt: new Date() }).where(and(eq(booking.id, body.bookingId), eq(booking.userId, userId), eq(booking.status, 'confirmed'))).returning()
  if (!result.length) return NextResponse.json({ error: 'La reserva no se puede cancelar' }, { status: 409 })
  return NextResponse.json(result[0])
}
