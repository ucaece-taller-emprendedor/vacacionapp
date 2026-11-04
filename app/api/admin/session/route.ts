import { NextResponse } from 'next/server'
import { route } from '@/lib/api'
import { requireRole } from '@/lib/auth/guards'

// Lo usa el login de /admin para confirmar que la cuenta que ingresó es administradora.
export const GET = route(async () => {
  const actual = await requireRole('admin')
  return NextResponse.json({ id: actual.id, name: actual.name, email: actual.email })
})
