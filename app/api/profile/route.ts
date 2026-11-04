import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

async function currentUser() { const session = await auth.api.getSession({ headers: await headers() }); return session?.user ?? null }
export async function GET() { const sessionUser = await currentUser(); if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const rows = await db.select({ id: user.id, name: user.name, email: user.email, phone: user.phone }).from(user).where(eq(user.id, sessionUser.id)); return NextResponse.json(rows[0]) }
export async function PATCH(request: Request) { const sessionUser = await currentUser(); if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json() as { name?: string; phone?: string }; const name = body.name?.trim(); if (!name) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 }); const rows = await db.update(user).set({ name, phone: body.phone?.trim() || null, updatedAt: new Date() }).where(eq(user.id, sessionUser.id)).returning({ id: user.id, name: user.name, email: user.email, phone: user.phone }); return NextResponse.json(rows[0]) }
