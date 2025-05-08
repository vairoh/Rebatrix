/* ──────────────────────────────────────────────────────────────
   server/auth.ts
   State-of-the-art authentication & session middleware for Rebatrix
   ────────────────────────────────────────────────────────────── */

   import { randomBytes, scrypt, timingSafeEqual } from "crypto";
   import { promisify } from "util";
   import { type Express, type Request, type Response, type NextFunction } from "express";
   import { storage } from "./storage";
   
   const scryptAsync = promisify(scrypt);
   
   /* ------------------------------------------------------------------
      1. Express Request augmentation → req.user.id everywhere (no “any”)
      ------------------------------------------------------------------ */
   declare global {
     namespace Express {
       interface Request {
         /** Populated by `isAuthenticated` */
         user?: { id: number };
       }
     }
   }
   
   /* ------------------------------------------------------------------
      2. In-memory session store (Map is fine until you scale horizontally)
      ------------------------------------------------------------------ */
   interface SessionData {
     userId: number;
     createdAt: number;
   }
   const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
   const sessions = new Map<string, SessionData>();
   
   /* ------------------------------------------------------------------
      3. Helper functions
      ------------------------------------------------------------------ */
   function generateSessionId(): string {
     return randomBytes(32).toString("hex");
   }
   
   function createSession(userId: number): string {
     const id = generateSessionId();
     sessions.set(id, { userId, createdAt: Date.now() });
     return id;
   }
   
   function getSession(sessionId?: string): SessionData | undefined {
     if (!sessionId) return undefined;
     const s = sessions.get(sessionId);
     if (!s) return undefined;
     if (Date.now() - s.createdAt > SESSION_TTL_MS) {
       sessions.delete(sessionId); // expire
       return undefined;
     }
     return s;
   }
   
   /* Password hashing (scrypt + per-user salt) */
   export async function hashPassword(password: string): Promise<string> {
     const salt = randomBytes(16).toString("hex");
     const hash = (await scryptAsync(password, salt, 64)) as Buffer;
     return `${hash.toString("hex")}.${salt}`;
   }
   
   export async function comparePasswords(
     plaintext: string,
     hashed: string
   ): Promise<boolean> {
     const [hashHex, salt] = hashed.split(".");
     const storedHash = Buffer.from(hashHex, "hex");
     const suppliedHash = (await scryptAsync(plaintext, salt, 64)) as Buffer;
     return timingSafeEqual(storedHash, suppliedHash);
   }
   
   /* ------------------------------------------------------------------
      4. Auth middleware
      ------------------------------------------------------------------ */
   export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
     const authHeader = req.header("Authorization") || "";
     const [, token] = authHeader.split(" "); // "Bearer <token>"
     const session = getSession(token);
   
     if (!session) return res.status(401).json({ message: "Unauthorized" });
   
     req.user = { id: session.userId };
     return next();
   }
   
   /* ------------------------------------------------------------------
      5. Route factory
      ------------------------------------------------------------------ */
   export function registerAuthRoutes(app: Express) {
     /* -----------------------------  REGISTER  ---------------------------- */
     app.post("/api/register", async (req: Request, res: Response) => {
       try {
         const { email, password, phone, location, country } = req.body;
         if (!email || !password)
           return res.status(400).json({ message: "Email and password are required" });
   
         if (await storage.getUserByEmail(email))
           return res.status(409).json({ message: "Email already in use" });
   
         const hashed = await hashPassword(password);
         const newUser = await storage.createUser({
           email,
           password: hashed,
           phone,
           location,
           country,
         });
   
         const token = createSession(newUser.id);
   
         await storage.trackLogin(newUser.id, newUser.email);
            
         const { password: _pw, ...safeUser } = newUser;
         return res.status(201).json({ ...safeUser, token });
       } catch (err) {
         console.error("Registration error:", err);
         return res.status(500).json({ message: "Registration failed" });
       }
     });
   
     /* ------------------------------  LOGIN  ------------------------------ */
     app.post("/api/login", async (req: Request, res: Response) => {
       try {
         const { email, password } = req.body;
         if (!email || !password)
           return res.status(400).json({ message: "Email and password are required" });
   
         const user = await storage.getUserByEmail(email);
         if (!user || !(await comparePasswords(password, user.password)))
           return res.status(401).json({ message: "Invalid email or password" });
   
         const token = createSession(user.id);
   
         await storage.trackLogin(user.id, user.email);
   
         const { password: _pw, ...safeUser } = user;
         return res.status(200).json({ ...safeUser, token });
       } catch (err) {
         console.error("Login error:", err);
         return res.status(500).json({ message: "Login failed" });
       }
     });
   
     /* ------------------------------  LOGOUT  ----------------------------- */
     app.post("/api/logout", (req: Request, res: Response) => {
       const [, token] = (req.header("Authorization") || "").split(" ");
       if (token) sessions.delete(token);
       return res.status(200).json({ message: "Logged out successfully" });
     });
   
     /* -----------------------------  CURRENT USER  ------------------------ */
     app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
       try {
         const userId = req.user!.id;
         const user = await storage.getUser(userId);
         if (!user) return res.status(404).json({ message: "User not found" });
   
         const { password: _pw, ...safeUser } = user;
         return res.json(safeUser);
       } catch (err) {
         console.error("Get current user error:", err);
         return res.status(500).json({ message: "Unable to fetch user" });
       }
     });
   }
   