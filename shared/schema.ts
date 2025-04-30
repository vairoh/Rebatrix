import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  location: text("location").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  LEND: "lend",
} as const;

export const batterys = pgTable("batteries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  batteryType: text("battery_type").notNull(), // new, used, second-life
  category: text("category").notNull(), // residential, commercial, industrial, etc.
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(), // kWh
  technologyType: text("technology_type").notNull(), // lithium-ion, flow, etc.
  voltage: numeric("voltage", { precision: 10, scale: 2 }).notNull(), // V
  currentRating: numeric("current_rating", { precision: 10, scale: 2 }), // A
  cycleCount: integer("cycle_count"),
  healthPercentage: integer("health_percentage"),
  dimensions: text("dimensions"), // HxWxD in cm
  weight: numeric("weight", { precision: 10, scale: 2 }), // kg
  manufacturer: text("manufacturer").notNull(),
  modelNumber: text("model_number"),
  yearOfManufacture: integer("year_of_manufacture"),
  warranty: text("warranty"),
  certifications: text("certifications").array(),
  listingType: text("listing_type").notNull(), // buy, sell, rent, lend
  availability: boolean("availability").default(true),
  rentalPeriod: text("rental_period"), // For rental listings
  images: text("images").array(),
  additionalSpecs: json("additional_specs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  company: true,
  email: true,
  phone: true, 
  location: true,
  country: true,
});

export const insertBatterySchema = createInsertSchema(batterys).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBattery = z.infer<typeof insertBatterySchema>;
export type Battery = typeof batterys.$inferSelect;

// Extended schemas for validation
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
  listingType: z.enum([listingTypes.BUY, listingTypes.SELL, listingTypes.RENT, listingTypes.LEND]).optional(),
  manufacturer: z.string().optional(),
});

export type BatterySearch = z.infer<typeof batterySearchSchema>;
