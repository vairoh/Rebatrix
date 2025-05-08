CREATE TABLE "batteries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"location" text NOT NULL,
	"country" text NOT NULL,
	"battery_type" text NOT NULL,
	"category" text NOT NULL,
	"capacity" numeric(10, 2) NOT NULL,
	"technology_type" text NOT NULL,
	"voltage" numeric(10, 2) NOT NULL,
	"current_rating" numeric(10, 2),
	"cycle_count" integer,
	"health_percentage" integer,
	"dimensions" text,
	"weight" numeric(10, 2),
	"manufacturer" text NOT NULL,
	"model_number" text,
	"year_of_manufacture" integer,
	"warranty" text,
	"certifications" text[],
	"listing_type" text NOT NULL,
	"availability" boolean DEFAULT true,
	"rental_period" text,
	"images" text[],
	"additional_specs" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"battery_id" integer NOT NULL,
	"message" text NOT NULL,
	"contact_email" text,
	"status" text DEFAULT 'new',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "logins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text NOT NULL,
	"location" text NOT NULL,
	"country" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "batteries" ADD CONSTRAINT "batteries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_battery_id_batteries_id_fk" FOREIGN KEY ("battery_id") REFERENCES "public"."batteries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logins" ADD CONSTRAINT "logins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;