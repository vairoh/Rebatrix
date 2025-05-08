var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  batteries: () => batteries,
  batteryCategories: () => batteryCategories,
  batterySearchSchema: () => batterySearchSchema,
  batteryTypes: () => batteryTypes,
  inquiries: () => inquiries,
  insertBatterySchema: () => insertBatterySchema,
  insertUserSchema: () => insertUserSchema,
  listingTypes: () => listingTypes,
  users: () => users
});
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
var batteries = pgTable("batteries", {
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
var inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  batteryId: integer("battery_id").notNull().references(() => batteries.id),
  message: text("message").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").default("new"),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  phone: true,
  location: true,
  country: true
});
var insertBatterySchema = createInsertSchema(batteries).omit({
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
  listingType: z.enum([listingTypes.BUY, listingTypes.SELL, listingTypes.RENT]).optional(),
  manufacturer: z.string().optional()
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com") ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { and, eq, gte, lte, ilike } from "drizzle-orm/expressions";
import { desc } from "drizzle-orm";
var Storage = class {
  // ✅ User Operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values({ ...userData, createdAt: /* @__PURE__ */ new Date() }).returning();
    return user;
  }
  // ✅ Battery Operations
  async createBattery(insertBattery) {
    const [battery] = await db.insert(batteries).values({ ...insertBattery, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).returning();
    return battery;
  }
  async getBattery(id) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const result = await db.select().from(batteries).where(eq(batteries.id, numericId)).limit(1);
    return result[0];
  }
  async updateBattery(id, updatedBattery) {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const [battery] = await db.update(batteries).set({ ...updatedBattery, updatedAt: /* @__PURE__ */ new Date() }).where(eq(batteries.id, numericId)).returning();
    return battery ?? void 0;
  }
  async deleteBattery(id) {
    const result = await db.delete(batteries).where(eq(batteries.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getBatteries(limit = 20, offset = 0) {
    return db.select().from(batteries).orderBy(desc(batteries.createdAt)).limit(limit).offset(offset);
  }
  async searchBatteries(params) {
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
    if (params.minCapacity !== void 0) whereClauses.push(gte(batteries.capacity, params.minCapacity));
    if (params.maxCapacity !== void 0) whereClauses.push(lte(batteries.capacity, params.maxCapacity));
    if (params.minPrice !== void 0) whereClauses.push(gte(batteries.price, params.minPrice));
    if (params.maxPrice !== void 0) whereClauses.push(lte(batteries.price, params.maxPrice));
    if (params.location) whereClauses.push(ilike(batteries.location, `%${params.location}%`));
    if (params.country) whereClauses.push(eq(batteries.country, params.country));
    if (params.listingType) whereClauses.push(eq(batteries.listingType, params.listingType));
    if (params.manufacturer) whereClauses.push(ilike(batteries.manufacturer, params.manufacturer));
    return db.select().from(batteries).where(and(...whereClauses)).orderBy(desc(batteries.createdAt));
  }
  async getBatteriesByCategory(category) {
    return db.select().from(batteries).where(eq(batteries.category, category)).orderBy(desc(batteries.createdAt));
  }
  async getFeaturedBatteries(limit = 4) {
    return db.select().from(batteries).orderBy(desc(batteries.createdAt)).limit(limit);
  }
  async getUserBatteries(userId) {
    return db.select().from(batteries).where(eq(batteries.userId, userId)).orderBy(desc(batteries.createdAt));
  }
  async getAllBatteryIds() {
    const result = await db.select({ id: batteries.id, title: batteries.title }).from(batteries);
    return result.map((b) => ({
      id: b.id,
      type: typeof b.id,
      title: b.title
    }));
  }
  // ✅ Inquiry Operations (PostgreSQL only)
  async createInquiry(data) {
    const [inquiry] = await db.insert(inquiries).values({
      userId: data.userId,
      batteryId: data.batteryId,
      message: data.message,
      contactEmail: data.contactEmail,
      status: "new",
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    return inquiry;
  }
  async getInquiries() {
    return db.select().from(inquiries).orderBy(desc(inquiries.timestamp));
  }
};
var storage = new Storage();

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
      const { email, password, phone, location, country } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        phone,
        location,
        country
      });
      const sessionId = randomBytes(32).toString("hex");
      sessions.set(sessionId, newUser.id);
      await storage.trackLogin(newUser.id, newUser.email);
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        ...userWithoutPassword,
        token: sessionId
      });
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
      const batteries2 = await storage.getBatteries(limit, offset);
      return res.json(batteries2);
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
      const batteries2 = await storage.getBatteriesByCategory(category);
      return res.json(batteries2);
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
      const batteries2 = await storage.getFeaturedBatteries(limit);
      return res.json(batteries2);
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
      const batteries2 = await storage.getUserBatteries(userId);
      return res.json(batteries2);
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
      const inquiries2 = await storage.getInquiries();
      return res.json(inquiries2);
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
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
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
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
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
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
