import { passport } from "./replitAuth";
import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { Strategy as LocalStrategy } from "passport-local";

import fs from "fs";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Magic Login for Testing Mode (Development Only)
  app.post("/api/auth/test-login/:role", async (req, res, next) => {
    try {
      const { role } = req.params;
      console.log(`[TESTING MODE] Attempting magic login for role: ${role}`);

      const usernameMap: Record<string, string> = {
        admin: "admin",
        teacher: "teacher",
        student: "student",
        parent: "parent"
      };

      const username = usernameMap[role.toLowerCase()];
      if (!username) return res.status(400).json({ message: "Invalid role" });

      const user = await authStorage.getUserByUsername(username);
      if (!user) return res.status(404).json({ message: "Demo user not found" });

      // Normalize user object for session
      const normalizedUser = {
        ...user,
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role
        },
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
      };

      req.logIn(normalizedUser, (err) => {
        if (err) return next(err);
        console.log(`[TESTING MODE] Magic login successful for: ${username}`);
        res.json(normalizedUser);
      });
    } catch (error) {
      next(error);
    }
  });

  // Local login route
  app.post("/api/login/local", (req, res, next) => {
    console.log("[AUTH] Attempting local login...");
    const strategies = (passport as any)._strategies;
    console.log("[AUTH] Registered strategies:", Object.keys(strategies || {}));

    if (!strategies || !strategies.local) {
      console.error("[AUTH] CRITICAL: 'local' strategy is MISSING at runtime!");
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  // Local signup/create student route - Restricted to Super Admin
  app.post("/api/signup/local", isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims?.sub || req.user.id;
      const requester = await authStorage.getUser(requesterId);

      if (requester?.email?.toLowerCase() !== "fehmidatajhujra@gmail.com") {
        return res.status(403).json({ message: "Only the Super Admin (fehmidatajhujra@gmail.com) can create accounts." });
      }

      const { studentId, username, password, firstName, lastName, email, role } = req.body;
      const { storage } = await import("../../storage");

      const existing = await authStorage.getUserByUsername(username) || await authStorage.getUserByStudentId(studentId);
      if (existing) {
        return res.status(400).json({ message: "Username or Student ID already exists" });
      }

      const user = await authStorage.upsertUser({
        username: username || email, // Fallback to email if no username chosen
        studentId: studentId || `STU${Math.floor(1000 + Math.random() * 9000)}`,
        password,
        firstName,
        lastName,
        email,
        role: role || "student",
      });
      // --- Auto-assignment to Special Groups ---
      try {
        const { groups: group_list } = await storage.getGroups({ limit: 100 });

        // 1. Add to Main Group (Everyone)
        const mainGroup = group_list.find(g => g.name === "Saut-ul-Quran Main Group");
        if (mainGroup) {
          if (user.role?.toLowerCase() === "teacher" || user.role?.toLowerCase() === "admin") {
            await storage.assignTeacherToGroup(mainGroup.id, user.id);
          } else {
            await storage.addStudentToGroup(mainGroup.id, user.id);
          }
        }

        // 2. Add to Staff Group (Admins and Teachers Only)
        if (user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "teacher") {
          const staffGroup = group_list.find(g => g.name === "Staff Staff Room");
          if (staffGroup) {
            await storage.assignTeacherToGroup(staffGroup.id, user.id);
          }
        }
      } catch (groupErr) {
        console.error("[SIGNUP] Failed to auto-assign group:", groupErr);
        // Don't fail the whole signup if group assignment fails
      }

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get all users (Super Admin only)
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const currentUser = await authStorage.getUser(userId);

      if (currentUser?.email?.toLowerCase() !== "fehmidatajhujra@gmail.com") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allUsers = await authStorage.getUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
}

