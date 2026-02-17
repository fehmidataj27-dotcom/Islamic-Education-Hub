import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerImageRoutes } from "./replit_integrations/image";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // AI Integrations
  registerAudioRoutes(app);
  registerImageRoutes(app);

  // Protected API Routes
  
  // Daily Stats
  app.get(api.dailyStats.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getDailyStats(userId);
    if (!stats) return res.status(404).json({ message: "No stats found" });
    res.json(stats);
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

  // Books
  app.get(api.books.list.path, async (req, res) => {
    const books = await storage.getBooks();
    res.json(books);
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

  // Resources
  app.get(api.resources.list.path, async (req, res) => {
    const resources = await storage.getResources();
    res.json(resources);
  });

  // Videos
  app.get(api.videos.list.path, async (req, res) => {
    const videos = await storage.getVideos();
    res.json(videos);
  });

  // Live Classes
  app.get(api.liveClasses.list.path, async (req, res) => {
    const classes = await storage.getLiveClasses();
    res.json(classes);
  });

  // Quizzes
  app.get(api.quizzes.list.path, async (req, res) => {
    const quizzes = await storage.getQuizzes();
    res.json(quizzes);
  });

  app.get(api.quizzes.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const quiz = await storage.getQuiz(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    const questions = await storage.getQuizQuestions(id);
    res.json({ quiz, questions });
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

  // Seed Data
  await seedDatabase();

  return httpServer;
}

import { db } from "./db";
import { books, resources, videos, live_classes, quizzes, quiz_questions, achievements } from "@shared/schema";

async function seedDatabase() {
  const existingBooks = await db.select().from(books);
  if (existingBooks.length === 0) {
    await db.insert(books).values([
      { title: "Nurani Qaidah", className: "Beginner", category: "Tajweed" },
      { title: "Riyad us Saliheen", className: "Intermediate", category: "Hadith" },
      { title: "Seerat un Nabi", className: "Advanced", category: "Seerah" },
    ]);
  }

  const existingResources = await db.select().from(resources);
  if (existingResources.length === 0) {
    await db.insert(resources).values([
      { title: "Prophet's Stories", type: "story", content: "Stories of the Prophets..." },
      { title: "Morning Adhkar", type: "dua", content: "SubhanAllah, Alhamdulillah..." },
      { title: "Arabic Dictionary", type: "dictionary", content: "Search for Arabic words..." },
    ]);
  }

  const existingVideos = await db.select().from(videos);
  if (existingVideos.length === 0) {
    await db.insert(videos).values([
      { title: "Understanding Salah", category: "Fiqh", url: "https://example.com/video1", duration: "10:00" },
      { title: "Tajweed Basics", category: "Tajweed", url: "https://example.com/video2", duration: "15:00" },
    ]);
  }

  const existingClasses = await db.select().from(live_classes);
  if (existingClasses.length === 0) {
    await db.insert(live_classes).values([
      { title: "Live Quran Recitation", startTime: new Date(Date.now() + 3600000), instructor: "Sheikh Ahmed", isLive: true },
    ]);
  }
  
  const existingQuizzes = await db.select().from(quizzes);
  if (existingQuizzes.length === 0) {
    const [quiz] = await db.insert(quizzes).values({ title: "Tajweed Basics", category: "Tajweed" }).returning();
    await db.insert(quiz_questions).values([
      { quizId: quiz.id, question: "How many letters of Qalqalah are there?", options: ["4", "5", "6", "3"], correctAnswer: 1 },
      { quizId: quiz.id, question: "Which letter is a throat letter?", options: ["Ba", "Ta", "Ha", "Sa"], correctAnswer: 2 },
    ]);
  }

  const existingAchievements = await db.select().from(achievements);
  if (existingAchievements.length === 0) {
    await db.insert(achievements).values([
      { title: "First Step", description: "Completed first lesson", points: 10 },
      { title: "Hafiz Junior", description: "Memorized 10 Surahs", points: 50 },
    ]);
  }
}
