import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { batterySearchSchema, insertBatterySchema, insertUserSchema } from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { hashPassword, registerAuthRoutes, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api

  // Register authentication routes
  registerAuthRoutes(app);

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
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
      const batteryData = {
        ...insertBatterySchema.parse(req.body),
        description: req.body.description || "No description provided"
      };

      // Check if user exists
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
      const idParam = req.params.id;
      console.log("Battery ID requested:", idParam, "Type:", typeof idParam);

      // Try to parse as number if possible
      const batteryId = parseInt(idParam);

      // If it's a valid number, use it; otherwise use the string ID directly
      const id = !isNaN(batteryId) ? batteryId : idParam;

      // Debug information
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

  // Add endpoint to update a battery
  app.put("/api/batteries/:id", isAuthenticated, async (req, res) => {
    try {
      const idParam = req.params.id;
      const batteryId = parseInt(idParam);
      const id = !isNaN(batteryId) ? batteryId : idParam;

      // Get the existing battery to check ownership
      const existingBattery = await storage.getBattery(id);
      if (!existingBattery) {
        return res.status(404).json({ message: "Battery not found" });
      }

      // Check if the user is authorized to update this battery
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
      console.log("[Search Request]", req.query);
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
  
  // Submit an inquiry about a battery
  app.post("/api/inquiries", isAuthenticated, async (req, res) => {
    try {
      const { batteryId, message, contactEmail } = req.body;
      const userId = (req as any).userId;
      
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
  
  // Admin routes for login tracking and inquiries
  app.get("/api/admin/logins", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      // Basic admin check (you might want more sophisticated roles)
      if (!user || user.id !== 1) { // Assuming user ID 1 is admin
        return res.status(403).json({ message: "Not authorized to access admin data" });
      }
      
      const logins = await storage.getLogins();
      return res.json(logins);
    } catch (error) {
      console.error("Error getting logins:", error);
      return res.status(500).json({ message: "Failed to get login data" });
    }
  });
  
  app.get("/api/admin/inquiries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      // Basic admin check
      if (!user || user.id !== 1) { // Assuming user ID 1 is admin
        return res.status(403).json({ message: "Not authorized to access admin data" });
      }
      
      const inquiries = await storage.getInquiries();
      return res.json(inquiries);
    } catch (error) {
      console.error("Error getting inquiries:", error);
      return res.status(500).json({ message: "Failed to get inquiry data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}