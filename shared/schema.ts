import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export Auth and Chat models from integrations
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Application specific tables

export const daily_stats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users.id
  date: timestamp("date").defaultNow().notNull(),
  attendance: boolean("attendance").default(false),
  quizScore: integer("quiz_score").default(0),
  hifzProgress: integer("hifz_progress").default(0), // Number of ayahs/lines
  salaahStreak: integer("salaah_streak").default(0),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  category: text("category").notNull(),
  coverUrl: text("cover_url"),
  pdfUrl: text("pdf_url"),
});

export const quran_progress = pgTable("quran_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  surah: integer("surah").notNull(),
  ayah: integer("ayah").notNull(),
  status: text("status").notNull(), // 'memorized', 'reading', 'completed'
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'story', 'dua', 'dictionary'
  content: text("content"),
  url: text("url"),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  duration: text("duration"),
  viewCount: integer("view_count").default(0),
});

export const live_classes = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  instructor: text("instructor").notNull(),
  joinUrl: text("join_url"),
  isLive: boolean("is_live").default(false),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
});

export const quiz_questions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of strings
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
});

export const quiz_results = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  badgeUrl: text("badge_url"),
});

export const user_achievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Relations
export const dailyStatsRelations = relations(daily_stats, ({ one }) => ({
  user: one(users, {
    fields: [daily_stats.userId],
    references: [users.id],
  }),
}));

export const quranProgressRelations = relations(quran_progress, ({ one }) => ({
  user: one(users, {
    fields: [quran_progress.userId],
    references: [users.id],
  }),
}));

export const quizQuestionsRelations = relations(quiz_questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quiz_questions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizResultsRelations = relations(quiz_results, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quiz_results.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quiz_results.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(user_achievements, ({ one }) => ({
  achievement: one(achievements, {
    fields: [user_achievements.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [user_achievements.userId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertDailyStatsSchema = createInsertSchema(daily_stats).omit({ id: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export const insertQuranProgressSchema = createInsertSchema(quran_progress).omit({ id: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true });
export const insertLiveClassSchema = createInsertSchema(live_classes).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true });
export const insertQuizQuestionSchema = createInsertSchema(quiz_questions).omit({ id: true });
export const insertQuizResultSchema = createInsertSchema(quiz_results).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserAchievementSchema = createInsertSchema(user_achievements).omit({ id: true });

// Types
export type DailyStats = typeof daily_stats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type QuranProgress = typeof quran_progress.$inferSelect;
export type InsertQuranProgress = z.infer<typeof insertQuranProgressSchema>;
export type Resource = typeof resources.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type LiveClass = typeof live_classes.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type QuizResult = typeof quiz_results.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof user_achievements.$inferSelect;
