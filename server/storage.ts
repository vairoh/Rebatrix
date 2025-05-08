import {
  users,
  type User,
  type InsertUser,
  type Battery,
  type InsertBattery,
  type BatterySearch,
  batteries,
  inquiries,
  logins,
} from "@shared/schema";
import { db } from "./db";
import { and, eq, gte, lte, ilike } from "drizzle-orm/expressions";
import { desc } from "drizzle-orm";

class Storage {
  // ✅ User Operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(userData: Omit<InsertUser, "id" | "createdAt">): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...userData, createdAt: new Date() })
      .returning();
    return user;
  }

  // ✅ Battery Operations
  async createBattery(insertBattery: InsertBattery): Promise<Battery> {
    const [battery] = await db
      .insert(batteries)
      .values({ ...insertBattery, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return battery;
  }

  async getBattery(id: number | string): Promise<Battery | undefined> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const result = await db
      .select()
      .from(batteries)
      .where(eq(batteries.id, numericId))
      .limit(1);
    return result[0];
  }

  async updateBattery(id: number | string, updatedBattery: Partial<Battery>): Promise<Battery | undefined> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const [battery] = await db
      .update(batteries)
      .set({ ...updatedBattery, updatedAt: new Date() })
      .where(eq(batteries.id, numericId))
      .returning();
    return battery ?? undefined;
  }

  async deleteBattery(id: number): Promise<boolean> {
    const result = await db
      .delete(batteries)
      .where(eq(batteries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getBatteries(limit = 20, offset = 0): Promise<Battery[]> {
    return db
      .select()
      .from(batteries)
      .orderBy(desc(batteries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async searchBatteries(params: BatterySearch): Promise<Battery[]> {
    const whereClauses = [];

    if (params.query) {
      const query = `%${String(params.query).toLowerCase()}%`;
      whereClauses.push(
        ilike(batteries.title, query),
        ilike(batteries.description, query),
        ilike(batteries.manufacturer, query),
        ilike(batteries.technologyType, query)
      );
    }

    if (params.batteryType) whereClauses.push(eq(batteries.batteryType, params.batteryType));
    if (params.category) whereClauses.push(eq(batteries.category, params.category));
    if (params.minCapacity !== undefined) whereClauses.push(gte(batteries.capacity, params.minCapacity));
    if (params.maxCapacity !== undefined) whereClauses.push(lte(batteries.capacity, params.maxCapacity));
    if (params.minPrice !== undefined) whereClauses.push(gte(batteries.price, params.minPrice));
    if (params.maxPrice !== undefined) whereClauses.push(lte(batteries.price, params.maxPrice));
    if (params.location) whereClauses.push(ilike(batteries.location, `%${params.location}%`));
    if (params.country) whereClauses.push(eq(batteries.country, params.country));
    if (params.listingType) whereClauses.push(eq(batteries.listingType, params.listingType));
    if (params.manufacturer) whereClauses.push(ilike(batteries.manufacturer, params.manufacturer));

    return db
      .select()
      .from(batteries)
      .where(and(...whereClauses))
      .orderBy(desc(batteries.createdAt));
  }

  async getBatteriesByCategory(category: string): Promise<Battery[]> {
    return db
      .select()
      .from(batteries)
      .where(eq(batteries.category, category))
      .orderBy(desc(batteries.createdAt));
  }

  async getFeaturedBatteries(limit = 4): Promise<Battery[]> {
    return db
      .select()
      .from(batteries)
      .orderBy(desc(batteries.createdAt))
      .limit(limit);
  }

  async getUserBatteries(userId: number): Promise<Battery[]> {
    return db
      .select()
      .from(batteries)
      .where(eq(batteries.userId, userId))
      .orderBy(desc(batteries.createdAt));
  }

  async getAllBatteryIds(): Promise<any[]> {
    const result = await db
      .select({ id: batteries.id, title: batteries.title })
      .from(batteries);
    return result.map((b) => ({
      id: b.id,
      type: typeof b.id,
      title: b.title,
    }));
  }

  // ✅ Inquiry Operations (PostgreSQL only)
  async createInquiry(data: {
    userId: number;
    batteryId: number;
    message: string;
    contactEmail?: string;
  }): Promise<any> {
    const [inquiry] = await db
      .insert(inquiries)
      .values({
        userId: data.userId,
        batteryId: data.batteryId,
        message: data.message,
        contactEmail: data.contactEmail,
        status: "new",
        timestamp: new Date(),
      })
      .returning();
    return inquiry;
  }

  async trackLogin(userId: number, email: string): Promise<void> {
    await db.insert(logins).values({
      userId,
      email,
      timestamp: new Date(),
    });
  }

  async getLogins(): Promise<
  { id: number; userId: number; email: string; timestamp: Date }[]
> {
  return db
    .select()
    .from(logins)
    .orderBy(desc(logins.timestamp));
}


  async getInquiries(): Promise<any[]> {
    return db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.timestamp));
  }
}

export const storage = new Storage();
