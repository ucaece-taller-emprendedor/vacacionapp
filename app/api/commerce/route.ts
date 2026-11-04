import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { commerce } from '@/lib/db/schema'

export async function POST(request: Request) { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json() as Record<string, string>; const required = ['name','category','description','contactName','email','phone','address','city','province']; if (required.some(key => !body[key]?.trim())) return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 }); const row = { id: crypto.randomUUID(), ownerId: session.user.id, name: body.name.trim(), category: body.category.trim(), description: body.description.trim(), contactName: body.contactName.trim(), email: body.email.trim(), phone: body.phone.trim(), address: body.address.trim(), city: body.city.trim(), province: body.province.trim() }; await db.insert(commerce).values(row); return NextResponse.json({ ...row, status: 'pending' }, { status: 201 }) }
