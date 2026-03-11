import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Export Auth and Chat models from integrations
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Application specific tables

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").default("General").notNull(),
  capacity: integer("capacity"),
  status: text("status").default("active").notNull(), // 'active', 'archived'
  isLocked: boolean("is_locked").default(false).notNull(), // when true only teacher/admin can post
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const group_teachers = pgTable("group_teachers", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  userId: text("user_id").notNull(), // references users.id
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => [
  index("group_teachers_group_id_idx").on(table.groupId),
  index("group_teachers_user_id_idx").on(table.userId),
]);

export const group_students = pgTable("group_students", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  userId: text("user_id").notNull(), // references users.id
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
  index("group_students_group_id_idx").on(table.groupId),
  index("group_students_user_id_idx").on(table.userId),
]);

export const group_announcements = pgTable("group_announcements", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  authorId: text("user_id").notNull(),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  fileType: text("file_type"), // 'text', 'voice'
  replyToId: integer("reply_to_id"),       // id of the message being replied to
  replyToContent: text("reply_to_content"), // preview text of the original message
  replyToAuthor: text("reply_to_author"),   // display name of the original author
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("group_announcements_group_id_idx").on(table.groupId),
]);

export const group_assignments = pgTable("group_assignments", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  authorId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  fileType: text("file_type"), // 'pdf', 'audio', 'video'
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("group_assignments_group_id_idx").on(table.groupId),
]);

export const group_attendance = pgTable("group_attendance", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  userId: text("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late'
}, (table) => [
  index("group_attendance_lookup_idx").on(table.groupId, table.userId, table.date),
]);

export const group_performance = pgTable("group_performance", {
  id: serial("id").primaryKey(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  userId: text("user_id").notNull(),
  score: integer("score"),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => [
  index("group_performance_user_idx").on(table.groupId, table.userId),
]);

export const audit_logs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  action: text("action").notNull(), // 'create_group', 'delete_group', 'transfer_student', etc.
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const daily_stats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users.id
  date: timestamp("date").defaultNow().notNull(),
  attendance: boolean("attendance").default(false),
  quizScore: integer("quiz_score").default(0),
  hifzProgress: integer("hifz_progress").default(0), // Number of ayahs/lines
  salaahStreak: integer("salaah_streak").default(0),
  salaah: jsonb("salaah").default({}), // { fajr: boolean, dhuhr: boolean, ... }
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  className: text("class_name").notNull(),
  category: text("category").notNull(),
  program: text("program").default("General").notNull(), // 'Darse Nizami' or 'General'
  coverUrl: text("cover_url"),
  pdfUrl: text("pdf_url"),
  summary: text("summary"),
  language: text("language").default("English").notNull(),
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
  title: jsonb("title").notNull(), // { en: string, ur: string }
  type: text("type").notNull(), // 'story', 'dua', 'dictionary', 'urdu_book'
  category: jsonb("category"), // { en: string, ur: string }
  content: jsonb("content"), // { en: string, ur: string } or more complex for dictionary/duas
  url: text("url"),
  imageUrl: text("image_url"),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: jsonb("title").notNull(), // { en: string, ur: string }
  category: text("category").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  viewCount: integer("view_count").default(0),
  progress: integer("progress").default(0),
});

export const live_classes = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  instructor: text("instructor").notNull(),
  joinUrl: text("join_url"),
  isLive: boolean("is_live").default(false),
  category: text("category").default("General").notNull(),
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

export const salah_progress = pgTable("salah_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  stepId: text("step_id").notNull(),
  completed: boolean("completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // 'Paid', 'Pending', 'Overdue'
  month: text("month").notNull(),
  year: integer("year").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  question: jsonb("question").notNull(), // { en: string, ur: string }
  answer: jsonb("answer").notNull(),   // { en: string, ur: string }
  category: text("category").notNull(),
});

export const course_tests = pgTable("course_tests", {
  id: serial("id").primaryKey(),
  courseId: text("course_id").notNull(),
  type: text("type").notNull(), // 'quiz', 'pdf'
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions"), // Array of objects
  pdfName: text("pdf_name"),
  pdfData: text("pdf_data"),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const course_test_results = pgTable("course_test_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  testId: integer("test_id").references(() => course_tests.id),
  score: integer("score"),
  total: integer("total"),
  submissionText: text("submission_text"),
  submissionData: text("submission_data"),
  submissionName: text("submission_name"),
  teacherFeedback: text("teacher_feedback"),
  gradedBy: text("graded_by"),
  gradedAt: timestamp("graded_at"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const wisdom = pgTable("wisdom", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: text("author"),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const groupRelations = relations(groups, ({ many }) => ({
  teachers: many(group_teachers),
  students: many(group_students),
  announcements: many(group_announcements),
  assignments: many(group_assignments),
}));

export const groupTeachersRelations = relations(group_teachers, ({ one }) => ({
  group: one(groups, {
    fields: [group_teachers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [group_teachers.userId],
    references: [users.id],
  }),
}));

export const groupStudentsRelations = relations(group_students, ({ one }) => ({
  group: one(groups, {
    fields: [group_students.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [group_students.userId],
    references: [users.id],
  }),
}));

export const groupAnnouncementsRelations = relations(group_announcements, ({ one }) => ({
  group: one(groups, {
    fields: [group_announcements.groupId],
    references: [groups.id],
  }),
  author: one(users, {
    fields: [group_announcements.authorId],
    references: [users.id],
  }),
}));

export const groupAssignmentsRelations = relations(group_assignments, ({ one }) => ({
  group: one(groups, {
    fields: [group_assignments.groupId],
    references: [groups.id],
  }),
  author: one(users, {
    fields: [group_assignments.authorId],
    references: [users.id],
  }),
}));

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

export const salahProgressRelations = relations(salah_progress, ({ one }) => ({
  user: one(users, {
    fields: [salah_progress.userId],
    references: [users.id],
  }),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  user: one(users, {
    fields: [fees.userId],
    references: [users.id],
  }),
}));

export const courseTestsRelations = relations(course_tests, ({ many }) => ({
  results: many(course_test_results),
}));

export const courseTestResultsRelations = relations(course_test_results, ({ one }) => ({
  test: one(course_tests, {
    fields: [course_test_results.testId],
    references: [course_tests.id],
  }),
  user: one(users, {
    fields: [course_test_results.userId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGroupTeacherSchema = createInsertSchema(group_teachers).omit({ id: true, assignedAt: true });
export const insertGroupStudentSchema = createInsertSchema(group_students).omit({ id: true, joinedAt: true });
export const insertGroupAnnouncementSchema = createInsertSchema(group_announcements).omit({ id: true, createdAt: true });
export const insertGroupAssignmentSchema = createInsertSchema(group_assignments).omit({ id: true, createdAt: true });
export const insertGroupAttendanceSchema = createInsertSchema(group_attendance, {
  date: z.coerce.date().optional(),
}).omit({ id: true });
export const insertGroupPerformanceSchema = createInsertSchema(group_performance).omit({ id: true, recordedAt: true });
export const insertAuditLogSchema = createInsertSchema(audit_logs).omit({ id: true, createdAt: true });

export const insertDailyStatsSchema = createInsertSchema(daily_stats, {
  date: z.coerce.date(),
}).omit({ id: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export const insertQuranProgressSchema = createInsertSchema(quran_progress).omit({ id: true });
export const languageSchema = z.object({
  en: z.string().min(1, "English title is required"),
  ur: z.string().min(1, "Urdu title is required"),
});

export const insertResourceSchema = createInsertSchema(resources, {
  title: languageSchema,
  category: z.any().nullable().optional(),
  content: z.any().nullable().optional(),
  url: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
}).omit({ id: true });

export const insertVideoSchema = createInsertSchema(videos, {
  title: languageSchema,
}).omit({ id: true });

export const videoSchema = createSelectSchema(videos, {
  title: languageSchema,
});
export const insertLiveClassSchema = createInsertSchema(live_classes, {
  startTime: z.coerce.date(),
}).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true });
export const insertQuizQuestionSchema = createInsertSchema(quiz_questions).omit({ id: true });
export const insertQuizResultSchema = createInsertSchema(quiz_results).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserAchievementSchema = createInsertSchema(user_achievements).omit({ id: true });
export const insertSalahProgressSchema = createInsertSchema(salah_progress).omit({ id: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true, updatedAt: true });

export const insertFlashcardSchema = createInsertSchema(flashcards, {
  question: languageSchema,
  answer: languageSchema,
}).omit({ id: true });

export const flashcardSchema = createSelectSchema(flashcards, {
  question: languageSchema,
  answer: languageSchema,
});

export const insertCourseTestSchema = z.object({
  courseId: z.string(),
  type: z.string().default('notes'),
  title: z.string(),
  description: z.string().optional().nullable(),
  questions: z.any().optional().nullable(),
  pdfName: z.string().optional().nullable(),
  pdfData: z.string().optional().nullable(),
  uploadedBy: z.string(),
  uploadedAt: z.any().optional().nullable(),
});
export const insertCourseTestResultSchema = createInsertSchema(course_test_results, {
  completedAt: z.coerce.date(),
  gradedAt: z.coerce.date().optional().nullable(),
}).omit({ id: true });
export const insertWisdomSchema = createInsertSchema(wisdom).omit({ id: true, createdAt: true });

export const courseTestSchema = createSelectSchema(course_tests);
export const courseTestResultSchema = createSelectSchema(course_test_results);

// Types
export type Group = typeof groups.$inferSelect;
export type GroupWithStats = Group & { teacherCount?: number; studentCount?: number };
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupTeacher = typeof group_teachers.$inferSelect;
export type InsertGroupTeacher = z.infer<typeof insertGroupTeacherSchema>;
export type GroupStudent = typeof group_students.$inferSelect;
export type InsertGroupStudent = z.infer<typeof insertGroupStudentSchema>;
export type GroupAnnouncement = typeof group_announcements.$inferSelect;
export type InsertGroupAnnouncement = z.infer<typeof insertGroupAnnouncementSchema>;
export type GroupAssignment = typeof group_assignments.$inferSelect;
export type InsertGroupAssignment = z.infer<typeof insertGroupAssignmentSchema>;
export type GroupAttendance = typeof group_attendance.$inferSelect;
export type InsertGroupAttendance = z.infer<typeof insertGroupAttendanceSchema>;
export type GroupPerformance = typeof group_performance.$inferSelect;
export type InsertGroupPerformance = z.infer<typeof insertGroupPerformanceSchema>;
export type AuditLog = typeof audit_logs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type DailyStats = typeof daily_stats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type QuranProgress = typeof quran_progress.$inferSelect;
export type InsertQuranProgress = z.infer<typeof insertQuranProgressSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Video = z.infer<typeof videoSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type LiveClass = typeof live_classes.$inferSelect;
export type InsertLiveClass = z.infer<typeof insertLiveClassSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quiz_questions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizResult = typeof quiz_results.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof user_achievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type SalahProgress = typeof salah_progress.$inferSelect;
export type InsertSalahProgress = z.infer<typeof insertSalahProgressSchema>;
export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type CourseTest = typeof course_tests.$inferSelect;
export type InsertCourseTest = z.infer<typeof insertCourseTestSchema>;
export type CourseTestResult = typeof course_test_results.$inferSelect;
export type InsertCourseTestResult = z.infer<typeof insertCourseTestResultSchema>;
export type Wisdom = typeof wisdom.$inferSelect;
export type InsertWisdom = z.infer<typeof insertWisdomSchema>;

