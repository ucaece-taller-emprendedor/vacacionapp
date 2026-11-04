import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

// Primera barrera (optimista): sin cookie de sesión no se entra a /app ni a /admin.
// La validación real del rol se hace en el servidor con requireRole / requirePageRole.
const PUBLICAS_APP = ['/app/ingresar', '/app/registro']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const haySesion = Boolean(getSessionCookie(request))

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !haySesion) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (pathname.startsWith('/app') && !PUBLICAS_APP.some(ruta => pathname.startsWith(ruta)) && !haySesion) {
    const destino = new URL('/app/ingresar', request.url)
    destino.searchParams.set('next', pathname)
    return NextResponse.redirect(destino)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*', '/admin/:path*'] }
