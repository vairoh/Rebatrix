import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { users, type User, type InsertUser, type Battery, type InsertBattery, type BatterySearch, batterys } from "@shared/schema";

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
    return this.db.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.db.users.find(user => user.email === email);
  }

  async createUser(userData: Omit<InsertUser, "id" | "createdAt">): Promise<User> {
    const user: User = {
      ...userData,
      id: this.db.nextUserId++,
      createdAt: new Date().toISOString(),
      username: userData.username
    };

    this.db.users.push(user);
    await this.saveDB();
    return user;
  }


  // Battery Operations
  async createBattery(insertBattery: InsertBattery): Promise<Battery> {
    const battery: Battery = {
      ...insertBattery,
      id: this.db.nextBatteryId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: insertBattery.userId
    };

    this.db.batteries.push(battery);
    await this.saveDB();
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
    const batteriesData = await this.getBatteries(100, 0);
    // Handle both string and number IDs
    const battery = batteriesData.find(b => {
      if (typeof id === 'number') {
        console.log("Numeric comparison result:", b.id === id ? "Found" : "Not found");
        return b.id === id;
      } else {
        // Convert both to strings for comparison to handle string IDs
        console.log("String comparison result:", String(b.id) === id ? "Found" : "Not found");
        return String(b.id) === id;
      }
    });
    return battery;
  }

  async updateBattery(id: number | string, updatedBattery: Partial<Battery>): Promise<Battery | undefined> {
    // Find the battery to update
    const batteryToUpdate = await this.getBattery(id);
    if (!batteryToUpdate) {
      return undefined;
    }

    // Update the battery data
    const updatedBatteryData = {
      ...batteryToUpdate,
      ...updatedBattery,
      // Preserve the original ID and user ID
      id: batteryToUpdate.id,
      userId: batteryToUpdate.userId,
      updatedAt: new Date().toISOString()
    };

    // Replace the battery in the array
    const index = this.db.batteries.findIndex(b => b.id === batteryToUpdate.id);
    if (index !== -1) {
      this.db.batteries[index] = updatedBatteryData;
      await this.saveDB();
      return updatedBatteryData;
    }

    return undefined;
  }

  async getBatteries(limit = 20, offset = 0): Promise<Battery[]> {
    return this.db.batteries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
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
    return this.db.batteries
      .filter((battery) => battery.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFeaturedBatteries(limit = 4): Promise<Battery[]> {
    return this.db.batteries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // User-specific Operations
  async getUserBatteries(userId: number): Promise<Battery[]> {
    return this.db.batteries
      .filter((battery) => battery.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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