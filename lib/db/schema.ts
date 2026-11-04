import { boolean, index, integer, pgTable, real, text, timestamp, unique } from 'drizzle-orm/pg-core'

// Las tablas user, session, account y verification las usa Better Auth: no cambiar los nombres de columna.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('client'), // client | provider | admin
  status: text('status').notNull().default('active'), // active | suspended
  phone: text('phone'),
  demo: boolean('demo').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  table => [index('session_user_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  table => [index('account_user_idx').on(table.userId)],
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const commerce = pgTable('commerce', {
  id: text('id').primaryKey(),
  ownerId: text('ownerId')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  contactName: text('contactName').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | suspended
  demo: boolean('demo').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const service = pgTable(
  'service',
  {
    id: text('id').primaryKey(),
    commerceId: text('commerceId')
      .notNull()
      .references(() => commerce.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    location: text('location').notNull(),
    price: integer('price').notNull(),
    unit: text('unit').notNull().default('por día'),
    rating: real('rating').notNull().default(0),
    reviews: integer('reviews').notNull().default(0),
    image: text('image').notNull().default('/placeholder.jpg'),
    tag: text('tag').notNull().default('Nuevo'),
    duration: text('duration').notNull().default('A elección'),
    includes: text('includes').array().notNull().default([]),
    policy: text('policy').notNull().default('Consultá la política de cancelación con el prestador.'),
    active: boolean('active').notNull().default(true),
    demo: boolean('demo').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  table => [index('service_commerce_idx').on(table.commerceId)],
)

export const favorite = pgTable(
  'favorite',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    serviceId: text('serviceId')
      .notNull()
      .references(() => service.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  table => [unique('favorite_user_service_unique').on(table.userId, table.serviceId)],
)

export const booking = pgTable(
  'booking',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    serviceId: text('serviceId').references(() => service.id, { onDelete: 'set null' }),
    commerceId: text('commerceId').references(() => commerce.id, { onDelete: 'set null' }),
    // Copia de los datos al reservar: el historial no cambia si después se edita el servicio.
    serviceTitle: text('serviceTitle').notNull(),
    provider: text('provider').notNull(),
    location: text('location').notNull(),
    fromDate: text('fromDate').notNull(),
    toDate: text('toDate').notNull(),
    people: integer('people').notNull(),
    shift: text('shift').notNull(),
    total: integer('total').notNull(),
    status: text('status').notNull().default('confirmed'), // pending | confirmed | completed | cancelled
    cancelledAt: timestamp('cancelledAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  table => [index('booking_user_idx').on(table.userId), index('booking_commerce_idx').on(table.commerceId)],
)

// Los pagos son SIMULADOS: no hay pasarela conectada ni cobro real.
export const payment = pgTable(
  'payment',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bookingId: text('bookingId')
      .notNull()
      .references(() => booking.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull().default('ARS'),
    status: text('status').notNull().default('simulated'),
    method: text('method'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  table => [index('payment_user_idx').on(table.userId)],
)
