import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  batterySearchSchema,
  insertBatterySchema,
  insertUserSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  hashPassword,
  registerAuthRoutes,
  isAuthenticated,
} from "./auth";

/**
 * Registers all HTTP routes for the Rebatrix API.
 * All endpoints are prefixed with `/api/*`.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  registerAuthRoutes(app);

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      if (await storage.getUserByEmail(userData.email)) {
        return res.status(409).json({ message: "Email already exists" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      const { password: _pw, ...safeUser } = user;
      return res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("[User Creation Error]", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (Number.isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _pw, ...safeUser } = user;
      return res.json(safeUser);
    } catch (e) {
      return res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/batteries", async (req: Request, res: Response) => {
    try {
      const batteryData = {
        ...insertBatterySchema.parse(req.body),
        description: req.body.description || "No description provided",
      };
      if (!(await storage.getUser(batteryData.userId))) {
        return res.status(404).json({ message: "User not found" });
      }
      const battery = await storage.createBattery(batteryData);
      return res.status(201).json(battery);
    } catch (error) {
      console.error("[Battery Creation Error]", error);
      if (error instanceof ZodError)
        return res.status(400).json({ message: fromZodError(error).message });
      return res.status(500).json({ message: "Failed to create battery listing" });
    }
  });

  app.get("/api/batteries", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      if (Number.isNaN(limit) || Number.isNaN(offset))
        return res.status(400).json({ message: "Invalid limit or offset" });
      const batteries = await storage.getBatteries(limit, offset);
      return res.json(batteries);
    } catch (_) {
      return res.status(500).json({ message: "Failed to get batteries" });
    }
  });

  app.get("/api/batteries/:id", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      const numeric = Number(idParam);
      const id = Number.isNaN(numeric) ? idParam : numeric;
      const battery = await storage.getBattery(id);
      if (!battery) return res.status(404).json({ message: "Battery not found" });
      return res.json(battery);
    } catch (e) {
      console.error("[Get Battery Error]", e);
      return res.status(500).json({ message: "Failed to get battery" });
    }
  });

  app.put("/api/batteries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      const numeric = Number(idParam);
      const id = Number.isNaN(numeric) ? idParam : numeric;
      const existing = await storage.getBattery(id);
      if (!existing) return res.status(404).json({ message: "Battery not found" });
      const userId = req.user!.id;
      if (existing.userId !== userId)
        return res.status(403).json({ message: "Unauthorized: update your own listings only" });
      const updated = await storage.updateBattery(id, req.body);
      if (!updated) return res.status(500).json({ message: "Failed to update battery" });
      return res.json(updated);
    } catch (e) {
      console.error("[Update Battery Error]", e);
      return res.status(500).json({ message: "Failed to update battery" });
    }
  });

  app.delete("/api/batteries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const batteryId = Number(req.params.id);
      if (Number.isNaN(batteryId)) return res.status(400).json({ message: "Invalid battery ID" });
      const existing = await storage.getBattery(batteryId);
      if (!existing) return res.status(404).json({ message: "Battery not found" });
      const userId = req.user!.id;
      if (existing.userId !== userId)
        return res.status(403).json({ message: "Unauthorized" });
      const ok = await storage.deleteBattery(batteryId);
      return ok ? res.status(204).send() : res.status(500).json({ message: "Failed to delete battery" });
    } catch (_) {
      return res.status(500).json({ message: "Failed to delete battery" });
    }
  });

  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const rawParams = {
        query: req.query.q as string | undefined,
        batteryType: req.query.type as string | undefined,
        category: req.query.category as string | undefined,
        minCapacity: req.query.minCapacity ? Number(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? Number(req.query.maxCapacity) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        location: req.query.location as string | undefined,
        country: req.query.country as string | undefined,
        listingType: req.query.listingType as string | undefined,
        manufacturer: req.query.manufacturer as string | undefined,
      };
      const parsed = batterySearchSchema.safeParse(rawParams);
      if (!parsed.success)
        return res.status(400).json({ message: "Invalid search parameters", errors: fromZodError(parsed.error).message });
      const results = await storage.searchBatteries(parsed.data);
      return res.json(results);
    } catch (e) {
      return res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/categories/:category", async (req: Request, res: Response) => {
    try {
      const batteries = await storage.getBatteriesByCategory(req.params.category);
      return res.json(batteries);
    } catch (_) {
      return res.status(500).json({ message: "Failed to get batteries by category" });
    }
  });

  app.get("/api/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      if (Number.isNaN(limit)) return res.status(400).json({ message: "Invalid limit" });
      const batteries = await storage.getFeaturedBatteries(limit);
      return res.json(batteries);
    } catch (_) {
      return res.status(500).json({ message: "Failed to get featured batteries" });
    }
  });

  app.get("/api/users/:userId/batteries", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (Number.isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
      if (!(await storage.getUser(userId))) return res.status(404).json({ message: "User not found" });
      const batteries = await storage.getUserBatteries(userId);
      return res.json(batteries);
    } catch (_) {
      return res.status(500).json({ message: "Failed to get user batteries" });
    }
  });

  app.post("/api/inquiries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { batteryId, message, contactEmail } = req.body;
      const userId = req.user!.id;
      if (!batteryId || !message)
        return res.status(400).json({ message: "Battery ID and message are required" });
      if (!(await storage.getBattery(batteryId)))
        return res.status(404).json({ message: "Battery not found" });
      const inquiry = await storage.createInquiry({ userId, batteryId, message, contactEmail });
      return res.status(201).json(inquiry);
    } catch (e) {
      console.error("[Create Inquiry Error]", e);
      return res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  app.get("/api/admin/logins", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user || user.id !== 1) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const logins = await storage.getLogins();
      return res.json(logins);
    } catch (e) {
      console.error("[Admin Logins Error]", e);
      return res.status(500).json({ message: "Failed to get login data" });
    }
  });

  app.get("/api/admin/inquiries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user || user.id !== 1) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const inquiries = await storage.getInquiries();
      return res.json(inquiries);
    } catch (e) {
      console.error("[Admin Inquiries Error]", e);
      return res.status(500).json({ message: "Failed to get inquiry data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}