// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import fs from "fs/promises";
import path from "path";
var DB_FILE = path.join(process.cwd(), "db.json");
var Storage = class {
  db = {
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
  async loadDB() {
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      this.db = JSON.parse(data);
      if (!this.db.logins) this.db.logins = [];
      if (!this.db.inquiries) this.db.inquiries = [];
      if (!this.db.nextInquiryId) this.db.nextInquiryId = 1;
    } catch (error) {
      await this.saveDB();
    }
  }
  async saveDB() {
    await fs.writeFile(DB_FILE, JSON.stringify(this.db, null, 2));
  }
  // User Operations
  async getUser(id) {
    return this.db.users.find((u) => u.id === id);
  }
  async getUserByEmail(email) {
    return this.db.users.find((user) => user.email === email);
  }
  async createUser(userData) {
    const user = {
      ...userData,
      id: this.db.nextUserId++,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      username: userData.username
    };
    this.db.users.push(user);
    await this.saveDB();
    return user;
  }
  // Battery Operations
  async createBattery(insertBattery) {
    const battery = {
      ...insertBattery,
      id: this.db.nextBatteryId++,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      userId: insertBattery.userId
    };
    this.db.batteries.push(battery);
    await this.saveDB();
    return battery;
  }
  // Track user logins
  async trackLogin(userId, email) {
    const loginEntry = {
      userId,
      email,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.logins.push(loginEntry);
    await this.saveDB();
  }
  // Get all login records
  async getLogins() {
    return this.db.logins || [];
  }
  // Create an inquiry
  async createInquiry(data) {
    const inquiry = {
      id: this.db.nextInquiryId++,
      ...data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "new"
    };
    this.db.inquiries.push(inquiry);
    await this.saveDB();
    return inquiry;
  }
  // Get all inquiries
  async getInquiries() {
    return this.db.inquiries || [];
  }
  async getBattery(id) {
    const batteriesData = await this.getBatteries(100, 0);
    const battery = batteriesData.find((b) => {
      if (typeof id === "number") {
        console.log("Numeric comparison result:", b.id === id ? "Found" : "Not found");
        return b.id === id;
      } else {
        console.log("String comparison result:", String(b.id) === id ? "Found" : "Not found");
        return String(b.id) === id;
      }
    });
    return battery;
  }
  async updateBattery(id, updatedBattery) {
    const batteryToUpdate = await this.getBattery(id);
    if (!batteryToUpdate) {
      return void 0;
    }
    const updatedBatteryData = {
      ...batteryToUpdate,
      ...updatedBattery,
      // Preserve the original ID and user ID
      id: batteryToUpdate.id,
      userId: batteryToUpdate.userId,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const index = this.db.batteries.findIndex((b) => b.id === batteryToUpdate.id);
    if (index !== -1) {
      this.db.batteries[index] = updatedBatteryData;
      await this.saveDB();
      return updatedBatteryData;
    }
    return void 0;
  }
  async getBatteries(limit = 20, offset = 0) {
    return this.db.batteries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(offset, offset + limit);
  }
  async deleteBattery(id) {
    const index = this.db.batteries.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.db.batteries.splice(index, 1);
    await this.saveDB();
    return true;
  }
  // Search Operations
  async searchBatteries(params) {
    console.log("[Search Params]", params);
    if (!params || Object.keys(params).length === 0) {
      console.log("[All Batteries]", this.db.batteries);
      return this.db.batteries;
    }
    let results = [...this.db.batteries];
    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (battery) => battery.title?.toLowerCase().includes(query) || battery.description?.toLowerCase().includes(query) || battery.manufacturer?.toLowerCase().includes(query) || battery.technologyType?.toLowerCase().includes(query)
      );
    }
    if (params.batteryType) {
      results = results.filter((battery) => battery.batteryType === params.batteryType);
    }
    if (params.category) {
      results = results.filter((battery) => battery.category === params.category);
    }
    if (params.minCapacity !== void 0) {
      results = results.filter((battery) => Number(battery.capacity) >= params.minCapacity);
    }
    if (params.maxCapacity !== void 0) {
      results = results.filter((battery) => Number(battery.capacity) <= params.maxCapacity);
    }
    if (params.minPrice !== void 0) {
      results = results.filter((battery) => Number(battery.price) >= params.minPrice);
    }
    if (params.maxPrice !== void 0) {
      results = results.filter((battery) => Number(battery.price) <= params.maxPrice);
    }
    if (params.location) {
      results = results.filter(
        (battery) => battery.location?.toLowerCase().includes(params.location.toLowerCase())
      );
    }
    if (params.country) {
      results = results.filter((battery) => battery.country === params.country);
    }
    if (params.listingType) {
      results = results.filter((battery) => battery.listingType === params.listingType);
    }
    if (params.manufacturer) {
      results = results.filter(
        (battery) => battery.manufacturer?.toLowerCase() === params.manufacturer?.toLowerCase()
      );
    }
    console.log("[Search Results]", results);
    return results;
  }
  // Category Operations
  async getBatteriesByCategory(category) {
    return this.db.batteries.filter((battery) => battery.category === category).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getFeaturedBatteries(limit = 4) {
    return this.db.batteries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
  // User-specific Operations
  async getUserBatteries(userId) {
    return this.db.batteries.filter((battery) => battery.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // Debug methods
  getDebugDump() {
    return {
      batteryCount: this.db.batteries.length,
      userCount: this.db.users.length,
      nextBatteryId: this.db.nextBatteryId,
      nextUserId: this.db.nextUserId,
      batteryIds: this.db.batteries.map((b) => ({
        id: b.id,
        type: typeof b.id,
        title: b.title
      }))
    };
  }
  async getAllBatteryIds() {
    return this.db.batteries.map((b) => ({
      id: b.id,
      type: typeof b.id,
      title: b.title
    }));
  }
};
var storage = new Storage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var batteryTypes = {
  NEW: "new",
  USED: "used",
  SECOND_LIFE: "second-life"
};
var batteryCategories = {
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial",
  INDUSTRIAL: "industrial",
  GRID_SCALE: "grid-scale",
  EV: "ev",
  SOLAR_INTEGRATION: "solar-integration"
};
var listingTypes = {
  BUY: "buy",
  SELL: "sell",
  RENT: "rent"
};
var batterys = pgTable("batteries", {
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
  rentalPeriod: text("rental_period"),
  images: text("images").array(),
  additionalSpecs: json("additional_specs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  phone: true,
  location: true,
  country: true
});
var insertBatterySchema = createInsertSchema(batterys).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial({
  description: true
});
var batterySearchSchema = z.object({
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
  manufacturer: z.string().optional()
});

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/auth.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
var sessions = /* @__PURE__ */ new Map();
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}
function isAuthenticated(req, res, next) {
  const sessionId = req.headers.authorization?.split(" ")[1];
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = sessions.get(sessionId);
  req.user = { id: userId };
  req.userId = userId;
  next();
}
function registerAuthRoutes(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      const { email, username, password } = req.body;
      if (!email || !username || !password) {
        return res.status(400).json({ message: "Email, username, and password are required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already in use" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({ email, username, password: hashedPassword });
      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const sessionId = randomBytes(32).toString("hex");
      sessions.set(sessionId, user.id);
      await storage.trackLogin(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        ...userWithoutPassword,
        token: sessionId
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    const sessionId = req.headers.authorization?.split(" ")[1];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });
  app2.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "An error occurred" });
    }
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  registerAuthRoutes(app2);
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };
      const user = await storage.createUser(userWithHashedPassword);
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("User creation error:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.post("/api/batteries", async (req, res) => {
    try {
      const batteryData = {
        ...insertBatterySchema.parse(req.body),
        description: req.body.description || "No description provided"
      };
      const user = await storage.getUser(batteryData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const battery = await storage.createBattery(batteryData);
      console.log("[Battery Creation]", battery);
      return res.status(201).json(battery);
    } catch (error) {
      console.error("[Battery Creation Error]", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to create battery listing" });
    }
  });
  app2.get("/api/batteries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ message: "Invalid limit or offset" });
      }
      const batteries = await storage.getBatteries(limit, offset);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get batteries" });
    }
  });
  app2.get("/api/batteries/:id", async (req, res) => {
    try {
      const idParam = req.params.id;
      console.log("Battery ID requested:", idParam, "Type:", typeof idParam);
      const batteryId = parseInt(idParam);
      const id = !isNaN(batteryId) ? batteryId : idParam;
      console.log("Battery ID to search for:", id, "Type:", typeof id);
      const battery = await storage.getBattery(id);
      console.log("Battery search result:", battery ? `Found with ID ${battery.id}` : "Not found");
      if (!battery) {
        console.log("Battery not found for ID:", id);
        return res.status(404).json({ message: "Battery not found" });
      }
      console.log("Battery retrieval final result:", battery ? `Found ${battery.id}: ${battery.title}` : "Not found");
      return res.json(battery);
    } catch (error) {
      console.error("Error getting battery:", error);
      return res.status(500).json({ message: "Failed to get battery" });
    }
  });
  app2.put("/api/batteries/:id", isAuthenticated, async (req, res) => {
    try {
      const idParam = req.params.id;
      const batteryId = parseInt(idParam);
      const id = !isNaN(batteryId) ? batteryId : idParam;
      const existingBattery = await storage.getBattery(id);
      if (!existingBattery) {
        return res.status(404).json({ message: "Battery not found" });
      }
      const userId = req.user?.id;
      if (!userId || existingBattery.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You can only update your own listings" });
      }
      const updatedBattery = req.body;
      const result = await storage.updateBattery(id, updatedBattery);
      if (!result) {
        return res.status(500).json({ message: "Failed to update battery" });
      }
      console.log("Battery updated successfully:", result);
      return res.json(result);
    } catch (error) {
      console.error("Error updating battery:", error);
      return res.status(500).json({ message: "Failed to update battery" });
    }
  });
  app2.delete("/api/batteries/:id", async (req, res) => {
    try {
      const batteryId = parseInt(req.params.id);
      if (isNaN(batteryId)) {
        return res.status(400).json({ message: "Invalid battery ID" });
      }
      const existingBattery = await storage.getBattery(batteryId);
      if (!existingBattery) {
        return res.status(404).json({ message: "Battery not found" });
      }
      const success = await storage.deleteBattery(batteryId);
      if (success) {
        return res.status(204).send();
      } else {
        return res.status(500).json({ message: "Failed to delete battery" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete battery" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      console.log("[Search Request]", req.query);
      const searchParams = {
        query: req.query.q,
        batteryType: req.query.type,
        category: req.query.category,
        minCapacity: req.query.minCapacity ? parseFloat(req.query.minCapacity) : void 0,
        maxCapacity: req.query.maxCapacity ? parseFloat(req.query.maxCapacity) : void 0,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : void 0,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : void 0,
        location: req.query.location,
        country: req.query.country,
        listingType: req.query.listingType,
        manufacturer: req.query.manufacturer
      };
      const validParams = batterySearchSchema.safeParse(searchParams);
      if (!validParams.success) {
        return res.status(400).json({
          message: "Invalid search parameters",
          errors: fromZodError(validParams.error).message
        });
      }
      const results = await storage.searchBatteries(validParams.data);
      console.log("[Search Results]", {
        params: validParams.data,
        resultsCount: results.length,
        results
      });
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ message: "Search failed" });
    }
  });
  app2.get("/api/categories/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const batteries = await storage.getBatteriesByCategory(category);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get batteries by category" });
    }
  });
  app2.get("/api/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 4;
      if (isNaN(limit)) {
        return res.status(400).json({ message: "Invalid limit" });
      }
      const batteries = await storage.getFeaturedBatteries(limit);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get featured batteries" });
    }
  });
  app2.get("/api/users/:userId/batteries", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const batteries = await storage.getUserBatteries(userId);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user batteries" });
    }
  });
  app2.post("/api/inquiries", isAuthenticated, async (req, res) => {
    try {
      const { batteryId, message, contactEmail } = req.body;
      const userId = req.userId;
      if (!batteryId || !message) {
        return res.status(400).json({ message: "Battery ID and message are required" });
      }
      const battery = await storage.getBattery(batteryId);
      if (!battery) {
        return res.status(404).json({ message: "Battery not found" });
      }
      const inquiry = await storage.createInquiry({
        userId,
        batteryId,
        message,
        contactEmail
      });
      return res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      return res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });
  app2.get("/api/admin/logins", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.id !== 1) {
        return res.status(403).json({ message: "Not authorized to access admin data" });
      }
      const logins = await storage.getLogins();
      return res.json(logins);
    } catch (error) {
      console.error("Error getting logins:", error);
      return res.status(500).json({ message: "Failed to get login data" });
    }
  });
  app2.get("/api/admin/inquiries", isAuthenticated, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.id !== 1) {
        return res.status(403).json({ message: "Not authorized to access admin data" });
      }
      const inquiries = await storage.getInquiries();
      return res.json(inquiries);
    } catch (error) {
      console.error("Error getting inquiries:", error);
      return res.status(500).json({ message: "Failed to get inquiry data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
