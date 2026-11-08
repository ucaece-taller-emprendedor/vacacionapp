import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAdmin, RequireAuth, RequireRole } from '@/auth/guards'
import { AdminLayout, SitioLayout } from '@/components/layouts'
import AdminLogin from '@/pages/admin/AdminLogin'
import { AdminComercios, AdminInicio, AdminReservas, AdminServicios, AdminUsuarios } from '@/pages/admin/AdminPaginas'
import { AppInicio, CompletarPerfil, Ingresar, Registro, Suspendido } from '@/pages/app/Acceso'
import { ComercioPrestador, PanelPrestador, ReservasPrestador, ServiciosPrestador } from '@/pages/app/PanelPrestador'
import { CuentaTurista, FavoritosTurista, PanelTurista, ReservasTurista } from '@/pages/app/PanelTurista'
import Reservar from '@/pages/app/Reservar'
import Explorar from '@/pages/public/Explorar'
import Landing from '@/pages/public/Landing'
import NoEncontrada from '@/pages/public/NoEncontrada'
import ServicioDetalle from '@/pages/public/ServicioDetalle'

const NAV = [{ to: '/explorar', etiqueta: 'Explorar' }]

export const router = createBrowserRouter([
  { path: '/', element: <SitioLayout navegacion={NAV} />, children: [{ index: true, element: <Landing /> }, { path: 'explorar', element: <Explorar /> }, { path: 'servicio/:id', element: <ServicioDetalle /> }] },
  {
    path: '/app',
    element: <SitioLayout navegacion={NAV} />,
    children: [
      { index: true, element: <AppInicio /> },
      { path: 'ingresar', element: <Ingresar /> },
      { path: 'registro', element: <Registro /> },
      { path: 'completar-perfil', element: <CompletarPerfil /> },
      { path: 'suspendido', element: <Suspendido /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'reservar/:id', element: <RequireRole roles={['turista']}><Reservar /></RequireRole> },
          {
            path: 'turista',
            element: <RequireRole roles={['turista']}><PanelTurista /></RequireRole>,
            children: [{ index: true, element: <ReservasTurista /> }, { path: 'favoritos', element: <FavoritosTurista /> }, { path: 'cuenta', element: <CuentaTurista /> }],
          },
          {
            path: 'prestador',
            element: <RequireRole roles={['prestador']}><PanelPrestador /></RequireRole>,
            children: [{ index: true, element: <ReservasPrestador /> }, { path: 'comercio', element: <ComercioPrestador /> }, { path: 'servicios', element: <ServiciosPrestador /> }],
          },
        ],
      },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout navegacion={[{ to: '/admin', etiqueta: 'Inicio', fin: true }, { to: '/admin/usuarios', etiqueta: 'Usuarios' }, { to: '/admin/comercios', etiqueta: 'Comercios' }, { to: '/admin/servicios', etiqueta: 'Servicios' }, { to: '/admin/reservas', etiqueta: 'Reservas' }]} />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminInicio /> },
      { path: 'usuarios', element: <AdminUsuarios /> },
      { path: 'comercios', element: <AdminComercios /> },
      { path: 'servicios', element: <AdminServicios /> },
      { path: 'reservas', element: <AdminReservas /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  { path: '*', element: <SitioLayout navegacion={NAV} />, children: [{ path: '*', element: <NoEncontrada /> }] },
])
