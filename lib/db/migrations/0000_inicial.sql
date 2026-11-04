CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"serviceId" text,
	"commerceId" text,
	"serviceTitle" text NOT NULL,
	"provider" text NOT NULL,
	"location" text NOT NULL,
	"fromDate" text NOT NULL,
	"toDate" text NOT NULL,
	"people" integer NOT NULL,
	"shift" text NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"cancelledAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commerce" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"contactName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"demo" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commerce_ownerId_unique" UNIQUE("ownerId")
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"serviceId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_service_unique" UNIQUE("userId","serviceId")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"bookingId" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'ARS' NOT NULL,
	"status" text DEFAULT 'simulated' NOT NULL,
	"method" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"commerceId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"price" integer NOT NULL,
	"unit" text DEFAULT 'por día' NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"image" text DEFAULT '/placeholder.jpg' NOT NULL,
	"tag" text DEFAULT 'Nuevo' NOT NULL,
	"duration" text DEFAULT 'A elección' NOT NULL,
	"includes" text[] DEFAULT '{}' NOT NULL,
	"policy" text DEFAULT 'Consultá la política de cancelación con el prestador.' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"demo" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'client' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"phone" text,
	"demo" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_serviceId_service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_commerceId_commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."commerce"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce" ADD CONSTRAINT "commerce_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_serviceId_service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_booking_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_commerceId_commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."commerce"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "booking_user_idx" ON "booking" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "booking_commerce_idx" ON "booking" USING btree ("commerceId");--> statement-breakpoint
CREATE INDEX "payment_user_idx" ON "payment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "service_commerce_idx" ON "service" USING btree ("commerceId");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("userId");