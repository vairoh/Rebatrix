import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { batterySearchSchema, insertBatterySchema, insertUserSchema } from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { hashPassword, registerAuthRoutes } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api
  
  // Register authentication routes
  registerAuthRoutes(app);

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash the password before storing
      const hashedPassword = await hashPassword(userData.password);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(userWithHashedPassword);
      
      // Don't return the password in the response
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

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Battery routes
  app.post("/api/batteries", async (req, res) => {
    try {
      const batteryData = insertBatterySchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(batteryData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const battery = await storage.createBattery(batteryData);
      return res.status(201).json(battery);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to create battery listing" });
    }
  });

  app.get("/api/batteries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ message: "Invalid limit or offset" });
      }
      
      const batteries = await storage.getBatteries(limit, offset);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get batteries" });
    }
  });

  app.get("/api/batteries/:id", async (req, res) => {
    try {
      const batteryId = parseInt(req.params.id);
      if (isNaN(batteryId)) {
        return res.status(400).json({ message: "Invalid battery ID" });
      }
      
      const battery = await storage.getBattery(batteryId);
      if (!battery) {
        return res.status(404).json({ message: "Battery not found" });
      }
      
      return res.json(battery);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get battery" });
    }
  });

  app.put("/api/batteries/:id", async (req, res) => {
    try {
      const batteryId = parseInt(req.params.id);
      if (isNaN(batteryId)) {
        return res.status(400).json({ message: "Invalid battery ID" });
      }
      
      // Check if battery exists
      const existingBattery = await storage.getBattery(batteryId);
      if (!existingBattery) {
        return res.status(404).json({ message: "Battery not found" });
      }
      
      // Partial validation for update
      const batteryData = insertBatterySchema.partial().parse(req.body);
      
      const updatedBattery = await storage.updateBattery(batteryId, batteryData);
      return res.json(updatedBattery);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to update battery" });
    }
  });

  app.delete("/api/batteries/:id", async (req, res) => {
    try {
      const batteryId = parseInt(req.params.id);
      if (isNaN(batteryId)) {
        return res.status(400).json({ message: "Invalid battery ID" });
      }
      
      // Check if battery exists
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

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      // Extract search parameters
      const searchParams = {
        query: req.query.q as string | undefined,
        batteryType: req.query.type as string | undefined,
        category: req.query.category as string | undefined,
        minCapacity: req.query.minCapacity ? parseFloat(req.query.minCapacity as string) : undefined,
        maxCapacity: req.query.maxCapacity ? parseFloat(req.query.maxCapacity as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        location: req.query.location as string | undefined,
        country: req.query.country as string | undefined,
        listingType: req.query.listingType as string | undefined,
        manufacturer: req.query.manufacturer as string | undefined
      };
      
      // Validate search parameters
      const validParams = batterySearchSchema.safeParse(searchParams);
      if (!validParams.success) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: fromZodError(validParams.error).message 
        });
      }
      
      const results = await storage.searchBatteries(validParams.data);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ message: "Search failed" });
    }
  });

  // Category routes
  app.get("/api/categories/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const batteries = await storage.getBatteriesByCategory(category);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get batteries by category" });
    }
  });

  // Featured batteries
  app.get("/api/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      if (isNaN(limit)) {
        return res.status(400).json({ message: "Invalid limit" });
      }
      
      const batteries = await storage.getFeaturedBatteries(limit);
      return res.json(batteries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get featured batteries" });
    }
  });

  // User-specific batteries
  app.get("/api/users/:userId/batteries", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
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

  const httpServer = createServer(app);

  return httpServer;
}
