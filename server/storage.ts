import { db } from "./db";
import { 
  daily_stats, books, quran_progress, resources, videos, live_classes, 
  quizzes, quiz_questions, quiz_results, achievements, user_achievements,
  type InsertDailyStats, type InsertBook, type InsertQuranProgress,
  type InsertResource, type InsertVideo, type InsertLiveClass,
  type InsertQuiz, type InsertQuizQuestion, type InsertQuizResult,
  type InsertAchievement, type InsertUserAchievement
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Stats
  getDailyStats(userId: string): Promise<typeof daily_stats.$inferSelect | undefined>;
  updateDailyStats(userId: string, stats: Partial<InsertDailyStats>): Promise<typeof daily_stats.$inferSelect>;
  
  // Books
  getBooks(): Promise<typeof books.$inferSelect[]>;
  getBook(id: number): Promise<typeof books.$inferSelect | undefined>;
  
  // Quran
  getQuranProgress(userId: string): Promise<typeof quran_progress.$inferSelect[]>;
  updateQuranProgress(userId: string, progress: InsertQuranProgress): Promise<typeof quran_progress.$inferSelect>;

  // Resources
  getResources(): Promise<typeof resources.$inferSelect[]>;

  // Videos
  getVideos(): Promise<typeof videos.$inferSelect[]>;

  // Live Classes
  getLiveClasses(): Promise<typeof live_classes.$inferSelect[]>;

  // Quizzes
  getQuizzes(): Promise<typeof quizzes.$inferSelect[]>;
  getQuiz(id: number): Promise<typeof quizzes.$inferSelect | undefined>;
  getQuizQuestions(quizId: number): Promise<typeof quiz_questions.$inferSelect[]>;
  submitQuizResult(result: InsertQuizResult): Promise<typeof quiz_results.$inferSelect>;

  // Achievements
  getAchievements(): Promise<typeof achievements.$inferSelect[]>;
  getUserAchievements(userId: string): Promise<typeof user_achievements.$inferSelect[]>;
}

export class DatabaseStorage implements IStorage {
  // Stats
  async getDailyStats(userId: string) {
    const [stats] = await db.select().from(daily_stats).where(eq(daily_stats.userId, userId));
    return stats;
  }

  async updateDailyStats(userId: string, stats: Partial<InsertDailyStats>) {
    // Check if exists
    const existing = await this.getDailyStats(userId);
    if (existing) {
      const [updated] = await db.update(daily_stats)
        .set(stats)
        .where(eq(daily_stats.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(daily_stats)
        .values({ ...stats, userId } as InsertDailyStats)
        .returning();
      return created;
    }
  }

  // Books
  async getBooks() {
    return await db.select().from(books);
  }

  async getBook(id: number) {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  // Quran
  async getQuranProgress(userId: string) {
    return await db.select().from(quran_progress).where(eq(quran_progress.userId, userId));
  }

  async updateQuranProgress(userId: string, progress: InsertQuranProgress) {
    // Upsert logic could be added here, for now simple insert
    const [entry] = await db.insert(quran_progress).values(progress).returning();
    return entry;
  }

  // Resources
  async getResources() {
    return await db.select().from(resources);
  }

  // Videos
  async getVideos() {
    return await db.select().from(videos);
  }

  // Live Classes
  async getLiveClasses() {
    return await db.select().from(live_classes);
  }

  // Quizzes
  async getQuizzes() {
    return await db.select().from(quizzes);
  }

  async getQuiz(id: number) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizQuestions(quizId: number) {
    return await db.select().from(quiz_questions).where(eq(quiz_questions.quizId, quizId));
  }

  async submitQuizResult(result: InsertQuizResult) {
    const [entry] = await db.insert(quiz_results).values(result).returning();
    return entry;
  }

  // Achievements
  async getAchievements() {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string) {
    return await db.select().from(user_achievements).where(eq(user_achievements.userId, userId));
  }
}

export const storage = new DatabaseStorage();
