
import { pgTable, text, serial, integer,varchar, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logins = pgTable("logins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});


export const batteryTypes = {
  NEW: "new",
  USED: "used",
  SECOND_LIFE: "second-life",
} as const;

export const batteryCategories = {
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial",
  INDUSTRIAL: "industrial",
  GRID_SCALE: "grid-scale",
  EV: "ev",
  SOLAR_INTEGRATION: "solar-integration",
} as const;

export const listingTypes = {
  BUY: "buy",
  SELL: "sell",
  RENT: "rent",
} as const;

export const batteries = pgTable("batteries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  batteryType: text("battery_type").notNull(),
  category: text("category").notNull(),
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(),
  technologyType: text("technology_type").notNull(),
  voltage: numeric("voltage", { precision: 10, scale: 2 }).notNull(),
  currentRating: numeric("current_rating", { precision: 10, scale: 2 }),
  cycleCount: integer("cycle_count"),
  healthPercentage: integer("health_percentage"),
  dimensions: text("dimensions"),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  manufacturer: text("manufacturer").notNull(),
  modelNumber: text("model_number"),
  yearOfManufacture: integer("year_of_manufacture"),
  warranty: text("warranty"),
  certifications: text("certifications").array(),
  listingType: text("listing_type").notNull(),
  availability: boolean("availability").default(true),
  isFeatured: boolean("is_featured").default(false),
  rentalPeriod: text("rental_period"),
  images: text("images").array(),
  additionalSpecs: json("additional_specs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  is_featured: boolean("is_featured").default(false),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  batteryId: integer("battery_id").notNull().references(() => batteries.id),
  message: text("message").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").default("new"),
  timestamp: timestamp("timestamp").defaultNow()
});


export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  phone: true,
  location: true,
  country: true,
});

export const insertBatterySchema = createInsertSchema(batteries)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial({
    description: true
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBattery = z.infer<typeof insertBatterySchema>;
export type Battery = typeof batteries.$inferSelect;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;


export const batterySearchSchema = z.object({
  query: z.string().optional(),
  batteryType: z.enum([batteryTypes.NEW, batteryTypes.USED, batteryTypes.SECOND_LIFE]).optional(),
  category: z.enum([
    batteryCategories.RESIDENTIAL,
    batteryCategories.COMMERCIAL,
    batteryCategories.INDUSTRIAL,
    batteryCategories.GRID_SCALE,
    batteryCategories.EV,
    batteryCategories.SOLAR_INTEGRATION
  ]).optional(),
  minCapacity: z.number().optional(),
  maxCapacity: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  listingType: z.enum([listingTypes.BUY, listingTypes.SELL, listingTypes.RENT]).optional(),
  manufacturer: z.string().optional(),
});

export type BatterySearch = z.infer<typeof batterySearchSchema>;
