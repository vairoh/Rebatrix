import { users, type User, type InsertUser, type Battery, type InsertBattery, type BatterySearch, batterys } from "@shared/schema";

export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Battery Operations
  createBattery(battery: InsertBattery): Promise<Battery>;
  getBattery(id: number): Promise<Battery | undefined>;
  getBatteries(limit?: number, offset?: number): Promise<Battery[]>;
  updateBattery(id: number, battery: Partial<InsertBattery>): Promise<Battery | undefined>;
  deleteBattery(id: number): Promise<boolean>;
  
  // Search Operations
  searchBatteries(params: BatterySearch): Promise<Battery[]>;
  
  // Category Operations
  getBatteriesByCategory(category: string): Promise<Battery[]>;
  getFeaturedBatteries(limit?: number): Promise<Battery[]>;
  
  // User-specific Operations
  getUserBatteries(userId: number): Promise<Battery[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private batteries: Map<number, Battery>;
  private userCurrentId: number;
  private batteryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.batteries = new Map();
    this.userCurrentId = 1;
    this.batteryCurrentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Battery Operations
  async createBattery(insertBattery: InsertBattery): Promise<Battery> {
    const id = this.batteryCurrentId++;
    const now = new Date();
    const battery: Battery = { 
      ...insertBattery, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.batteries.set(id, battery);
    return battery;
  }

  async getBattery(id: number): Promise<Battery | undefined> {
    return this.batteries.get(id);
  }

  async getBatteries(limit = 20, offset = 0): Promise<Battery[]> {
    return Array.from(this.batteries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async updateBattery(id: number, battery: Partial<InsertBattery>): Promise<Battery | undefined> {
    const existingBattery = this.batteries.get(id);
    if (!existingBattery) {
      return undefined;
    }

    const updatedBattery: Battery = {
      ...existingBattery,
      ...battery,
      updatedAt: new Date(),
    };

    this.batteries.set(id, updatedBattery);
    return updatedBattery;
  }

  async deleteBattery(id: number): Promise<boolean> {
    return this.batteries.delete(id);
  }

  // Search Operations
  async searchBatteries(params: BatterySearch): Promise<Battery[]> {
    let results = Array.from(this.batteries.values());

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (battery) =>
          battery.title.toLowerCase().includes(query) ||
          battery.description.toLowerCase().includes(query) ||
          battery.manufacturer.toLowerCase().includes(query) ||
          battery.technologyType.toLowerCase().includes(query)
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
      results = results.filter((battery) => battery.location.toLowerCase().includes(params.location!.toLowerCase()));
    }

    if (params.country) {
      results = results.filter((battery) => battery.country === params.country);
    }

    if (params.listingType) {
      results = results.filter((battery) => battery.listingType === params.listingType);
    }

    if (params.manufacturer) {
      results = results.filter((battery) => battery.manufacturer === params.manufacturer);
    }

    return results;
  }

  // Category Operations
  async getBatteriesByCategory(category: string): Promise<Battery[]> {
    return Array.from(this.batteries.values())
      .filter((battery) => battery.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeaturedBatteries(limit = 4): Promise<Battery[]> {
    return Array.from(this.batteries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // User-specific Operations
  async getUserBatteries(userId: number): Promise<Battery[]> {
    return Array.from(this.batteries.values())
      .filter((battery) => battery.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Initialize with some sample data
  private initializeSampleData() {
    // Create a sample user
    const sampleUser: InsertUser = {
      username: "samplecompany",
      password: "password123",
      company: "Sample Energy GmbH",
      email: "info@sample-energy.com",
      phone: "+49123456789",
      location: "Berlin",
      country: "Germany"
    };
    
    this.createUser(sampleUser).then(user => {
      // Create sample batteries
      const sampleBatteries: InsertBattery[] = [
        {
          userId: user.id,
          title: "LG ESS Home 10 Battery System",
          description: "High-performance residential battery system with integrated inverter, perfect for home solar installations.",
          price: "6200",
          location: "Berlin",
          country: "Germany",
          batteryType: "new",
          category: "residential",
          capacity: "10",
          technologyType: "Lithium-Ion",
          voltage: "48",
          currentRating: "125",
          cycleCount: 0,
          healthPercentage: 100,
          dimensions: "100x60x30",
          weight: "95",
          manufacturer: "LG Energy Solution",
          modelNumber: "RESU10H",
          yearOfManufacture: 2023,
          warranty: "10 years",
          certifications: ["IEC 62619", "UL 1973", "CE"],
          listingType: "sell",
          availability: true,
          rentalPeriod: null,
          images: ["/battery-images/lg-ess-home.jpg"],
          additionalSpecs: { efficiency: "95%", operatingTemp: "-10°C to 45°C" }
        },
        {
          userId: user.id,
          title: "Siemens Industrial BESS 250 kWh",
          description: "High-capacity commercial battery energy storage system ideal for industrial applications and peak shaving.",
          price: "72500",
          location: "Munich",
          country: "Germany",
          batteryType: "used",
          category: "commercial",
          capacity: "250",
          technologyType: "Lithium-Ion",
          voltage: "850",
          currentRating: "350",
          cycleCount: 120,
          healthPercentage: 92,
          dimensions: "235x120x90",
          weight: "2250",
          manufacturer: "Siemens",
          modelNumber: "SIESTORE-250",
          yearOfManufacture: 2021,
          warranty: "5 years remaining",
          certifications: ["IEC 62933", "VDE-AR-E 2510-2", "CE"],
          listingType: "sell",
          availability: true,
          rentalPeriod: null,
          images: ["/battery-images/siemens-industrial.jpg"],
          additionalSpecs: { coolingSystem: "Liquid", gridServices: "Yes", remoteDiagnostics: "Yes" }
        },
        {
          userId: user.id,
          title: "SolarEdge Energy Bank 10kWh",
          description: "Integrated solar battery system with smart monitoring and optimization features.",
          price: "320",
          location: "Hamburg",
          country: "Germany",
          batteryType: "new",
          category: "residential",
          capacity: "10",
          technologyType: "Lithium-Ion",
          voltage: "48",
          currentRating: "120",
          cycleCount: 0,
          healthPercentage: 100,
          dimensions: "94x57x32",
          weight: "87",
          manufacturer: "SolarEdge",
          modelNumber: "Energy-Bank-10",
          yearOfManufacture: 2023,
          warranty: "10 years",
          certifications: ["IEC 62619", "TUV", "CE"],
          listingType: "rent",
          availability: true,
          rentalPeriod: "monthly",
          images: ["/battery-images/solaredge-energy-bank.jpg"],
          additionalSpecs: { invertorIntegration: "SolarEdge compatible", emergency: "Backup power capability" }
        },
        {
          userId: user.id,
          title: "BMW i3 Battery Pack - Second Life",
          description: "Repurposed electric vehicle battery with excellent performance for residential and small business applications.",
          price: "4100",
          location: "Leipzig",
          country: "Germany",
          batteryType: "second-life",
          category: "ev",
          capacity: "33",
          technologyType: "Lithium-Ion",
          voltage: "360",
          currentRating: "125",
          cycleCount: 850,
          healthPercentage: 78,
          dimensions: "150x90x30",
          weight: "230",
          manufacturer: "BMW",
          modelNumber: "i3-94Ah",
          yearOfManufacture: 2019,
          warranty: "1 year",
          certifications: ["Repurposed certification"],
          listingType: "sell",
          availability: true,
          rentalPeriod: null,
          images: ["/battery-images/bmw-i3-battery.jpg"],
          additionalSpecs: { previousUse: "EV Battery", cycles: "850" }
        },
        {
          userId: user.id,
          title: "Tesla Powerpack Commercial BESS",
          description: "210 kWh capacity with integrated inverter, ideal for solar integration and large-scale energy management.",
          price: "87500",
          location: "Frankfurt",
          country: "Germany",
          batteryType: "new",
          category: "commercial",
          capacity: "210",
          technologyType: "Lithium-Ion",
          voltage: "480",
          currentRating: "290",
          cycleCount: 0,
          healthPercentage: 100,
          dimensions: "219x131x97",
          weight: "1890",
          manufacturer: "Tesla",
          modelNumber: "Powerpack 2",
          yearOfManufacture: 2023,
          warranty: "15 years",
          certifications: ["UL 1642", "IEC 62619", "CE"],
          listingType: "sell",
          availability: true,
          rentalPeriod: null,
          images: ["/battery-images/tesla-powerpack.jpg"],
          additionalSpecs: { liquidCooling: "Yes", monitoring: "Advanced API", stackable: "Yes" }
        }
      ];
      
      // Add each battery
      for (const battery of sampleBatteries) {
        this.createBattery(battery);
      }
    });
  }
}

export const storage = new MemStorage();
