import type { Express, Request, Response } from "express";
import { log } from "./utils";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { setupAuth, registerAuthRoutes, isAuthenticated, isAdmin, isTeacherOrAdmin } from "./replit_integrations/auth";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerChatRoutes } from "./replit_integrations/chat";
import { getLocalIslamicAnswer, getRandomIslamicQuote } from "./replit_integrations/chat/knowledge";
import { api } from "@shared/routes";
import {
  insertDailyStatsSchema,
  insertQuranProgressSchema,
  insertLiveClassSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertQuizResultSchema,
  insertBookSchema,
  insertResourceSchema,
  insertFeeSchema,
  insertFlashcardSchema,
  insertCourseTestSchema,
  insertCourseTestResultSchema,
  insertGroupSchema,
  insertGroupTeacherSchema,
  insertGroupStudentSchema,
  insertGroupAnnouncementSchema,
  insertGroupAssignmentSchema,
  insertGroupAttendanceSchema,
  insertGroupPerformanceSchema,
  insertAuditLogSchema,
  insertWisdomSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFileHandler } from "./upload";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Ensure default course groups exist
  const ensureCourseGroups = async () => {
    const courseMappings = [
      { name: "Hadees Course", category: "Hadees" },
      { name: "Tajweed Course", category: "Tajweed" },
      { name: "Namaz Course", category: "Namaz" },
      { name: "Tafseer Course", category: "Tafseer" }
    ];
    const { groups: existingGroups } = await storage.getGroups({ limit: 100 });

    for (const course of courseMappings) {
      if (!existingGroups.find(g => g.name === course.name)) {
        await storage.createGroup({
          name: course.name,
          category: course.category,
          status: "active",
          capacity: 50
        });
        console.log(`[SEED] Created course group: ${course.name} (${course.category})`);
      }
    }
  };

  try {
    await setupAuth(app);

    // Seed demo users with proper credentials
    const seedDemoUsers = async () => {
      const demoUsers = [
        { email: "fehmidatajhujra@gmail.com", username: "superadmin", studentId: "SA001", firstName: "Super", lastName: "Admin", role: "admin", password: "123", id: "mock-user-id" },
        { email: "admin@test.com", username: "admin", studentId: "ADM001", firstName: "Admin", lastName: "User", role: "admin", password: "123" },
        { email: "teacher@test.com", username: "teacher", studentId: "TCH001", firstName: "Teacher", lastName: "Ali", role: "teacher", password: "123" },
        { email: "student@test.com", username: "student", studentId: "STU001", firstName: "Student", lastName: "Khan", role: "student", password: "123" },
        { email: "parent@test.com", username: "parent", studentId: "PAR001", firstName: "Parent", lastName: "Bano", role: "parent", password: "123" },
        { email: "wajiha@test.com", username: "ustazah_wajiha", studentId: "TCH003", firstName: "Api Jan Hafiza", lastName: "Wajiha", role: "teacher", password: "123", phoneNumber: "+92 300 1234567" },
      ];
      for (const u of demoUsers) {
        try {
          const userId = u.id || `demo-${u.username.replace('_', '-')}`;
          // Check by ID or Email to be safe
          const allUsers = await authStorage.getUsers();
          const existing = allUsers.find(ex => ex.id === userId || (u.email && ex.email?.toLowerCase() === u.email.toLowerCase()));

          if (!existing) {
            await authStorage.upsertUser({ ...u, id: userId });
            console.log(`[SEED] Created demo ${u.role}: ${u.username} / ${u.password}`);
          } else if (u.email?.toLowerCase() === "fehmidatajhujra@gmail.com") {
            // Always ensure Super Admin has the right role and email in the DB
            await authStorage.upsertUser({ ...u, id: existing.id });
          } else {
            console.log(`[SEED] Demo user already exists, skipping: ${u.username}`);
          }
        } catch (seedErr: any) {
          // Non-fatal: log and continue — don't let seed errors crash the server
          console.warn(`[SEED] Warning: could not seed user ${u.username}:`, seedErr?.message || seedErr);
        }
      }
    };
    try {
      await seedDemoUsers();
    } catch (seedErr: any) {
      console.warn("[SEED] seedDemoUsers encountered an error (non-fatal):", seedErr?.message || seedErr);
    }

    // Ensure special groups exist and proper access is set
    const ensureSpecialGroups = async () => {
      const specialGroups = [
        { name: "Staff Staff Room", category: "Staff", description: "Exclusive group for teachers and admins." },
        { name: "Saut-ul-Quran Main Group", category: "General", description: "Main community group for all students and staff." }
      ];

      const { groups: existingGroups } = await storage.getGroups({ limit: 100 });
      const allUsers = await authStorage.getUsers();

      for (const sg of specialGroups) {
        let group = existingGroups.find(g => g.name === sg.name);
        if (!group) {
          group = await storage.createGroup({
            name: sg.name,
            category: sg.category,
            status: "active",
            capacity: 500
          });
          console.log(`[SEED] Created special group: ${sg.name}`);
        }

        // Assign users to these groups
        if (sg.category === "Staff") {
          // Only Admin and Teachers
          const staff = allUsers.filter(u => u.role?.toLowerCase() === "admin" || u.role?.toLowerCase() === "teacher");
          const existingStaff = await storage.getGroupTeachers(group.id);
          for (const s of staff) {
            if (!existingStaff.find(es => es.id === s.id)) {
              await storage.assignTeacherToGroup(group.id, s.id);
            }
          }
        } else if (sg.name === "Saut-ul-Quran Main Group") {
          // Everyone
          const existingStudents = await storage.getGroupStudents(group.id);
          const existingTeachers = await storage.getGroupTeachers(group.id);
          for (const u of allUsers) {
            if (u.role?.toLowerCase() === "teacher" || u.role?.toLowerCase() === "admin") {
              if (!existingTeachers.find(et => et.id === u.id)) {
                await storage.assignTeacherToGroup(group.id, u.id);
              }
            } else {
              if (!existingStudents.find(es => es.id === u.id)) {
                await storage.addStudentToGroup(group.id, u.id);
              }
            }
          }
        }
      }
    };

    try {
      await ensureCourseGroups();
    } catch (e: any) {
      console.warn("[SEED] ensureCourseGroups non-fatal error:", e?.message || e);
    }
    try {
      await ensureSpecialGroups();
    } catch (e: any) {
      console.warn("[SEED] ensureSpecialGroups non-fatal error:", e?.message || e);
    }

    console.log("[DEBUG] Routes registration starting...");
    registerAuthRoutes(app);
    console.log("[DEBUG] Auth routes registered.");
    registerImageRoutes(app);
    registerChatRoutes(app);

    // Consolidated Upload Routes
    app.post("/api/upload", uploadFileHandler);
    app.post("/api/images/upload", uploadFileHandler);
    app.post("/api/audio/upload", uploadFileHandler);

    // Initial database setup (create session table if missing)
    app.get("/api/init-db", async (_req, res) => {
      try {
        const { pool } = await import("./db");
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE);
          
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
              ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
            END IF;
          END $$;

          CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
        res.send("Database initialized: Session table created successfully!");
      } catch (err: any) {
        console.error("[INIT-DB] Error:", err.message);
        res.status(500).send(`Error initializing database: ${err.message}`);
      }
    });

    // AI Tutor Chat
    app.post("/api/tutor/chat", async (req, res) => {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }
      const answer = getLocalIslamicAnswer(message) || getRandomIslamicQuote();
      res.json({ answer });
    });

    // Daily Stats
    app.get(api.dailyStats.get.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const stats = await storage.getDailyStats(userId);
      if (!stats) return res.status(404).json({ message: "No stats found" });
      res.json(stats);
    });

    app.get(api.dailyStats.history.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const history = await storage.getDailyStatsHistory(userId);
      res.json(history);
    });

    app.post(api.dailyStats.update.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
        const input = api.dailyStats.update.input.parse(req.body);
        const stats = await storage.updateDailyStats(userId, input);
        res.json(stats);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post(api.dailyStats.bulkUpdate.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const { date, updates, groupId } = req.body;
        const parsedDate = date ? new Date(date) : new Date();
        let count = 0;
        for (const update of updates) {
          const status = update.status || (update.attendance ? 'present' : 'absent');

          if (groupId && groupId !== 'all') {
            await storage.recordAttendance({
              groupId,
              userId: update.userId,
              status,
              date: parsedDate
            });
          } else {
            // If no groupId, record for all groups this student is in
            const userGroups = await storage.getUserGroups(update.userId, 'student');
            if (userGroups.length > 0) {
              for (const g of userGroups) {
                await storage.recordAttendance({
                  groupId: g.id,
                  userId: update.userId,
                  status,
                  date: parsedDate
                });
              }
            } else {
              // Fallback to updating only daily stats if no groups found
              await storage.updateDailyStats(update.userId, {
                date: parsedDate,
                attendance: update.attendance
              });
            }
          }
          count++;
        }
        res.json({ success: true, count });
      } catch (err: any) {
        console.error("[ATTENDANCE_BULK_UPDATE] Error:", err);
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: err.message || "Server error during bulk update" });
      }
    });

    app.get(api.dailyStats.getByDate.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const date = new Date(req.params.date);
        const stats = await storage.getDailyStatsByDate(date);
        res.json(stats);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Aggregate route for batch reports (Admins/Teachers Only)
    app.get("/api/admin/reports-all", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allUsers = await authStorage.getUsers();
      const students = allUsers.filter(u => u.role?.toLowerCase() === "student");

      const reportsBatch = await Promise.all(students.map(async (student) => {
        const dailyStatsHistory = await storage.getDailyStatsHistory(student.id);
        const quran = await storage.getQuranProgress(student.id);
        const tests = await storage.getCourseTestResults(student.id);

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          role: student.role,
          dailyStatsHistory: dailyStatsHistory || [],
          quran: quran || [],
          tests: tests || []
        };
      }));

      res.json(reportsBatch);
    });

    app.get("/api/admin/reports/:userId/daily-stats", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const targetUserId = req.params.userId;
      const stats = await storage.getDailyStats(targetUserId);
      res.json(stats || {});
    });

    app.get("/api/admin/reports/:userId/daily-stats/history", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const targetUserId = req.params.userId;
      const history = await storage.getDailyStatsHistory(targetUserId);
      res.json(history || []);
    });

    // Books
    app.get(api.books.list.path, async (_req, res) => {
      const books = await storage.getBooks();
      res.json(books);
    });

    app.post(api.books.create.path, isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const result = insertBookSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid book data", errors: result.error.errors });
      }
      const book = await storage.createBook(result.data);
      res.status(201).json(book);
    });

    app.delete(api.books.delete.path, isAuthenticated, isAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        await storage.deleteBook(id);
        res.json({ success: true });
      } catch (err) {
        console.error("Book deletion server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.patch("/api/books/:id", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
        const updated = await storage.updateBook(id, req.body);
        res.json(updated);
      } catch (err: any) {
        console.error("Book update server error:", err);
        res.status(500).json({ message: err.message || "Server error" });
      }
    });

    app.get(api.books.get.path, async (req, res) => {
      const book = await storage.getBook(Number(req.params.id));
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    });

    // Quran
    app.get(api.quran.progress.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const progress = await storage.getQuranProgress(userId);
      res.json(progress);
    });

    app.get("/api/admin/reports/:userId/quran-progress", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const targetUserId = req.params.userId;
      const progress = await storage.getQuranProgress(targetUserId);
      res.json(progress);
    });

    app.post(api.quran.updateProgress.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
        console.log("Received progress update request:", req.body, "User:", userId);
        const input = api.quran.updateProgress.input.parse({ ...req.body, userId });
        const entry = await storage.updateQuranProgress(userId, input);

        // Award "Hafiz Junior" if memorized 10+ surahs
        const progress = await storage.getQuranProgress(userId);
        const memorizedCount = new Set(progress.filter(p => p.status === 'memorized').map(p => p.surah)).size;
        const totalMemorizedAyahs = progress.filter(p => p.status === 'memorized').length;

        // Update daily stats hifzProgress
        await storage.updateDailyStats(userId, { hifzProgress: totalMemorizedAyahs });

        if (memorizedCount >= 10) {
          await storage.awardAchievement(userId, 2);
        }

        // Award "First Step" on any progress
        await storage.awardAchievement(userId, 1);

        res.json(entry);
      } catch (err) {
        console.error("Error saving Quran progress:", err);
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    // Resources
    app.get("/api/resources", async (req, res) => {
      const resources = await storage.getResources();
      res.json(resources);
    });

    app.post("/api/resources", async (req, res) => {
      try {
        const result = insertResourceSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ message: "Invalid resource data", errors: result.error.errors });
        }
        const resource = await storage.createResource(result.data);
        res.status(201).json(resource);
      } catch (err: any) {
        console.error("Error creating resource:", err);
        res.status(500).json({ message: err.message || "Server error creating resource" });
      }
    });

    app.patch("/api/resources/:id", async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
        const result = insertResourceSchema.partial().safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ message: "Invalid resource data", errors: result.error.errors });
        }
        const resource = await storage.updateResource(id, result.data);
        res.json(resource);
      } catch (err) {
        console.error("Resource update server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/resources/:id", async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
        await storage.deleteResource(id);
        res.json({ success: true });
      } catch (err) {
        console.error("Resource deletion server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Videos
    app.get(api.videos.list.path, async (req, res) => {
      const videos = await storage.getVideos();
      res.json(videos);
    });

    app.post(api.videos.create.path, async (req, res) => {
      try {
        const input = api.videos.create.input.parse(req.body);
        const video = await storage.createVideo(input);
        res.status(201).json(video);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("Video creation validation error:", err.errors);
          return res.status(400).json({ message: err.errors[0].message, details: err.errors });
        }
        console.error("Video creation server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.patch("/api/videos/:id/view", async (req, res) => {
      try {
        const id = Number(req.params.id);
        await storage.incrementVideoViews(id);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/videos/:id", async (req, res) => {
      try {
        const id = Number(req.params.id);
        await storage.deleteVideo(id);
        res.json({ success: true });
      } catch (err) {
        console.error("Video deletion server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Live Classes
    app.get(api.liveClasses.list.path, async (req, res) => {
      const classes = await storage.getLiveClasses();
      res.json(classes);
    });

    app.post(api.liveClasses.create.path, async (req, res) => {
      try {
        const input = api.liveClasses.create.input.parse(req.body);
        const cls = await storage.createLiveClass(input);
        res.status(201).json(cls);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.patch(api.liveClasses.update.path, async (req, res) => {
      try {
        const id = Number(req.params.id);
        const input = api.liveClasses.update.input.parse(req.body);
        const cls = await storage.updateLiveClass(id, input);
        res.json(cls);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    // Quizzes
    app.get(api.quizzes.list.path, async (req, res) => {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    });

    app.get(api.quizzes.get.path, async (req, res) => {
      try {
        const id = Number(req.params.id);
        const quiz = await storage.getQuiz(id);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        const questions = await storage.getQuizQuestions(id);
        res.json({ quiz, questions });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post(api.quizzes.create.path, async (req, res) => {
      try {
        const input = api.quizzes.create.input.parse(req.body);
        const quiz = await storage.createQuiz(input);
        res.status(201).json(quiz);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post(api.quizzes.addQuestion.path, async (req, res) => {
      try {
        const quizId = Number(req.params.id);
        const quiz = await storage.getQuiz(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const input = api.quizzes.addQuestion.input.parse(req.body);
        const question = await storage.createQuizQuestion({ ...input, quizId });
        res.status(201).json(question);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post(api.quizzes.submit.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const quizId = Number(req.params.id);
      try {
        const { score } = req.body;
        const result = await storage.submitQuizResult({
          userId,
          quizId,
          score
        });

        // Update daily stats quizScore
        const stats = await storage.getDailyStats(userId);
        const currentScore = stats?.quizScore || 0;
        await storage.updateDailyStats(userId, { quizScore: currentScore + score });

        // Award "Quiz Master" achievement if score is high (e.g., 100%)
        if (score >= 100) {
          await storage.awardAchievement(userId, 4);
        }

        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Achievements
    app.get(api.achievements.list.path, async (req, res) => {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    });

    app.get(api.achievements.myAchievements.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const myAchievements = await storage.getUserAchievements(userId);
      res.json(myAchievements);
    });

    // Auto-check and award all achievements for the current user
    app.post("/api/achievements/check", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const awarded: string[] = [];

      try {
        const allAchievements = await storage.getAchievements();
        const userAchievements = await storage.getUserAchievements(userId);
        const alreadyUnlocked = new Set(userAchievements.map(ua => ua.achievementId));

        // Helper: award if not already awarded
        const maybeAward = async (id: number, title: string) => {
          if (!alreadyUnlocked.has(id)) {
            await storage.awardAchievement(userId, id);
            alreadyUnlocked.add(id);
            awarded.push(title);
          }
        };

        // Find achievement IDs by title (robust to order changes)
        const findId = (title: string) => allAchievements.find(a => a.title === title)?.id;

        const firstStepId = findId("First Step");
        const hafizJuniorId = findId("Hafiz Junior");
        const quizChampionId = findId("Quiz Champion");
        const quizMasterId = findId("Quiz Master");
        const streakMasterId = findId("Streak Master");
        const libraryId = findId("Library Explorer");
        const duaReciterId = findId("Dua Reciter");
        const grandScholarlId = findId("Grand Scholar");
        const tajweedId = findId("Tajweed Master");
        const hadeesId = findId("Hadees Student");
        const namazId = findId("Namaz Expert");
        const tafseerId = findId("Tafseer Scholar");

        // 1. "First Step" – always awarded on first check (user is logged in and using the app)
        if (firstStepId) await maybeAward(firstStepId, "First Step");

        // 2. "Library Explorer" – check if requested via body flag
        if (libraryId && req.body?.visitedLibrary) {
          await maybeAward(libraryId, "Library Explorer");
        }

        // 3. "Hafiz Junior" – memorized 10+ surahs
        if (hafizJuniorId) {
          const progress = await storage.getQuranProgress(userId);
          const memorizedSurahs = new Set(progress.filter(p => p.status === 'memorized').map(p => p.surah)).size;
          if (memorizedSurahs >= 10) await maybeAward(hafizJuniorId, "Hafiz Junior");
        }

        // 4. "Quiz Champion" – scored 100% (stored in dailyStats as quizScore >= 100)
        if (quizChampionId) {
          const stats = await storage.getDailyStats(userId);
          if ((stats?.quizScore ?? 0) >= 100) await maybeAward(quizChampionId, "Quiz Champion");
        }

        // 5. "Quiz Master" – check body flag for quiz completion count
        if (quizMasterId && (req.body?.quizCount ?? 0) >= 3) {
          await maybeAward(quizMasterId, "Quiz Master");
        }

        // 6. "Streak Master" – 5+ days attendance in history
        if (streakMasterId) {
          const history = await storage.getDailyStatsHistory(userId);
          const attendedDays = history.filter(s => s.attendance).length;
          if (attendedDays >= 5) await maybeAward(streakMasterId, "Streak Master");
        }

        // 7. "Dua Reciter" – check body flag (frontend tracks listen count)
        if (duaReciterId && (req.body?.duasListened ?? 0) >= 5) {
          await maybeAward(duaReciterId, "Dua Reciter");
        }

        // 8. "Tajweed Master" / "Hadees Student" / "Namaz Expert" / "Tafseer Scholar"
        if (tajweedId && req.body?.visitedTajweed) await maybeAward(tajweedId, "Tajweed Master");
        if (hadeesId && req.body?.visitedHadees) await maybeAward(hadeesId, "Hadees Student");
        if (namazId && req.body?.visitedNamaz) await maybeAward(namazId, "Namaz Expert");
        if (tafseerId && req.body?.visitedTafseer) await maybeAward(tafseerId, "Tafseer Scholar");

        // 9. "Grand Scholar" – earned 100+ points
        if (grandScholarlId) {
          const freshAchievements = await storage.getUserAchievements(userId);
          const freshAll = await storage.getAchievements();
          const pts = freshAchievements.reduce((sum, ua) => {
            const a = freshAll.find(x => x.id === ua.achievementId);
            return sum + (a?.points ?? 0);
          }, 0);
          if (pts >= 100) await maybeAward(grandScholarlId, "Grand Scholar");
        }

        const updated = await storage.getUserAchievements(userId);
        res.json({ awarded, total: updated.length, userAchievements: updated });
      } catch (err) {
        console.error("Achievement check error:", err);
        res.status(500).json({ message: "Error checking achievements" });
      }
    });

    // Salah Progress
    app.get("/api/salah-progress", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const progress = await storage.getSalahProgress(userId);
      res.json(progress);
    });

    app.post("/api/salah-progress", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const { stepId, completed } = req.body;
      if (!stepId) return res.status(400).json({ message: "stepId required" });
      const entry = await storage.updateSalahProgress(userId, stepId, !!completed);
      res.json(entry);
    });

    // Leaderboard
    app.get("/api/leaderboard", async (req, res) => {
      try {
        const { authStorage } = await import("./replit_integrations/auth/storage");
        const allUsers = await authStorage.getUsers();
        const allStats = await storage.getAllDailyStats();

        const rankedData = allUsers.map(u => {
          const userStats = allStats.find(s => s.userId === u.id);
          const points = (userStats?.quizScore || 0) + (userStats?.hifzProgress || 0) * 10;
          const firstName = u.firstName || "Student";
          return {
            id: u.id,
            name: `${firstName} ${u.lastName || ""}`.trim(),
            points,
            avatar: firstName.charAt(0) + (u.lastName ? u.lastName.charAt(0) : ""),
            rank: 0
          };
        }).sort((a, b) => b.points - a.points);

        const finalized = rankedData.map((d, i) => ({ ...d, rank: i + 1 }));
        res.json(finalized);
      } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ message: "Error fetching leaderboard" });
      }
    });

    // Admin User Management
    app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);

      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden: Admins and Teachers only" });
      }

      let allUsers = await authStorage.getUsers();

      if (currentUser?.role?.toLowerCase() === "teacher") {
        // Find students in groups assigned to this teacher
        const teacherGroups = await storage.getUserGroups(userId, 'teacher');
        const studentIds = new Set<string>();

        for (const group of teacherGroups) {
          const studentsInGroup = await storage.getGroupStudents(group.id);
          studentsInGroup.forEach(s => studentIds.add(s.id));
        }

        // Also include parents of those students
        // (Assuming parents might need to be viewed in progress reports)
        // For now, let's keep it to students as requested
        allUsers = allUsers.filter(u => studentIds.has(u.id) || u.role?.toLowerCase() !== 'student');
        // Actually, if a teacher is looking at all users, they should see all staff + THEIR students.
        // But for ProgressReports, it mostly filters for 'student' role anyway.
        // Let's just filter the students part.
        allUsers = allUsers.filter(u => {
          if (u.role?.toLowerCase() === 'student') return studentIds.has(u.id);
          return true; // Teachers can see other staff (Admins/Teachers)
        });
      }

      res.json(allUsers);
    });

    app.post("/api/admin/users", isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const currentUser = await authStorage.getUser(userId);

        if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

        // EXCLUSIVE: Only the developer email can manage users
        if (currentUser.email?.toLowerCase() !== "fehmidatajhujra@gmail.com") {
          return res.status(403).json({ message: "Forbidden: Only Super Admin (fehmidatajhujra@gmail.com) can manage users." });
        }

        const { id, email, firstName, lastName, role, username, studentId, password } = req.body;
        const targetRole = role?.toLowerCase() || "student";

        if (!username && !studentId && !email) {
          return res.status(400).json({ message: "Username, Student ID or Email is required" });
        }

        // Check for existing user by username/studentId/email
        const allUsers = await authStorage.getUsers();

        if (username) {
          const existing = allUsers.find(u => u.username === username && u.id !== id);
          if (existing) return res.status(400).json({ message: `Username '${username}' is already taken by ${existing.firstName} ${existing.lastName}` });
        }

        if (studentId) {
          const existing = allUsers.find(u => u.studentId === studentId && u.id !== id);
          if (existing) return res.status(400).json({ message: `ID '${studentId}' is already assigned to ${existing.firstName} ${existing.lastName}` });
        }

        if (email) {
          const existing = allUsers.find(u => u.email === email && u.id !== id);
          if (existing) return res.status(400).json({ message: `Email '${email}' is already registered to ${existing.firstName} ${existing.lastName}` });
        }

        const userData = {
          id: id || "gen_" + Math.random().toString(36).substring(7),
          email,
          firstName,
          lastName,
          role: targetRole,
          username,
          studentId,
          password
        };

        const newUser = await authStorage.upsertUser(userData);
        res.json(newUser);
      } catch (err: any) {
        console.error("[USER_MGMT] Error in POST /api/admin/users:", err);
        res.status(500).json({ message: err.message || "Failed to create/update user" });
      }
    });

    app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);

      if (currentUser?.email?.toLowerCase() !== "fehmidatajhujra@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Only Super Admin (fehmidatajhujra@gmail.com) can delete users." });
      }

      const targetId = req.params.id;
      if (targetId === userId) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }

      await authStorage.deleteUser(targetId);
      res.json({ success: true });
    });

    // Fees
    app.get(api.fees.list.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const allFees = await storage.getFees();
      res.json(allFees);
    });

    app.get(api.fees.getByUser.path, isAuthenticated, async (req: any, res) => {
      const { userId } = req.params;
      const requesterId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(requesterId);

      if (currentUser?.role?.toLowerCase() !== "admin" && requesterId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userFees = await storage.getFeesByUser(userId);
      res.json(userFees);
    });

    app.post(api.fees.create.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      console.log(`[FEE_MGMT] POST from ${userId}, role: ${currentUser?.role}`);

      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden: Admins and Teachers only" });
      }

      try {
        console.log(`[FEE_MGMT] Creating fee:`, req.body);
        const input = api.fees.create.input.parse(req.body);
        const fee = await storage.createFee(input);
        console.log(`[FEE_MGMT] Fee created: ${fee.id}`);
        res.status(201).json(fee);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          console.error("[FEE_MGMT] Validation error:", err.errors);
          return res.status(400).json({ message: err.errors[0].message });
        }
        console.error("[FEE_MGMT] Error in createFee:", err);
        res.status(500).json({ message: err.message || "Server error" });
      }
    });

    app.patch(api.fees.update.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      console.log(`[FEE_MGMT] PATCH from ${userId}, role: ${currentUser?.role}`);

      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden: Admins and Teachers only" });
      }

      try {
        const id = Number(req.params.id);
        const input = api.fees.update.input.parse(req.body);
        const fee = await storage.updateFee(id, input);
        res.json(fee);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        console.error("[FEE_MGMT] Error in updateFee:", err);
        res.status(500).json({ message: err.message || "Server error" });
      }
    });

    // Flashcards
    app.get("/api/flashcards", async (req, res) => {
      const flashcards = await storage.getFlashcards();
      res.json(flashcards);
    });

    app.post("/api/flashcards", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const input = insertFlashcardSchema.parse(req.body);
        const flashcard = await storage.createFlashcard(input);
        res.status(201).json(flashcard);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/flashcards/:id", isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user?.claims?.sub || req.user?.id;
        const currentUser = await authStorage.getUser(userId);

        // Final role check: either from DB or from session (fallback for local mocks)
        const role = (currentUser?.role || req.user?.role || req.user?.claims?.role)?.toLowerCase();

        if (role !== "admin" && role !== "teacher") {
          return res.status(403).json({ message: "Forbidden" });
        }

        const id = Number(req.params.id);
        await storage.deleteFlashcard(id);
        res.json({ success: true });
      } catch (err) {
        console.error("Delete flashcard error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Course Tests
    app.get(api.courseTests.list.path, isAuthenticated, async (req: any, res) => {
      const { courseId } = req.params;
      const tests = await storage.getCourseTests(courseId);
      res.json(tests);
    });

    app.post(api.courseTests.create.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const { courseId } = req.params;
        console.log(`[COURSE_TESTS] Creating test for course: ${courseId}`, req.body);

        const inputObject = {
          ...req.body,
          courseId,
          uploadedBy: currentUser?.firstName || "Teacher"
        };

        console.log(`[COURSE_TESTS] Input object to parse:`, JSON.stringify(inputObject, null, 2));

        const input = insertCourseTestSchema.parse(inputObject);
        const test = await storage.createCourseTest(input);
        res.status(201).json(test);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("[COURSE_TESTS] Zod Validation Error:", JSON.stringify(err.errors, null, 2));
          return res.status(400).json({ message: err.errors[0].message, details: err.errors });
        }
        console.error("[COURSE_TESTS] General Error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.patch(api.courseTests.update.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const id = Number(req.params.id);
        const input = insertCourseTestSchema.partial().parse(req.body);
        const test = await storage.updateCourseTest(id, input);
        res.json(test);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete(api.courseTests.delete.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const id = Number(req.params.id);
        console.log(`[DEBUG] Attempting to delete course test with ID: ${id} by user: ${userId}`);
        await storage.deleteCourseTest(id);
        console.log(`[DEBUG] Successfully deleted course test with ID: ${id}`);
        res.json({ success: true });
      } catch (err: any) {
        console.error(`[DEBUG] Error deleting course test ${req.params.id}:`, err);
        res.status(500).json({ message: "Server error: " + (err.message || "Unknown error") });
      }
    });

    app.get(api.courseTests.results.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const results = await storage.getCourseTestResults(userId);
      res.json(results);
    });

    app.get("/api/admin/reports/:userId/test-results", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const targetUserId = req.params.userId;
      const results = await storage.getCourseTestResults(targetUserId);
      res.json(results);
    });

    app.post(api.courseTests.submit.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
        const input = insertCourseTestResultSchema.parse({ ...req.body, userId });
        const result = await storage.submitCourseTestResult(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/course-tests/:id/all-results", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (user?.role?.toLowerCase() !== "admin" && user?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const testId = Number(req.params.id);
        const results = await storage.getAllCourseTestResults(testId);
        res.json(results);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.patch("/api/course-tests/results/:id/grade", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (user?.role?.toLowerCase() !== "admin" && user?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const id = Number(req.params.id);
        const { score, total, feedback } = req.body;
        const result = await storage.updateCourseTestResult(id, score, total, feedback, userId);
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/course-tests/:testId/all-results", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const currentUser = await authStorage.getUser(userId);
      if (currentUser?.role?.toLowerCase() !== "admin" && currentUser?.role?.toLowerCase() !== "teacher") {
        return res.status(403).json({ message: "Forbidden" });
      }

      try {
        const testId = Number(req.params.testId);
        const results = await storage.getAllCourseTestResults(testId);
        res.json(results);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // --- Group Management Routes ---

    // Groups CRUD
    app.get("/api/groups", isAuthenticated, async (req: any, res) => {
      const { search, status, category, offset, limit } = req.query;
      const results = await storage.getGroups({
        search: search as string,
        status: status as string,
        category: category as string,
        offset: offset ? parseInt(offset as string) : 0,
        limit: limit ? parseInt(limit as string) : 50
      });
      res.json(results);
    });

    app.get("/api/groups/my", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      const userGroups = await storage.getUserGroups(userId, user?.role || 'student');
      res.json(userGroups);
    });

    app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
      const groupId = req.params.id as string;
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);

      const group = await storage.getGroup(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      // Admins and teachers can see any group; students/parents only see their own
      if (user?.role?.toLowerCase() !== "admin" && user?.role?.toLowerCase() !== "teacher") {
        const myGroups = await storage.getUserGroups(userId, user?.role || 'student');
        if (!myGroups.some(g => g.id === groupId)) {
          return res.status(403).json({ message: "Access denied to this group" });
        }
      }

      res.json(group);
    });

    app.post("/api/groups", isAuthenticated, isTeacherOrAdmin, async (req: any, res) => {
      try {
        log(`Creating group with data: ${JSON.stringify(req.body)}`, "GROUPS");
        const { name, description, category, capacity, status } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ message: "Group name is required" });
        }

        const groupData = {
          name: name.trim(),
          description: description ? description.trim() : null,
          category: category || "General",
          capacity: capacity ? parseInt(capacity) : null,
          status: status || "active",
        };

        log(`Prepared group data for storage: ${JSON.stringify(groupData)}`, "GROUPS");
        const group = await storage.createGroup(groupData as any);

        if (!group) {
          throw new Error("Storage returned null after group creation");
        }

        log(`Group created successfully. ID: ${group.id}`, "GROUPS");

        // Audit log (wrapped in try-catch to be safe)
        try {
          await storage.createAuditLog({
            adminId: req.user?.claims?.sub || "unknown",
            action: 'create_group',
            targetType: 'group',
            targetId: group.id,
            details: { name: group.name }
          });
          log("Audit log created for group creation", "GROUPS");
        } catch (auditErr) {
          console.error("[CREATE_GROUP] Audit log failed (non-critical):", auditErr);
        }

        res.status(201).json(group);
      } catch (err: any) {
        console.error("[CREATE_GROUP] Error:", err);
        res.status(500).json({ message: err.message || "Server error creating group" });
      }
    });

    app.patch("/api/groups/:id", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      try {
        const id = req.params.id as string;
        const input = insertGroupSchema.partial().parse(req.body);
        const group = await storage.updateGroup(id, input);

        // Audit log
        await storage.createAuditLog({
          adminId: (req as any).user.claims.sub,
          action: 'update_group',
          targetType: 'group',
          targetId: id,
          details: input
        });

        res.json(group);
      } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/groups/:id", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const id = req.params.id as string;
      await storage.deleteGroup(id);

      // Audit log
      await storage.createAuditLog({
        adminId: (req as any).user.claims.sub,
        action: 'delete_group',
        targetType: 'group',
        targetId: id
      });

      res.json({ success: true });
    });

    app.post("/api/groups/bulk", isAuthenticated, isTeacherOrAdmin, async (req: any, res) => {
      try {
        const { groups: groupList } = req.body;
        if (!Array.isArray(groupList)) return res.status(400).json({ message: "groups must be an array" });

        const createdGroups = [];
        for (const g of groupList) {
          if (!g.name?.trim()) continue;
          const group = await storage.createGroup({
            name: g.name.trim(),
            category: g.category || "General",
            capacity: g.capacity ? parseInt(g.capacity) : null,
            status: g.status || "active",
          } as any);
          createdGroups.push(group);
        }

        await storage.createAuditLog({
          adminId: req.user.claims.sub,
          action: 'bulk_create_groups',
          targetType: 'group',
          targetId: 'multiple',
          details: { count: createdGroups.length }
        });

        res.status(201).json(createdGroups);
      } catch (err: any) {
        console.error("[BULK_CREATE_GROUPS] Error:", err);
        res.status(500).json({ message: err.message || "Server error" });
      }
    });

    app.post("/api/groups/:id/import-students", isAuthenticated, isTeacherOrAdmin, async (req: any, res) => {
      try {
        const groupId = req.params.id as string;
        const { students } = req.body; // Expecting array of {email, firstName, lastName}
        if (!Array.isArray(students)) return res.status(400).json({ message: "students must be an array" });

        const importedCount = 0;
        const { authStorage } = await import("./replit_integrations/auth/storage");

        for (const s of students) {
          // Find or create user
          let user = (await authStorage.getUsers()).find(u => u.email === s.email);
          if (!user) {
            user = await authStorage.upsertUser({
              id: "gen_" + Math.random().toString(36).substring(7),
              email: s.email,
              firstName: s.firstName || s.email.split('@')[0],
              lastName: s.lastName || "",
              role: "student",
              username: s.username || s.email.split('@')[0],
              password: s.password || "password123" // Default password if not provided
            });
          }
          await storage.addStudentToGroup(groupId, user.id);
        }

        res.json({ success: true, count: students.length });
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Group Members
    app.get("/api/groups/:id/teachers", isAuthenticated, isAdmin, async (req, res) => {
      const teachers = await storage.getGroupTeachers(req.params.id as string);
      res.json(teachers);
    });

    app.post("/api/groups/:id/teachers", isAuthenticated, isAdmin, async (req, res) => {
      const { userId } = req.body;
      const groupId = req.params.id as string;
      await storage.assignTeacherToGroup(groupId, userId);
      res.json({ success: true });
    });

    app.delete("/api/groups/:id/teachers/:userId", isAuthenticated, isAdmin, async (req, res) => {
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      await storage.removeTeacherFromGroup(id, userId);
      res.json({ success: true });
    });

    app.get("/api/groups/:id/students", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const students = await storage.getGroupStudents(req.params.id as string);
      res.json(students);
    });

    app.post("/api/groups/:id/students", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const { userId } = req.body;
      const groupId = req.params.id as string;
      await storage.addStudentToGroup(groupId, userId);
      res.json({ success: true });
    });

    app.delete("/api/groups/:id/students/:userId", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const id = req.params.id as string;
      const userId = req.params.userId as string;
      await storage.removeStudentFromGroup(id, userId);
      res.json({ success: true });
    });

    app.post("/api/groups/transfer", isAuthenticated, isAdmin, async (req, res) => {
      const { userId, fromGroupId, toGroupId } = req.body;
      await storage.transferStudent(userId, fromGroupId, toGroupId);

      // Audit log
      await storage.createAuditLog({
        adminId: (req as any).user.claims.sub,
        action: 'transfer_student',
        targetType: 'user',
        targetId: userId,
        details: { fromGroupId, toGroupId }
      });

      res.json({ success: true });
    });

    // Group Content
    app.get("/api/groups/:id/announcements", isAuthenticated, async (req: any, res) => {
      const groupId = req.params.id;
      const ann = await storage.getGroupAnnouncements(groupId);
      res.json(ann);
    });

    app.get("/api/announcements/category/:category", isAuthenticated, async (req: any, res) => {
      try {
        const { category } = req.params;
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        const userGroups = await storage.getUserGroups(userId, user?.role || 'student');

        const groupIds = userGroups
          .filter(g => g.category?.toLowerCase() === category.toLowerCase())
          .map(g => g.id);

        const announcements = await storage.getCategoryAnnouncements(groupIds);
        res.json(announcements);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/groups/:id/announcements", isAuthenticated, async (req: any, res) => {
      try {
        const groupId = req.params.id;
        const authorId = req.user.claims.sub;
        const user = await authStorage.getUser(authorId);
        const group = await storage.getGroup(groupId);

        const isAdmin = user?.role?.toLowerCase() === "admin";
        const isTeacher = user?.role?.toLowerCase() === "teacher";

        // Admins and teachers can post anywhere. Students only in their own groups.
        if (!isAdmin && !isTeacher) {
          const myGroups = await storage.getUserGroups(authorId, user?.role || 'student');
          if (!myGroups.some(g => g.id === groupId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
          }
          // Block students when group is locked
          if ((group as any)?.isLocked) {
            return res.status(403).json({ message: "This group is locked. Only the teacher can post." });
          }
        }

        const { content, fileUrl, fileType, replyToId, replyToContent, replyToAuthor } = req.body;
        const ann = await storage.createGroupAnnouncement({
          groupId,
          authorId,
          content: content || (fileType === 'voice' ? 'Voice Message' : ''),
          fileUrl: fileUrl || null,
          fileType: fileType || 'text',
          replyToId: replyToId || null,
          replyToContent: replyToContent || null,
          replyToAuthor: replyToAuthor || null,
        });
        res.status(201).json(ann);
      } catch (err) {
        console.error("[POST_ANNOUNCEMENT] Error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.delete("/api/announcements/:id", isAuthenticated, async (req: any, res) => {
      try {
        const id = parseInt(req.params.id);
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);

        const ann = await storage.getGroupAnnouncement(id);
        if (!ann) return res.status(404).json({ message: "Announcement not found" });

        const isAdmin = user?.role?.toLowerCase() === "admin";
        const isTeacher = user?.role?.toLowerCase() === "teacher";
        const isAuthor = ann.authorId === userId;

        if (!isAdmin && !isTeacher && !isAuthor) {
          return res.status(403).json({ message: "You don't have permission to delete this message" });
        }

        await storage.deleteGroupAnnouncement(id);

        // Audit log
        await storage.createAuditLog({
          adminId: userId,
          action: 'delete_announcement',
          targetType: 'announcement',
          targetId: id.toString(),
          details: { contentPreview: ann.content?.substring(0, 50) }
        });

        res.json({ success: true });
      } catch (err) {
        console.error("[DELETE_ANNOUNCEMENT] Error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Lock / unlock a group (teacher or admin only)
    app.patch("/api/groups/:id/lock", isAuthenticated, async (req: any, res) => {
      try {
        const { id } = req.params;
        const { locked } = req.body;
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        if (user?.role?.toLowerCase() !== 'admin' && user?.role?.toLowerCase() !== 'teacher') {
          return res.status(403).json({ message: "Only teachers and admins can lock groups" });
        }
        const group = await storage.lockGroup(id, !!locked);
        res.json(group);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/groups/:id/assignments", isAuthenticated, async (req: any, res) => {
      const groupId = req.params.id;
      const assignments = await storage.getGroupAssignments(groupId);
      res.json(assignments);
    });

    app.post("/api/groups/:id/assignments", isAuthenticated, isTeacherOrAdmin, async (req: any, res) => {
      try {
        const groupId = req.params.id;
        const authorId = req.user.claims.sub;
        const input = insertGroupAssignmentSchema.parse({ ...req.body, groupId, authorId });
        const assignment = await storage.createGroupAssignment(input);
        res.status(201).json(assignment);
      } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
        res.status(500).json({ message: "Server error" });
      }
    });

    // Attendance & Performance
    app.get("/api/groups/:id/attendance", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const { date } = req.query;
      const attendance = await storage.getGroupAttendance(req.params.id as string, date ? new Date(date as string) : undefined);
      res.json(attendance);
    });

    app.post("/api/groups/:id/attendance", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      try {
        const input = insertGroupAttendanceSchema.parse(req.body);
        const attendance = await storage.recordAttendance(input);
        res.status(201).json(attendance);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("[attendance] Zod validation error:", JSON.stringify(err.errors, null, 2));
          return res.status(400).json({ message: err.errors[0].message, details: err.errors });
        }
        console.error("[attendance] Server error:", err);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/attendance/me", isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const attendance = await storage.getUserAttendance(userId);
      res.json(attendance);
    });

    app.get("/api/groups/:id/performance", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      const { userId } = req.query;
      const perf = await storage.getGroupPerformance(req.params.id as string, userId as string);
      res.json(perf);
    });

    app.post("/api/groups/:id/performance", isAuthenticated, isTeacherOrAdmin, async (req, res) => {
      try {
        const input = insertGroupPerformanceSchema.parse(req.body);
        const perf = await storage.recordPerformance(input);
        res.status(201).json(perf);
      } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
        res.status(500).json({ message: "Server error" });
      }
    });

    // Analytics
    app.get("/api/analytics/system", isAuthenticated, isAdmin, async (req, res) => {
      const stats = await storage.getSystemAnalytics();
      res.json(stats);
    });

    app.get("/api/analytics/groups/:id", isAuthenticated, isAdmin, async (req, res) => {
      const stats = await storage.getGroupAnalytics(req.params.id as string);
      res.json(stats);
    });

    // Alias: /api/groups/:id/analytics (used by frontend hook)
    app.get("/api/groups/:id/analytics", isAuthenticated, async (req: any, res) => {
      try {
        const groupId = req.params.id;
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);

        // Non-admins can only view their own group's analytics
        if (user?.role?.toLowerCase() !== "admin") {
          const myGroups = await storage.getUserGroups(userId, user?.role || "student");
          if (!myGroups.some(g => g.id === groupId)) {
            return res.status(403).json({ message: "Access denied" });
          }
        }

        const stats = await storage.getGroupAnalytics(groupId);
        res.json(stats);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Audit Logs
    app.get("/api/admin/audit-logs", isAuthenticated, isAdmin, async (req, res) => {
      const { adminId, offset, limit } = req.query;
      const results = await storage.getAuditLogs({
        adminId: adminId as string,
        offset: offset ? parseInt(offset as string) : 0,
        limit: limit ? parseInt(limit as string) : 50
      });
      res.json(results);
    });

    // Wisdom
    app.get("/api/wisdom/daily", async (_req, res) => {
      try {
        const result = await storage.getDailyWisdom();
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/api/wisdom", isAuthenticated, async (_req, res) => {
      try {
        const result = await storage.getWisdom();
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/api/wisdom", isAuthenticated, isTeacherOrAdmin, async (req: any, res) => {
      try {
        const authorId = req.user.claims.sub;
        const input = insertWisdomSchema.parse({ ...req.body, addedBy: authorId });
        const result = await storage.createWisdom(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
        }
        res.status(500).json({ message: "Server error" });
      }
    });

    // Seed Data
    await seedDatabase();

    // API Catch-all 404 (ensure JSON response for missing API routes)
    app.all(/^\/api\/.*/, (req, res) => {
      res.status(404).json({ message: `API Route ${req.method} ${req.url} not found` });
    });

    return httpServer;
  } catch (err) {
    console.error("CRITICAL ERROR during registerRoutes:", err);
    throw err;
  }
}

async function seedDatabase() {
  console.log("[DEBUG] Starting database seeding...");
  const booksToSeed = [
    // --- Tajweed & Basics ---
    {
      title: "Tmhedi Qaida (تمہیدی قاعدہ)",
      className: "Beginner",
      category: "Tajweed",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://www.dawateislami.net/bookslibrary/200",
      summary: "A fundamental guide for beginners to learn Quranic phonetics and basic Tajweed rules with Urdu instructions.",
      language: "English"
    },
    {
      title: "Qurani Qaida (Madani Qaida)",
      className: "Beginner",
      category: "Tajweed",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://www.dawateislami.net/bookslibrary/madani-qaida",
      summary: "The extremely popular 'Madani' method for learning Arabic script and Quranic reading foundations.",
      language: "English"
    },
    {
      title: "Al-Qoul al-Sadeed (Tajweed)",
      className: "Intermediate",
      category: "Tajweed",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/AlQaulusSadidUrdu",
      summary: "A detailed scholarly work on the rules of Tajweed, providing deep insights into pronunciation and articulation.",
      language: "English"
    },
    {
      title: "Qari Qaida",
      className: "Beginner",
      category: "Tajweed",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/bachon-ke-liye-qari-qaida-quliyat-e-quran-kareem-wa-tarbiat-islamiya-idara-islah-trust-pakistan",
      summary: "A classic primer for Quranic phonetics, widely used in Madrasas for foundational learning.",
      language: "English"
    },
    {
      title: "Nurani Qaidah",
      className: "Beginner",
      category: "Tajweed",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/noorani-qaida-download",
      summary: "The widely used 'Nurani' method for learning Arabic script and Quranic reading foundations.",
      language: "English"
    },

    // --- Hadith ---
    {
      title: "Sahih al-Bukhari",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/TheTranslationOfTheMeaningsOfSahihAl-Bukhari-Arabic-English9Volumes",
      summary: "The most authentic collection of Hadith, covering Faith, Prayer, Transactions, and Character.",
      language: "English"
    },
    {
      title: "Sahih Muslim",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/SahihMuslim_425",
      summary: "Imam Muslim's rigorous collection of authentic Hadith, organized by detailed legal and spiritual topics.",
      language: "English"
    },
    {
      title: "Riyad us Saliheen",
      className: "Intermediate",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://sunnah.com/riyadussaliheen",
      summary: "A world-famous compilation of Hadith by Imam an-Nawawi, focusing on practical Islamic ethics and manners.",
      language: "English"
    },
    {
      title: "Sunan Abi Dawud",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://sunnah.com/abudawud",
      summary: "One of the six major Hadith collections, specifically focusing on legal traditions (Hadith al-Ahkam).",
      language: "English"
    },
    {
      title: "Mishkat al-Masabih",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://sunnah.com/mishkat",
      summary: "A famous expansion of 'Masabih al-Sunnah', categorizing Hadith from Bukhari, Muslim, and the Sunan.",
      language: "English"
    },

    // --- Quran & Tafsir ---
    {
      title: "Tafsir al-Jalalayn",
      className: "Intermediate",
      category: "Tafsir",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/AlJalalainEng",
      summary: "A concise and classic Tafsir by the two Jalals, focusing on the literal meaning of Quranic verses.",
      language: "English"
    },
    {
      title: "Tafsir Ibn Kathir",
      className: "Advanced",
      category: "Tafsir",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/TafsirIbnKathirVolume0110English_201702",
      summary: "One of the most comprehensive Tafsirs, explaining the Quran through other verses and Hadith.",
      language: "English"
    },
    {
      title: "Tafsir al-Qurtubi",
      className: "Advanced",
      category: "Tafsir",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/tafsir-al-qurtubi-4.-Volumes",
      summary: "A massive exegesis focusing on the legal rulings (Ahkam) derived from the Quranic text.",
      language: "English"
    },
    {
      title: "Tafsir al-Sa'di",
      className: "Intermediate",
      category: "Tafsir",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/tafseer-as-sadi-10-volumes",
      summary: "A modern, clear, and easy-to-understand Tafsir focusing on the spiritual message and guidance of the Quran.",
      language: "English"
    },

    // --- Fiqh ---
    {
      title: "Al-Muwatta (Maliki)",
      className: "Intermediate",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://sunnah.com/muwatta",
      summary: "Imam Malik's pioneering work combining Hadith and the legal practice of the people of Madinah.",
      language: "English"
    },
    {
      title: "Ar-Risalah (Maliki)",
      className: "Intermediate",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/TheRisala",
      summary: "A foundational text on Maliki creed and jurisprudence by Ibn Abi Zayd al-Qayrawani.",
      language: "English"
    },
    {
      title: "Al-Hidayah (Hanafi)",
      className: "Advanced",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/AlHidayahTheGuidance",
      summary: "The pinnacle of Hanafi jurisprudence, detailing legal logic and diverse opinions within the school.",
      language: "English"
    },
    {
      title: "Mukhtasar al-Quduri (Hanafi)",
      className: "Intermediate",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/MukhtasarAlQuduri_201708",
      summary: "An essential manual of Hanafi Fiqh for students, covering family law, trade, and worship.",
      language: "English"
    },
    {
      title: "Minhaj at-Talibin (Shafi'i)",
      className: "Advanced",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/MinhajEtTalibin",
      summary: "Imam an-Nawawi's masterpiece in Shafi'i Fiqh, serving as a primary reference for scholars.",
      language: "English"
    },
    {
      title: "Matn Abi Shuja (Shafi'i)",
      className: "Beginner",
      category: "Fiqh",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/TheUltimateConspectusMatnAlGhayatWaAlTaqrib",
      summary: "A core introductory text for Shafi'i Fiqh, summarizing all major legal rulings.",
      language: "English"
    },
    {
      title: "Zad al-Mustaqni (Hanbali)",
      className: "Advanced",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/IntroToZaadAlMustaqni",
      summary: "A concise summary of legal rulings in the Hanbali school.",
      language: "English"
    },

    // --- Aqeedah, History, Seerah ---
    {
      title: "Al-Aqeedah Al-Wasitiyyah",
      className: "Intermediate",
      category: "Aqeedah",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/Al-aqidahAl-wasitiyyah",
      summary: "A statement of Islamic creed by Ibn Taymiyyah.",
      language: "English"
    },
    {
      title: "Tareekh al-Tabari",
      className: "Advanced",
      category: "History",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/TheHistoryOfAlTabariAll39Volumes",
      summary: "Chronicle of universal and Islamic history by al-Tabari.",
      language: "English"
    },
    {
      title: "Ihya Ulum al-Din",
      className: "Advanced",
      category: "Spirituality",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/Ihya_Ulum_al-Din",
      summary: "Work by Imam al-Ghazali on heart purification.",
      language: "English"
    },
    {
      title: "Ar-Raheeq Al-Makhtum",
      className: "Intermediate",
      category: "Seerah",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/The-Sealed-Nectar-Ar-Raheeq-Al-Makhtum",
      summary: "Biography of Prophet Muhammad (SAW).",
      language: "English"
    },
    {
      title: "Seerat un Nabi",
      className: "Advanced",
      category: "Seerah",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/SeeratUnNabisallallahuAlaihiWasallamByShaykhShibliNomanir.a",
      summary: "Urdu biography of the Prophet (SAW) by Shibli Nomani.",
      language: "English"
    },

    // --- Arabic Language ---
    {
      title: "Al-Ajurrumiyya",
      className: "Beginner",
      category: "Arabic",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/al_ajurrumiyyah",
      summary: "Primary text on Arabic grammar.",
      language: "English"
    },
    {
      title: "Madinah Arabic (Book 1)",
      className: "Beginner",
      category: "Arabic",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/MadinahArabicReaderBook1",
      summary: "Madinah University Arabic course.",
      language: "English"
    },

    // --- Urdu Books ---
    {
      title: "Sahih Bukhari (Urdu)",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/SahihBukhariTarjumaSharah",
      summary: "مکمل صحیح بخاری اردو ترجمہ و تشریح کے ساتھ۔",
      language: "Urdu"
    },
    {
      title: "Sahih Muslim (Urdu)",
      className: "Advanced",
      category: "Hadith",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/Sahih-Muslim-Urdu",
      summary: "صحیح مسلم شریف کا مکمل اردو ترجمہ۔",
      language: "Urdu"
    },
    {
      title: "Tafseer Ibn Kathir (Urdu)",
      className: "Advanced",
      category: "Tafsir",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/tafseeribnekaseercompleteurdu",
      summary: "تفسیر ابن کثیر کا مکمل اردو ورژن۔",
      language: "Urdu"
    },
    {
      title: "Bahar-e-Shariat (Urdu)",
      className: "Intermediate",
      category: "Fiqh",
      program: "Darse Nizami",
      coverUrl: "https://images.unsplash.com/photo-1597933531249-1756bb3d5ce2?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/faizaneshariyyatsharahbahareshariyyat4",
      summary: "فقہ حنفی کا جامع انسائیکلوپیڈیا۔",
      language: "Urdu"
    },
    {
      title: "Qasas ul Anbiya (Urdu)",
      className: "Intermediate",
      category: "History",
      program: "General",
      coverUrl: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?auto=format&fit=crop&q=80&w=400",
      pdfUrl: "https://archive.org/details/QasasUlAnbiya0",
      summary: "انبیاء کرام کے ایمان افروز واقعات۔",
      language: "Urdu"
    },
  ];

  const existingBooks = await storage.getBooks();

  for (const book of booksToSeed) {
    const existing = existingBooks.find(b => b.title === book.title);
    if (!existing) {
      await storage.createBook(book as any);
    } else {
      const updates: any = {};
      if (existing.program !== book.program) updates.program = book.program;
      if (existing.pdfUrl !== book.pdfUrl) updates.pdfUrl = book.pdfUrl;
      if (existing.coverUrl !== book.coverUrl) updates.coverUrl = book.coverUrl;
      if ((existing as any).language !== (book as any).language) updates.language = (book as any).language;

      if (Object.keys(updates).length > 0) {
        await storage.updateBook(existing.id, updates);
      }
    }
  }

  const existingResources = await storage.getResources();
  if (existingResources.length === 0) {
    // --- Urdu Books ---
    await storage.createResource({ title: { en: "Seerat un Nabi (Urdu)", ur: "سیرت النبی (ص)" }, type: "urdu_book", category: { en: "Seerah", ur: "سیرت" }, imageUrl: "https://images.unsplash.com/photo-1585036156171-3839efc229b7?w=800&q=60", content: { en: "Urdu biography of the Prophet (SAW).", ur: "سیرت طیبہ کے تمام گوشوں کا احاطہ کرنے والی کتاب۔" }, url: "https://archive.org/details/SeeratUnNabisallallahuAlaihiWasallamByShaykhShibliNomanir.a" });
    await storage.createResource({ title: { en: "Hayat-us-Sahaba", ur: "حیات الصحابہ" }, type: "urdu_book", category: { en: "History", ur: "تعارف صحابہ" }, imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=60", content: { en: "Stories of the Sahaba.", ur: "صحابہ کرام کی زندگیوں پر مشتمل کتاب۔" }, url: "https://archive.org/details/HyatusSahabahByKandhlawiUrduLahore" });

    // --- Islamic Stories (10 stories) ---
    await storage.createResource({ title: { en: "Prophet Ibrahim (AS) and the Fire", ur: "حضرت ابراہیم (ع) اور آگ" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=60", content: { en: "Prophet Ibrahim (AS) was a young man who believed in one God while his people worshipped idols. When he broke their idols to prove they were powerless, his people decided to punish him by throwing him into a great fire. But Allah commanded the fire: 'O fire, be coolness and safety for Ibrahim!' The fire did not harm him at all. This miracle showed that Allah protects His faithful servants. Ibrahim (AS) went on to become one of the greatest prophets and built the Ka'bah in Makkah with his son Ismail (AS). His story teaches us unwavering faith in Allah, even when the whole world stands against us.", ur: "حضرت ابراہیم علیہ السلام ایک نوجوان تھے جو ایک اللہ پر ایمان رکھتے تھے جبکہ ان کی قوم بتوں کی پوجا کرتی تھی۔ جب انہوں نے بت توڑ دیے تو قوم نے سزا دینے کے لیے انہیں آگ میں پھینکا۔ لیکن اللہ نے آگ کو حکم دیا: اے آگ! ابراہیم پر ٹھنڈی اور سلامتی والی ہو جا! آگ نے انہیں کوئی نقصان نہ پہنچایا۔ یہ معجزہ اللہ کی حفاظت کا ثبوت تھا۔" } });
    await storage.createResource({ title: { en: "Prophet Yusuf (AS) - The Beautiful Story", ur: "حضرت یوسف (ع) - حسین ترین قصہ" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1590076214667-c0f3c7e932b0?w=800&q=60", content: { en: "Prophet Yusuf (AS) was blessed with extraordinary beauty and the ability to interpret dreams. His jealous brothers threw him into a well, but Allah saved him. He was taken to Egypt where he was sold as a slave, yet he remained steadfast in his faith. After being falsely accused and imprisoned, his dream interpretation skills brought him to the attention of the King. He became the Minister of Egypt and eventually reunited with his family. Yusuf (AS) forgave his brothers, saying: 'No blame upon you today. Allah will forgive you.' His story, called 'Ahsan al-Qasas' (the most beautiful story), teaches patience, forgiveness, and trust in Allah's plan.", ur: "حضرت یوسف علیہ السلام کو غیر معمولی حسن اور خوابوں کی تعبیر کی صلاحیت عطا ہوئی۔ حسد کرنے والے بھائیوں نے انہیں کنویں میں پھینک دیا مگر اللہ نے بچایا۔ مصر میں غلام کے طور پر بکے، جھوٹے الزام لگے، قید ہوئے مگر ایمان پر قائم رہے۔ خوابوں کی تعبیر سے بادشاہ نے انہیں وزیر بنایا۔ بالآخر خاندان سے ملے اور بھائیوں کو معاف کیا۔ یہ احسن القصص کہلاتا ہے۔" } });
    await storage.createResource({ title: { en: "Prophet Musa (AS) and Pharaoh", ur: "حضرت موسٰی (ع) اور فرعون" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1584286595398-a59f21d31367?w=800&q=60", content: { en: "Prophet Musa (AS) was raised in the palace of Pharaoh, the tyrant king of Egypt who claimed to be god. Allah chose Musa to confront Pharaoh and free the Children of Israel from slavery. Armed with miraculous signs — his staff turning into a serpent and his hand glowing with divine light — Musa challenged Pharaoh. Despite facing sorcerers and threats, Musa stood firm. When Pharaoh chased the Israelites to the Red Sea, Allah parted the sea, allowing Musa and his people to cross safely while Pharaoh and his army drowned. This story teaches that truth always prevails over tyranny.", ur: "حضرت موسٰی علیہ السلام فرعون کے محل میں پلے بڑھے۔ اللہ نے انہیں فرعون کا مقابلہ کرنے اور بنی اسرائیل کو آزاد کرانے کے لیے چنا۔ عصا کا سانپ بننا اور ہاتھ کا چمکنا ان کے معجزات تھے۔ فرعون نے پیچھا کیا تو اللہ نے سمندر چیر دیا۔ موسٰی اور ان کی قوم محفوظ گزر گئی اور فرعون ڈوب گیا۔" } });
    await storage.createResource({ title: { en: "Prophet Nuh (AS) and the Great Flood", ur: "حضرت نوح (ع) اور طوفان" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&q=60", content: { en: "Prophet Nuh (AS) spent 950 years calling his people to worship Allah alone, but very few believed. Allah commanded him to build a great ark. When the flood came, Nuh took believers and pairs of animals onto the ship. The waters rose above the mountains. Even Nuh's own son refused to board and perished. After the flood receded, the ark rested on Mount Judi and life began anew. This story teaches perseverance in calling to truth and that Allah's mercy is for those who believe.", ur: "حضرت نوح علیہ السلام نے ساڑھے نو سو سال تک اپنی قوم کو اللہ کی عبادت کی دعوت دی مگر بہت کم لوگ ایمان لائے۔ اللہ نے کشتی بنانے کا حکم دیا۔ طوفان آیا تو ایمان والے اور جانوروں کے جوڑے کشتی میں سوار ہوئے۔ پانی پہاڑوں سے اونچا ہوا۔ طوفان تھمنے پر کشتی جودی پہاڑ پر ٹھہری۔" } });
    await storage.createResource({ title: { en: "Prophet Yunus (AS) and the Whale", ur: "حضرت یونس (ع) اور مچھلی" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1551041777-ed277b8dd948?w=800&q=60", content: { en: "Prophet Yunus (AS) was sent to the people of Nineveh. When they rejected his message, he left in anger without Allah's permission. He boarded a ship which was caught in a storm. The sailors cast lots and Yunus was thrown overboard, where a great whale swallowed him. In the belly of the whale, in complete darkness, Yunus cried out: 'La ilaha illa anta, subhanaka, inni kuntu minaz-zalimin' (There is no god but You, glory be to You, I was among the wrongdoers). Allah heard his prayer and the whale released him. He returned to his people who had now accepted faith. This teaches us to never despair and always turn to Allah in repentance.", ur: "حضرت یونس علیہ السلام نینوا کی قوم کی طرف بھیجے گئے۔ قوم نے پیغام رد کیا تو وہ ناراض ہو کر چلے گئے۔ سمندر میں طوفان آیا، قرعہ نکلا اور انہیں سمندر میں ڈالا گیا۔ مچھلی نے نگل لیا۔ اندھیرے میں انہوں نے دعا کی: لا إله إلا أنت سبحانك إني كنت من الظالمين۔ اللہ نے دعا قبول کی اور مچھلی نے انہیں باہر نکال دیا۔" } });
    await storage.createResource({ title: { en: "Prophet Sulaiman (AS) and the Queen of Sheba", ur: "حضرت سلیمان (ع) اور ملکہ سبا" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1577253313708-cab167d2c474?w=800&q=60", content: { en: "Prophet Sulaiman (AS) was given a kingdom unlike any other — he could command the wind, speak to animals, and control the jinn. When he learned that the Queen of Sheba (Bilqis) and her people worshipped the sun, he sent her a letter inviting her to Islam. Bilqis, impressed by his wisdom and power, eventually accepted the truth and submitted to Allah. Despite his immense kingdom, Sulaiman remained humble and grateful to Allah, always saying: 'This is from the favor of my Lord.' His story teaches gratitude for blessings and using power for justice.", ur: "حضرت سلیمان علیہ السلام کو بے مثال بادشاہت دی گئی — ہوا، جانوروں سے بات، اور جنات کی حکمرانی۔ جب انہیں معلوم ہوا کہ ملکہ سبا سورج کی پوجا کرتی ہے تو اسے اسلام کی دعوت دی۔ ملکہ ان کی حکمت سے متاثر ہوئی اور اللہ کے آگے جھک گئی۔ سلیمان نے ہمیشہ کہا: یہ میرے رب کے فضل سے ہے۔" } });
    await storage.createResource({ title: { en: "The Story of Ashab al-Kahf (People of the Cave)", ur: "اصحاب الکہف کا قصہ" }, type: "story", category: { en: "Quran Stories", ur: "قرآنی قصے" }, imageUrl: "https://images.unsplash.com/photo-1606293459288-44490333d45c?w=800&q=60", content: { en: "A group of young men believed in Allah while their society worshipped idols. Fearing persecution, they fled to a cave. Allah put them to sleep for 309 years. When they woke, they thought they had only slept a day or part of a day. They sent one of them to buy food, but the currency he carried was centuries old, revealing their miracle. Allah preserved them as a sign for humanity. This story from Surah Al-Kahf teaches that Allah protects those who seek refuge in Him, and that worldly time is insignificant compared to the Hereafter.", ur: "چند نوجوان ایمان لائے جبکہ معاشرہ بت پرست تھا۔ ظلم سے بچنے غار میں پناہ لی۔ اللہ نے تین سو نو سال سلایا۔ جاگے تو سمجھے ایک دن ہوا۔ کھانا خریدنے بھیجا تو سکے صدیوں پرانے نکلے۔ یہ سورۃ الکہف کا مشہور قصہ ہے جو ایمان اور اللہ کی حفاظت کا درس دیتا ہے۔" } });
    await storage.createResource({ title: { en: "Prophet Ismail (AS) - The Great Sacrifice", ur: "حضرت اسماعیل (ع) - عظیم قربانی" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1590132644234-90a612502844?w=800&q=60", content: { en: "Prophet Ibrahim (AS) saw in a dream that he must sacrifice his beloved son Ismail. Both father and son submitted to Allah's command without hesitation. When Ibrahim laid Ismail down and was about to sacrifice him, Allah replaced Ismail with a ram from heaven and revealed: 'You have fulfilled the vision. This is how We reward those who do good.' This act of ultimate obedience is commemorated every year during Eid al-Adha. The story teaches complete submission to Allah's will.", ur: "حضرت ابراہیم علیہ السلام نے خواب میں دیکھا کہ وہ بیٹے اسماعیل کو ذبح کر رہے ہیں۔ باپ اور بیٹے دونوں نے اللہ کے حکم کے سامنے سر جھکایا۔ جب ذبح کرنے لگے تو اللہ نے مینڈھا بھیجا اور فرمایا: تم نے خواب سچ کر دکھایا۔ یہ عید الاضحی کی بنیاد ہے اور اللہ کی اطاعت کا درس ہے۔" } });
    await storage.createResource({ title: { en: "The Story of Prophet Adam (AS)", ur: "حضرت آدم (ع) کا قصہ" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=60", content: { en: "Prophet Adam (AS) was the first human and the first prophet. Allah created him from clay and taught him the names of all things. Allah commanded the angels to prostrate before Adam, and all did except Iblis (Satan) who refused out of arrogance. Adam and his wife Hawwa lived in Paradise but were tempted by Iblis to eat from the forbidden tree. They repented sincerely, saying: 'Our Lord, we have wronged ourselves. If You do not forgive us, we will surely be among the losers.' Allah forgave them and sent them to Earth as His representatives. This story teaches the importance of repentance and the danger of arrogance.", ur: "حضرت آدم علیہ السلام پہلے انسان اور پہلے نبی تھے۔ اللہ نے مٹی سے بنایا اور تمام چیزوں کے نام سکھائے۔ فرشتوں کو سجدے کا حکم دیا، سب نے کیا سوائے ابلیس کے۔ آدم اور حوا جنت میں تھے مگر ابلیس نے ممنوعہ درخت کا پھل کھانے پر آمادہ کیا۔ دونوں نے توبہ کی اور اللہ نے معاف فرمایا اور زمین پر خلیفہ بنا کر بھیجا۔" } });
    await storage.createResource({ title: { en: "Prophet Dawud (AS) and Jalut (Goliath)", ur: "حضرت داؤد (ع) اور جالوت" }, type: "story", category: { en: "Prophets", ur: "انبیاء" }, imageUrl: "https://images.unsplash.com/photo-1581009137042-db55e4dfef95?w=800&q=60", content: { en: "When the mighty warrior Jalut (Goliath) and his army terrorized the believers, the young Dawud (AS) stepped forward with unwavering faith. Though small in stature, Dawud defeated the giant Jalut with a single stone from his sling, proving that victory comes from Allah alone, not from size or military power. Allah later blessed Dawud with prophethood, the Zabur (Psalms), wisdom in judgment, and the ability to make iron soft. Mountains and birds would glorify Allah alongside him. His story teaches that true strength comes from faith and trust in Allah.", ur: "جب طاقتور جنگجو جالوت نے ایمان والوں کو خوفزدہ کیا تو نوجوان داؤد علیہ السلام ایمان کے ساتھ آگے بڑھے۔ چھوٹے ہونے کے باوجود ایک پتھر سے جالوت کو شکست دی۔ اللہ نے نبوت، زبور، حکمت اور لوہا نرم کرنے کی صلاحیت عطا کی۔ پہاڑ اور پرندے ان کے ساتھ تسبیح کرتے تھے۔" } });

    // --- Daily Duas (15 duas) ---
    await storage.createResource({ title: { en: "Morning Dua (Upon Waking Up)", ur: "صبح کی دعا (بیدار ہونے پر)" }, type: "dua", category: { en: "Morning", ur: "صبح" }, content: { arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushoor", translation: { en: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.", ur: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں موت (نیند) کے بعد زندگی دی اور اسی کی طرف اٹھنا ہے۔" } } });
    await storage.createResource({ title: { en: "Before Eating", ur: "کھانے سے پہلے" }, type: "dua", category: { en: "Food", ur: "کھانا" }, content: { arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillahi wa 'ala barakatillah", translation: { en: "In the name of Allah and with the blessing of Allah.", ur: "اللہ کے نام سے اور اللہ کی برکت سے۔" } } });
    await storage.createResource({ title: { en: "After Eating", ur: "کھانے کے بعد" }, type: "dua", category: { en: "Food", ur: "کھانا" }, content: { arabic: "الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimeen", translation: { en: "All praise is for Allah who fed us, gave us drink, and made us Muslims.", ur: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور مسلمان بنایا۔" } } });
    await storage.createResource({ title: { en: "Before Sleeping", ur: "سونے سے پہلے" }, type: "dua", category: { en: "Night", ur: "رات" }, content: { arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", translation: { en: "In Your name, O Allah, I die and I live.", ur: "اے اللہ! تیرے نام سے مرتا ہوں اور جیتا ہوں۔" } } });
    await storage.createResource({ title: { en: "Entering the Masjid", ur: "مسجد میں داخل ہوتے وقت" }, type: "dua", category: { en: "Masjid", ur: "مسجد" }, content: { arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", transliteration: "Allahumma iftah li abwaba rahmatik", translation: { en: "O Allah, open the gates of Your mercy for me.", ur: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے۔" } } });
    await storage.createResource({ title: { en: "Leaving the Masjid", ur: "مسجد سے نکلتے وقت" }, type: "dua", category: { en: "Masjid", ur: "مسجد" }, content: { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", transliteration: "Allahumma inni as'aluka min fadlik", translation: { en: "O Allah, I ask You for Your bounty.", ur: "اے اللہ! میں تجھ سے تیرے فضل کا سوال کرتا ہوں۔" } } });
    await storage.createResource({ title: { en: "Before Wudu (Ablution)", ur: "وضو سے پہلے" }, type: "dua", category: { en: "Wudu", ur: "وضو" }, content: { arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", translation: { en: "In the name of Allah.", ur: "اللہ کے نام سے۔" } } });
    await storage.createResource({ title: { en: "After Wudu", ur: "وضو کے بعد" }, type: "dua", category: { en: "Wudu", ur: "وضو" }, content: { arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", transliteration: "Ash-hadu an la ilaha illallahu wahdahu la sharika lahu, wa ash-hadu anna Muhammadan abduhu wa rasooluhu", translation: { en: "I bear witness that none has the right to be worshipped except Allah alone, and I bear witness that Muhammad is His slave and His Messenger.", ur: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں وہ اکیلا ہے اور محمد اس کے بندے اور رسول ہیں۔" } } });
    await storage.createResource({ title: { en: "Dua for Knowledge", ur: "علم کی دعا" }, type: "dua", category: { en: "Study", ur: "مطالعہ" }, content: { arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni ilma", translation: { en: "My Lord, increase me in knowledge.", ur: "اے میرے رب! میرا علم بڑھا دے۔" } } });
    await storage.createResource({ title: { en: "Dua for Parents", ur: "والدین کے لیے دعا" }, type: "dua", category: { en: "Family", ur: "خاندان" }, content: { arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", transliteration: "Rabbir hamhuma kama rabbayani sagheera", translation: { en: "My Lord, have mercy upon them as they brought me up when I was small.", ur: "اے رب! ان دونوں پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔" } } });
    await storage.createResource({ title: { en: "When in Difficulty", ur: "مشکل میں دعا" }, type: "dua", category: { en: "Hardship", ur: "مشکل" }, content: { arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin", translation: { en: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.", ur: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بیشک میں ظالموں میں سے تھا۔" } } });
    await storage.createResource({ title: { en: "Dua for Guidance (Istikhara)", ur: "استخارہ کی دعا" }, type: "dua", category: { en: "Guidance", ur: "رہنمائی" }, content: { arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ", transliteration: "Allahumma inni astakhiruka bi'ilmika wa astaqdiruka biqudratik", translation: { en: "O Allah, I seek Your guidance through Your knowledge, and I seek ability through Your power.", ur: "اے اللہ! میں تیرے علم سے بھلائی چاہتا ہوں اور تیری قدرت سے طاقت مانگتا ہوں۔" } } });
    await storage.createResource({ title: { en: "Entering the Home", ur: "گھر میں داخل ہوتے وقت" }, type: "dua", category: { en: "Home", ur: "گھر" }, content: { arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا", transliteration: "Bismillahi walajna wa bismillahi kharajna wa 'ala Rabbina tawakkalna", translation: { en: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend.", ur: "اللہ کے نام سے داخل ہوئے، اللہ کے نام سے نکلے اور اپنے رب پر بھروسہ کیا۔" } } });
    await storage.createResource({ title: { en: "Before Travelling", ur: "سفر سے پہلے" }, type: "dua", category: { en: "Travel", ur: "سفر" }, content: { arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", transliteration: "Subhanal-ladhi sakh-khara lana hadha wa ma kunna lahu muqrinin", translation: { en: "Glory to Him who has subjected this to us, and we could never have it by our efforts.", ur: "پاک ہے وہ ذات جس نے اسے ہمارے لیے مسخر کیا اور ہم اسے قابو نہ کر سکتے تھے۔" } } });
    await storage.createResource({ title: { en: "Evening Dua (Adhkar al-Masa)", ur: "شام کی دعا" }, type: "dua", category: { en: "Evening", ur: "شام" }, content: { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", transliteration: "Amsayna wa amsal-mulku lillahi wal-hamdu lillah", translation: { en: "We have reached the evening and at this very time the kingdom belongs to Allah, and all praise is for Allah.", ur: "ہم نے شام کی اور اس وقت ملک اللہ کا ہے اور تمام تعریفیں اللہ کے لیے ہیں۔" } } });

    // --- Arabic-Urdu Dictionary (20 words) ---
    await storage.createResource({ title: { en: "Prayer", ur: "نماز" }, type: "dictionary", content: { word: "صَلَاة", meaning: { en: "Prayer / Salah", ur: "نماز" }, example: "أَقِيمُوا الصَّلَاةَ" } });
    await storage.createResource({ title: { en: "Book", ur: "کتاب" }, type: "dictionary", content: { word: "كِتَاب", meaning: { en: "Book", ur: "کتاب" }, example: "ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ" } });
    await storage.createResource({ title: { en: "Knowledge", ur: "علم" }, type: "dictionary", content: { word: "عِلْم", meaning: { en: "Knowledge", ur: "علم" }, example: "رَبِّ زِدْنِي عِلْمًا" } });
    await storage.createResource({ title: { en: "Mercy", ur: "رحمت" }, type: "dictionary", content: { word: "رَحْمَة", meaning: { en: "Mercy", ur: "رحمت" }, example: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ" } });
    await storage.createResource({ title: { en: "Faith", ur: "ایمان" }, type: "dictionary", content: { word: "إِيمَان", meaning: { en: "Faith / Belief", ur: "ایمان" }, example: "وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِلَّهِ" } });
    await storage.createResource({ title: { en: "Patience", ur: "صبر" }, type: "dictionary", content: { word: "صَبْر", meaning: { en: "Patience", ur: "صبر" }, example: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" } });
    await storage.createResource({ title: { en: "Heart", ur: "دل" }, type: "dictionary", content: { word: "قَلْب", meaning: { en: "Heart", ur: "دل / قلب" }, example: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" } });
    await storage.createResource({ title: { en: "Light", ur: "روشنی" }, type: "dictionary", content: { word: "نُور", meaning: { en: "Light", ur: "نور / روشنی" }, example: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ" } });
    await storage.createResource({ title: { en: "Water", ur: "پانی" }, type: "dictionary", content: { word: "مَاء", meaning: { en: "Water", ur: "پانی" }, example: "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" } });
    await storage.createResource({ title: { en: "Truth", ur: "سچ" }, type: "dictionary", content: { word: "حَقّ", meaning: { en: "Truth / Right", ur: "حق / سچائی" }, example: "جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ" } });
    await storage.createResource({ title: { en: "Peace", ur: "سلامتی" }, type: "dictionary", content: { word: "سَلَام", meaning: { en: "Peace", ur: "سلامتی / امن" }, example: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ" } });
    await storage.createResource({ title: { en: "Earth", ur: "زمین" }, type: "dictionary", content: { word: "أَرْض", meaning: { en: "Earth / Land", ur: "زمین" }, example: "خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ" } });
    await storage.createResource({ title: { en: "Sky / Heaven", ur: "آسمان" }, type: "dictionary", content: { word: "سَمَاء", meaning: { en: "Sky / Heaven", ur: "آسمان" }, example: "وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ" } });
    await storage.createResource({ title: { en: "Piety", ur: "تقوٰی" }, type: "dictionary", content: { word: "تَقْوَى", meaning: { en: "Piety / God-consciousness", ur: "تقوٰی / اللہ کا خوف" }, example: "إِنَّ أَكْرَمَكُمْ عِنْدَ اللَّهِ أَتْقَاكُمْ" } });
    await storage.createResource({ title: { en: "Repentance", ur: "توبہ" }, type: "dictionary", content: { word: "تَوْبَة", meaning: { en: "Repentance", ur: "توبہ" }, example: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا" } });
    await storage.createResource({ title: { en: "Gratitude", ur: "شکر" }, type: "dictionary", content: { word: "شُكْر", meaning: { en: "Gratitude / Thanks", ur: "شکر / شکرگزاری" }, example: "لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ" } });
    await storage.createResource({ title: { en: "Fasting", ur: "روزہ" }, type: "dictionary", content: { word: "صَوْم", meaning: { en: "Fasting", ur: "روزہ" }, example: "كُتِبَ عَلَيْكُمُ الصِّيَامُ" } });
    await storage.createResource({ title: { en: "Charity", ur: "صدقہ" }, type: "dictionary", content: { word: "صَدَقَة", meaning: { en: "Charity / Sadaqah", ur: "صدقہ / خیرات" }, example: "إِنْ تُبْدُوا الصَّدَقَاتِ فَنِعِمَّا هِيَ" } });
    await storage.createResource({ title: { en: "Paradise", ur: "جنت" }, type: "dictionary", content: { word: "جَنَّة", meaning: { en: "Paradise / Garden", ur: "جنت / باغ" }, example: "وَبَشِّرِ الَّذِينَ آمَنُوا أَنَّ لَهُمْ جَنَّاتٍ" } });
    await storage.createResource({ title: { en: "Prophet", ur: "نبی" }, type: "dictionary", content: { word: "نَبِيّ", meaning: { en: "Prophet", ur: "نبی / پیغمبر" }, example: "وَخَاتَمَ النَّبِيِّينَ" } });
  }

  const existingVideos = await storage.getVideos();
  if (existingVideos.length === 0) {
    await storage.createVideo({
      title: { en: "Understanding Salah", ur: "نماز کو سمجھنا" },
      category: "Fiqh",
      url: "https://example.com/video1",
      thumbnail: "https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&auto=format&fit=crop&q=60",
      duration: "10:00"
    });
    await storage.createVideo({
      title: { en: "Tajweed: Makharij of Letters", ur: "تجوید: حروف کے مخارج" },
      category: "Tajweed",
      url: "https://example.com/video2",
      thumbnail: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=60",
      duration: "45:30"
    });
    await storage.createVideo({
      title: { en: "History of Islamic Civilization", ur: "اسلامی تہذیب کی تاریخ" },
      category: "History",
      url: "https://example.com/video3",
      thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=60",
      duration: "1:15:00"
    });
    await storage.createVideo({
      title: { en: "Arabic Grammar for Beginners", ur: "مبتدیوں کے لیے عربی گرامر" },
      category: "Arabic",
      url: "https://example.com/video4",
      thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=60",
      duration: "30:15"
    });
    await storage.createVideo({
      title: { en: "Tafseer of Surah Al-Fatiha", ur: "سورۃ الفاتحہ کی تفسیر" },
      category: "Tafseer",
      url: "https://example.com/video5",
      thumbnail: "https://images.unsplash.com/photo-1606293459288-44490333d45c?w=800&auto=format&fit=crop&q=60",
      duration: "55:00"
    });
    await storage.createVideo({
      title: { en: "Introduction to Sahih Bukhari", ur: "صحیح بخاری کا تعارف" },
      category: "Hadith",
      url: "https://example.com/video6",
      thumbnail: "https://images.unsplash.com/photo-1584281729290-349f28588fcd?w=800&auto=format&fit=crop&q=60",
      duration: "40:20"
    });
  }

  const existingClasses = await storage.getLiveClasses();
  if (existingClasses.length === 0) {
    await storage.createLiveClass({ title: "Live Quran Recitation", startTime: new Date(Date.now() + 3600000), instructor: "Sheikh Ahmed", isLive: true, category: "Tajweed" });
    await storage.createLiveClass({ title: "Correct Hadees Pronunciation", startTime: new Date(Date.now() + 7200000), instructor: "Mufti Hassan", isLive: false, category: "Hadees" });
    await storage.createLiveClass({ title: "Islamic Ethics Workshop", startTime: new Date(Date.now() + 86400000), instructor: "Dr. Zaid", isLive: false, category: "General" });
  }

  const existingQuizzes = await storage.getQuizzes();
  if (existingQuizzes.length === 0) {
    const quiz = await storage.createQuiz({ title: "Tajweed Basics", category: "Tajweed" });
    await storage.createQuizQuestion({ quizId: quiz.id, question: "How many letters of Qalqalah are there?", options: ["4", "5", "6", "3"], correctAnswer: 1 });
  }

  const existingCourseTests = await storage.getCourseTests("tafseer");
  if (existingCourseTests.length === 0) {
    // Seed Tafseer Test
    await storage.createCourseTest({
      courseId: "tafseer",
      type: "quiz",
      title: "Introduction to Tafseer Quiz",
      description: "Basic concepts of Quranic Exegesis",
      questions: [
        {
          id: "q1",
          question: "What does the word 'Tafseer' literally mean?",
          options: [
            { text: "To hide", isCorrect: false },
            { text: "To explain or uncover", isCorrect: true },
            { text: "To recite", isCorrect: false },
            { text: "To memorize", isCorrect: false }
          ]
        }
      ],
      uploadedBy: "Admin",
      uploadedAt: new Date()
    });

    // Seed Hadees Test
    await storage.createCourseTest({
      courseId: "hadees",
      type: "quiz",
      title: "Hadees Terminology Basics",
      description: "Test your knowledge of Sahih, Hasan and Da'if",
      questions: [
        {
          id: "q1",
          question: "Which of these is the most authentic book of Hadees?",
          options: [
            { text: "Sahih Bukhari", isCorrect: true },
            { text: "Sahih Muslim", isCorrect: false },
            { text: "Sunan Abu Dawood", isCorrect: false },
            { text: "Sunan Ibn Majah", isCorrect: false }
          ]
        }
      ],
      uploadedBy: "Admin",
      uploadedAt: new Date()
    });

    // Seed Namaz Test
    await storage.createCourseTest({
      courseId: "namaz",
      type: "quiz",
      title: "Salah Essentials Quiz",
      description: "Basic Faraid and Sunan of Prayer",
      questions: [
        {
          id: "q1",
          question: "How many Faraid (obligations) are there in Wudu?",
          options: [
            { text: "3", isCorrect: false },
            { text: "4", isCorrect: true },
            { text: "5", isCorrect: false },
            { text: "6", isCorrect: false }
          ]
        }
      ],
      uploadedBy: "Admin",
      uploadedAt: new Date()
    });
  }

  const existingAchievements = await storage.getAchievements();
  if (existingAchievements.length === 0) {
    await storage.createAchievement({ title: "First Step", description: "Marked your first Quran progress", points: 10, badgeUrl: "star" });
    await storage.createAchievement({ title: "Hafiz Junior", description: "Memorized 10 or more Surahs", points: 50, badgeUrl: "book-open" });
    await storage.createAchievement({ title: "Quiz Champion", description: "Scored 100% on a quiz", points: 30, badgeUrl: "target" });
    await storage.createAchievement({ title: "Quiz Master", description: "Completed 3 or more quizzes", points: 40, badgeUrl: "flame" });
    await storage.createAchievement({ title: "Streak Master", description: "Attended class 5 days in a row", points: 25, badgeUrl: "flame" });
    await storage.createAchievement({ title: "Library Explorer", description: "Explored the library section", points: 15, badgeUrl: "book-open" });
    await storage.createAchievement({ title: "Dua Reciter", description: "Listened to 5 or more Duas", points: 20, badgeUrl: "star" });
    await storage.createAchievement({ title: "Grand Scholar", description: "Earned 100+ total points", points: 100, badgeUrl: "target" });
    await storage.createAchievement({ title: "Tajweed Master", description: "Started your Tajweed course journey", points: 25, badgeUrl: "star" });
    await storage.createAchievement({ title: "Hadees Student", description: "Started your Hadees course journey", points: 25, badgeUrl: "book-open" });
    await storage.createAchievement({ title: "Namaz Expert", description: "Started your Namaz course journey", points: 25, badgeUrl: "target" });
    await storage.createAchievement({ title: "Tafseer Scholar", description: "Started your Tafseer course journey", points: 25, badgeUrl: "book-open" });
  }

  const existingFlashcards = await storage.getFlashcards();
  if (existingFlashcards.length === 0) {
    await storage.createFlashcard({
      question: { en: "Who was the first Prophet?", ur: "پہلے نبی کون تھے؟" },
      answer: { en: "Prophet Adam (AS)", ur: "حضرت آدم (ع)" },
      category: "Prophets"
    });
    await storage.createFlashcard({
      question: { en: "Who was known as Khalilullah (Friend of Allah)?", ur: "خلیل اللہ کس نبی کو کہا جاتا ہے؟" },
      answer: { en: "Prophet Ibrahim (AS)", ur: "حضرت ابراہیم (ع)" },
      category: "Prophets"
    });
    await storage.createFlashcard({
      question: { en: "Which Prophet was swallowed by a whale?", ur: "کس نبی کو مچھلی نے نگلا؟" },
      answer: { en: "Prophet Yunus (AS)", ur: "حضرت یونس (ع)" },
      category: "Prophets"
    });
    await storage.createFlashcard({
      question: { en: "Who was the last Prophet?", ur: "آخری نبی کون ہیں؟" },
      answer: { en: "Prophet Muhammad (SAW)", ur: "حضرت محمد (صلی اللہ علیہ وسلم)" },
      category: "Prophets"
    });
    await storage.createFlashcard({
      question: { en: "How many times do Muslims pray daily?", ur: "مسلمان روزانہ کتنی بار نماز پڑھتے ہیں؟" },
      answer: { en: "5 times", ur: "5 بار" },
      category: "Worship"
    });
    await storage.createFlashcard({
      question: { en: "Which Surah is known as the heart of the Quran?", ur: "قرآن کا دل کس سورہ کو کہا جاتا ہے؟" },
      answer: { en: "Surah Yaseen", ur: "سورہ یٰسین" },
      category: "Quran"
    });
    await storage.createFlashcard({
      question: { en: "How many months are in the Islamic calendar?", ur: "اسلامی سال میں کتنے مہینے ہوتے ہیں؟" },
      answer: { en: "12 months", ur: "12 مہینے" },
      category: "General Knowledge"
    });
    await storage.createFlashcard({
      question: { en: "What is the first month of the Islamic year?", ur: "اسلامی سال کا پہلا مہینہ کونسا ہے؟" },
      answer: { en: "Muharram", ur: "محرم" },
      category: "General Knowledge"
    });
    await storage.createFlashcard({
      question: { en: "Who built the Ka'bah first?", ur: "کعبہ معظمہ سب سے پہلے کس نے تعمیر کیا؟" },
      answer: { en: "Prophet Adam (AS)", ur: "حضرت آدم (ع)" },
      category: "History"
    });
    await storage.createFlashcard({
      question: { en: "Which Prophet could speak to animals?", ur: "کون سے نبی جانوروں سے بات کر سکتے تھے؟" },
      answer: { en: "Prophet Sulaiman (AS)", ur: "حضرت سلیمان (ع)" },
      category: "Prophets"
    });
    await storage.createFlashcard({
      question: { en: "What is the largest Surah in the Quran?", ur: "قرآن کی سب سے بڑی سورہ کونسی ہے؟" },
      answer: { en: "Surah Al-Baqarah", ur: "سورہ البقرہ" },
      category: "Quran"
    });
    await storage.createFlashcard({
      question: { en: "In which month was the Quran first revealed?", ur: "قرآن کس مہینے میں نازل ہونا شروع ہوا؟" },
      answer: { en: "Ramadan", ur: "رمضان" },
      category: "Quran"
    });
  }

  const existingWisdom = await storage.getWisdom();
  if (existingWisdom.length === 0) {
    const wisdomQuotes = [
      { content: "علم وہ نور ہے جو خالق تک پہنچنے کا راستہ روشن کرتا ہے۔", author: "امام غزالی", addedBy: "demo-admin" },
      { content: "نیک صحبت اختیار کرو، اس سے تمہارے اخلاق سنور جائیں گے۔", author: "حضرت علی (ر)", addedBy: "demo-admin" },
      { content: "وقت ایک ایسی تلوار ہے کہ اگر تم اسے نہیں کاٹو گے تو وہ تمہیں کاٹ دے گی۔", author: "حضرت عمر فاروق (ر)", addedBy: "demo-admin" },
      { content: "جو شخص اللہ کے لیے عاجزی اختیار کرتا ہے، اللہ اسے بلندی عطا فرماتا ہے۔", author: "حدیث شریف", addedBy: "demo-admin" },
    ];
    for (const w of wisdomQuotes) {
      await storage.createWisdom(w);
    }
  }
}
