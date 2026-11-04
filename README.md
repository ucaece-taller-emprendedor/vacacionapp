# VacacionApp

Marketplace turístico: encontrá, compará y reservá servicios y experiencias, empezando por los balnearios de Mar del Plata. Roles: turista, prestador y admin.

> Proyecto del **Taller Emprendedor** · Universidad CAECE (Mar del Plata) · cohorte 2026 2C.
> Docentes: Franco Vinciguerra y Luis Orviz Friser.

## El problema

Reservar servicios turísticos locales es informal y está disperso; los prestadores no tienen un canal simple para ofrecerse.

## Equipo

- [leontammone](https://github.com/leontammone)
- [marcosasili](https://github.com/marcosasili)
- [jemimanicolo](https://github.com/jemimanicolo)

## Demo

Todavía no hay demo publicada.

> La demo corre en el plan gratuito de Vercel, que es **solo para uso personal y no comercial**. Alcanza para esta demo académica con datos de ejemplo; si el proyecto pasa a producción comercial, hay que migrar a un plan pago.

## Cómo está organizada

Tres niveles de acceso, en un solo proyecto Next.js 16 (React 19, Tailwind 4, Better Auth, Drizzle ORM y Postgres):

| Nivel | Ruta | Quién entra |
|---|---|---|
| Landing pública | `/` y `/explorar` | Cualquiera. Se puede explorar y comparar sin cuenta; **reservar exige iniciar sesión**. |
| App de usuarios | `/app/...` | Turistas y prestadores. Registro e ingreso con email y contraseña o con Google (mobile first). |
| Panel de administración | `/admin/...` | Solo admins. **No tiene registro público.** |

Estructura de carpetas:

```
app/(public)/   landing y catálogo (/ y /explorar)
app/(app)/app/  app de usuarios (/app: ingresar, registro, cuenta, prestador)
app/admin/      panel de administración (/admin)
app/api/        route handlers (validados con Zod y con requireRole)
lib/auth/       Better Auth, cliente y guards de rol (requireRole)
lib/db/         esquema Drizzle y migraciones versionadas (lib/db/migrations)
lib/validations/ esquemas Zod de las entradas de la API
components/     componentes de interfaz
scripts/        seed de demo
tests/e2e/      tests de humo con Playwright
```

**Roles.** El registro en `/app` permite elegir *turista* o *prestador*. El prestador carga su comercio y queda **pendiente** hasta que un admin lo aprueba; recién ahí sus servicios aparecen en el catálogo. Los admins gestionan usuarios, comercios (aprobar, suspender, rechazar), servicios y reservas. El rol se valida **en el servidor** (`requireRole` en cada route handler, `requirePageRole` en cada página protegida); el `proxy.ts` es solo una primera barrera.

**Admins.** Se crean con el seed de demo o con la variable `ADMIN_EMAILS` (emails que, al ingresar con Google y con el email verificado, entran como admin). Nadie puede hacerse admin desde la pantalla de registro.

**Pagos simulados.** No hay pasarela de pago ni se cobra nada: el checkout registra el pago como `simulated` y la interfaz lo aclara.

**Imágenes.** Las fotos del catálogo siguen alojadas en Vercel Blob y Unsplash (hosts externos). Si te llevás el proyecto, conviene subirlas a tu propio almacenamiento.

## Cómo correrla en local

Necesitás Node.js 20+ y una base Postgres (podés crear una gratis en [Neon](https://neon.tech) o levantar una local con Docker).

```bash
npm install
cp .env.example .env        # completá DATABASE_URL, BETTER_AUTH_SECRET y BETTER_AUTH_URL
npm run db:migrate          # aplica las migraciones (lib/db/migrations)
npm run db:seed:demo        # carga los datos y usuarios de DEMO
npm run dev
```

La app queda en http://localhost:3000. Si cambiás el puerto, actualizá `BETTER_AUTH_URL`.

Scripts útiles: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`, y `npm run db:generate` (genera una migración nueva cuando cambiás `lib/db/schema.ts`: nunca se tocan tablas a mano).

Base local con Docker:

```bash
docker run -d --name vacacionapp-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vacacionapp -p 5432:5432 postgres:17
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vacacionapp
```

## Variables de entorno

Se validan al arrancar (`lib/env.ts`): si falta alguna obligatoria, el error dice cuál.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a Postgres. |
| `BETTER_AUTH_SECRET` | Sí | Secreto de sesiones (mínimo 32 caracteres: `openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | Sí | URL pública de la app (`http://localhost:3000` en local). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No (van juntas) | Habilitan el ingreso con Google. Sin ellas el botón queda deshabilitado. |
| `ADMIN_EMAILS` | No | Emails (separados por coma) que entran como admin con Google. |

## Google OAuth

Para habilitar el ingreso con Google creá un cliente OAuth (tipo "Aplicación web") en Google Cloud Console y cargá estas URIs de redirección autorizadas:

- Local: `http://localhost:3000/api/auth/callback/google`
- Producción: `https://<tu-dominio>/api/auth/callback/google`

Después completá `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Mientras no estén, la app funciona solo con email y contraseña.

## Usuarios de prueba por rol

> **DEMO: datos de ejemplo, no reales.** Se crean con `npm run db:seed:demo` (idempotente). La contraseña es pública: usá estos usuarios solo en entornos de demo, y no cargues el seed en una base de producción real sin cambiar o borrar estas cuentas. Si la base no es local, el seed pide agregar `-- --yes`.

| Rol | Email | Contraseña |
|---|---|---|
| Turista | `turista.demo@vacacionapp.test` | `DemoVacacion2026!` |
| Prestador (comercio aprobado: Balneario Alfonsina) | `prestador.demo@vacacionapp.test` | `DemoVacacion2026!` |
| Prestador (comercio pendiente de aprobación) | `pendiente.demo@vacacionapp.test` | `DemoVacacion2026!` |
| Admin | `admin.demo@vacacionapp.test` | `DemoVacacion2026!` |

El panel de admin está en `/admin/login`. El seed también carga los 11 servicios del catálogo (marcados como `demo`) y una reserva de ejemplo del turista.

## Calidad

- TypeScript estricto, ESLint y `npm run build` sin errores.
- GitHub Actions (`.github/workflows/ci.yml`): en cada push y pull request corre lint, tipos y build, y un test de humo con Playwright contra una base Postgres temporal.
- Los tests (`tests/e2e`) verifican la landing, el registro e ingreso de un turista, el login de admin y el recorrido completo prestador → admin → turista.

## Cómo llevarte este proyecto

1. Creá tu propia organización de GitHub.
2. Como Admin del repo, transferilo: **Settings → Danger Zone → Transfer**. Se conservan el historial, los issues y las estrellas, y los links viejos redirigen.
3. Creá tus propias cuentas de Vercel, Neon y el cliente OAuth de Google.
4. Copiá `.env.example` a `.env`, completá tus valores y desplegá.
5. Los usuarios de demo no se migran: la base de producción arranca de cero.

## Licencia

Pendiente de definir por la cátedra. Ver [LICENSE](LICENSE).
