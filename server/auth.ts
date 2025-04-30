import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Simple session storage
const sessions = new Map<string, number>(); // sessionId -> userId

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

// Middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.split(" ")[1];
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user ID to request for later use
  const userId = sessions.get(sessionId);
  (req as any).user = { id: userId };
  (req as any).userId = userId;
  next();
}

// Auth routes
export function registerAuthRoutes(app: any) {
  // Registration route (added)
  app.post("/api/register", async (req: Request, res: Response) => {
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


  // Login route
  app.post("/api/login", async (req: Request, res: Response) => {
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

      // Create a session
      const sessionId = randomBytes(32).toString("hex");
      sessions.set(sessionId, user.id);

      // Track the login
      await storage.trackLogin(user.id, user.email);

      // Don't send the password to the client
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

  // Logout route
  app.post("/api/logout", (req: Request, res: Response) => {
    const sessionId = req.headers.authorization?.split(" ")[1];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user
  app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send the password to the client
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "An error occurred" });
    }
  });
}