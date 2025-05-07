import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { users, type User, type InsertUser, type Battery, type InsertBattery, type BatterySearch, batteries } from "@shared/schema";
import { db } from "./db"; // 
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";


const DB_FILE = path.join(process.cwd(), "db.json");

interface DB {
  users: User[];
  batteries: Battery[];
  nextUserId: number;
  nextBatteryId: number;
}

class Storage {
  private db: DB = { 
    users: [], 
    batteries: [], 
    logins: [], 
    inquiries: [],
    nextUserId: 1, 
    nextBatteryId: 1,
    nextInquiryId: 1
  };

  constructor() {
    this.loadDB();
  }

  private async loadDB() {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      this.db = JSON.parse(data);
      
      // Initialize new collections if they don't exist
      if (!this.db.logins) this.db.logins = [];
      if (!this.db.inquiries) this.db.inquiries = [];
      if (!this.db.nextInquiryId) this.db.nextInquiryId = 1;
    } catch (error) {
      // If file doesn't exist, we'll create it on first save
      await this.saveDB();
    }
  }

  private async saveDB() {
    await fs.writeFile(DB_FILE, JSON.stringify(this.db, null, 2));
  }

  // User Operations
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
      .values({
        ...userData,
        createdAt: new Date()
      })
      .returning();
  
    return user;
  }


  // Battery Operations
  async createBattery(insertBattery: InsertBattery): Promise<Battery> {
    const [battery] = await db
      .insert(batteries)
      .values({
        ...insertBattery,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
  
    return battery;
  }
  
  // Track user logins
  async trackLogin(userId: number, email: string): Promise<void> {
    const loginEntry = {
      userId,
      email,
      timestamp: new Date().toISOString()
    };
    
    this.db.logins.push(loginEntry);
    await this.saveDB();
  }
  
  // Get all login records
  async getLogins(): Promise<any[]> {
    return this.db.logins || [];
  }
  
  // Create an inquiry
  async createInquiry(data: { 
    userId: number, 
    batteryId: number, 
    message: string, 
    contactEmail?: string 
  }): Promise<any> {
    const inquiry = {
      id: this.db.nextInquiryId++,
      ...data,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    this.db.inquiries.push(inquiry);
    await this.saveDB();
    return inquiry;
  }
  
  // Get all inquiries
  async getInquiries(): Promise<any[]> {
    return this.db.inquiries || [];
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
      .set({
        ...updatedBattery,
        updatedAt: new Date()
      })
      .where(eq(batteries.id, numericId))
      .returning();
  
    return battery ?? undefined;
  }

  async getBatteries(limit = 20, offset = 0): Promise<Battery[]> {
    const result = await db
      .select()
      .from(batteries)
      .orderBy(desc(batteries.createdAt))
      .limit(limit)
      .offset(offset);
  
    return result;
  }

  async deleteBattery(id: number): Promise<boolean> {
    const index = this.db.batteries.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.db.batteries.splice(index, 1);
    await this.saveDB();
    return true;
  }

  // Search Operations
  async searchBatteries(params: BatterySearch): Promise<Battery[]> {
    console.log("[Search Params]", params);
    // Return all batteries if no filters are applied
    if (!params || Object.keys(params).length === 0) {
      console.log("[All Batteries]", this.db.batteries);
      return this.db.batteries;
    }

    let results = [...this.db.batteries];

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (battery) =>
          battery.title?.toLowerCase().includes(query) ||
          battery.description?.toLowerCase().includes(query) ||
          battery.manufacturer?.toLowerCase().includes(query) ||
          battery.technologyType?.toLowerCase().includes(query)
      );
    }

    if (params.batteryType) {
      results = results.filter((battery) => battery.batteryType === params.batteryType);
    }

    if (params.category) {
      results = results.filter((battery) => battery.category === params.category);
    }

    if (params.minCapacity !== undefined) {
      results = results.filter((battery) => Number(battery.capacity) >= params.minCapacity!);
    }

    if (params.maxCapacity !== undefined) {
      results = results.filter((battery) => Number(battery.capacity) <= params.maxCapacity!);
    }

    if (params.minPrice !== undefined) {
      results = results.filter((battery) => Number(battery.price) >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      results = results.filter((battery) => Number(battery.price) <= params.maxPrice!);
    }

    if (params.location) {
      results = results.filter((battery) => 
        battery.location?.toLowerCase().includes(params.location!.toLowerCase())
      );
    }

    if (params.country) {
      results = results.filter((battery) => battery.country === params.country);
    }

    if (params.listingType) {
      results = results.filter((battery) => battery.listingType === params.listingType);
    }

    if (params.manufacturer) {
      results = results.filter((battery) => 
        battery.manufacturer?.toLowerCase() === params.manufacturer?.toLowerCase()
      );
    }

    console.log("[Search Results]", results);
    return results;
  }

  // Category Operations
  async getBatteriesByCategory(category: string): Promise<Battery[]> {
    const result = await db
      .select()
      .from(batteries)
      .where(eq(batteries.category, category))
      .orderBy(desc(batteries.createdAt));
  
    return result;
  }

  async getFeaturedBatteries(limit = 4): Promise<Battery[]> {
    const result = await db
      .select()
      .from(batteries)
      .orderBy(desc(batteries.createdAt))
      .limit(limit);
  
    return result;
  }

  // User-specific Operations
  async getUserBatteries(userId: number): Promise<Battery[]> {
    const result = await db
      .select()
      .from(batteries)
      .where(eq(batteries.userId, userId))
      .orderBy(desc(batteries.createdAt));
  
    return result;
  }

  // Debug methods
  getDebugDump(): any {
    return {
      batteryCount: this.db.batteries.length,
      userCount: this.db.users.length,
      nextBatteryId: this.db.nextBatteryId,
      nextUserId: this.db.nextUserId,
      batteryIds: this.db.batteries.map(b => ({
        id: b.id,
        type: typeof b.id,
        title: b.title
      }))
    };
  }
  
  async getAllBatteryIds(): Promise<any[]> {
    return this.db.batteries.map(b => ({
      id: b.id,
      type: typeof b.id,
      title: b.title
    }));
  }
}

export const storage = new Storage();