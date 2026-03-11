import fs from "fs";
import path from "path";
import { users, type User, type UpsertUser } from "@shared/models/auth";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStudentId(studentId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

class AuthStorage implements IAuthStorage {
  private users: Map<string, User> = new Map();
  private filePath = path.resolve(process.cwd(), "users_dump.json");

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
        if (Array.isArray(data)) {
          this.users = new Map(data.map((u: any) => [u.id, {
            ...u,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt)
          }]));
        }
      }
    } catch (err) {
      console.error("Error loading users from disk:", err);
    }
  }

  private saveData() {
    try {
      const data = Array.from(this.users.values());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error saving users to disk:", err);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.studentId === studentId);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || "gen_" + Math.random().toString(36).substring(7);
    const existing = this.users.get(id);
    const now = new Date();

    if (existing) {
      const updated: User = { ...existing, ...userData, updatedAt: now };
      this.users.set(id, updated);
      this.saveData();
      return updated;
    } else {
      const newUser: User = {
        ...userData,
        id,
        createdAt: now,
        updatedAt: now,
      } as User;
      this.users.set(id, newUser);
      this.saveData();
      return newUser;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) this.saveData();
    return deleted;
  }
}

class DatabaseAuthStorage implements IAuthStorage {
  constructor() {
    // DB is handled via drizzle imports
  }

  async getUser(id: string): Promise<User | undefined> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    const { db } = await import("../../db");
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.studentId, studentId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { db } = await import("../../db");
    const { eq, or } = await import("drizzle-orm");
    const id = userData.id || (userData as any).sub || "gen_" + Math.random().toString(36).substring(7);

    // First try to find by ID
    let [existing] = await db.select().from(users).where(eq(users.id, id));

    // If not found by ID, try to find by email to avoid UNIQUE constraint errors
    if (!existing && userData.email) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, userData.email));
      if (byEmail) existing = byEmail;
    }

    // If still not found, try by username
    if (!existing && userData.username) {
      const [byUsername] = await db.select().from(users).where(eq(users.username, userData.username));
      if (byUsername) existing = byUsername;
    }

    if (existing) {
      const [updated] = await db.update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newUser] = await db.insert(users)
        .values({
          ...userData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // --- Store Signup Data as File (Backup) ---
      try {
        const path = await import("path");
        const fs = await import("fs");
        const signupLogDir = path.join(process.cwd(), "uploads", "signups");
        if (!fs.existsSync(signupLogDir)) fs.mkdirSync(signupLogDir, { recursive: true });
        const filePath = path.join(signupLogDir, `${newUser.id}_signup.json`);
        const jsonContent = JSON.stringify(newUser, null, 2);
        fs.writeFileSync(filePath, jsonContent);
        console.log(`[STORAGE] Data stored to local file: ${filePath}`);

        // --- Sync to Supabase Storage ---
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const bucketName = "bucket"; // Seen in user's screenshot
          const fileName = `signups/${newUser.id}_signup.json`;
          const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;

          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              "x-upsert": "true"
            },
            body: jsonContent
          });

          if (response.ok) {
            console.log(`[STORAGE] Successfully synced signup to Supabase Storage: ${fileName}`);
          } else {
            const errBody = await response.text();
            console.error(`[STORAGE] Supabase Storage sync failed: ${response.statusText}`, errBody);
          }
        }
      } catch (fileErr) {
        console.error("[STORAGE] Failed to store backup data entirely:", fileErr);
      }

      return newUser;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}

export const authStorage = process.env.DATABASE_URL ? new DatabaseAuthStorage() : new AuthStorage();
