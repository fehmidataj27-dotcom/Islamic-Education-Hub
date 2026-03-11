import fs from "fs";
import path from "path";
import {
  daily_stats, books, quran_progress, resources, videos, live_classes,
  quizzes, quiz_questions, quiz_results, achievements, user_achievements, salah_progress, flashcards,
  type DailyStats, type InsertDailyStats, type Book, type InsertBook,
  type QuranProgress, type InsertQuranProgress, type Resource, type InsertResource,
  type Video, type InsertVideo, type LiveClass, type InsertLiveClass,
  type Quiz, type InsertQuiz, type QuizQuestion, type InsertQuizQuestion,
  type QuizResult, type InsertQuizResult, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement, type SalahProgress, type InsertSalahProgress,
  fees, type Fee, type InsertFee, type Flashcard, type InsertFlashcard,
  course_tests, course_test_results,
  type CourseTest, type InsertCourseTest, type CourseTestResult, type InsertCourseTestResult,
  groups, group_teachers, group_students, group_announcements, group_assignments, group_attendance, group_performance, audit_logs,
  type Group, type InsertGroup, type GroupTeacher, type InsertGroupTeacher, type GroupStudent, type InsertGroupStudent,
  type GroupAnnouncement, type InsertGroupAnnouncement, type GroupAssignment, type InsertGroupAssignment,
  type GroupAttendance, type InsertGroupAttendance, type GroupPerformance, type InsertGroupPerformance,
  type AuditLog, type InsertAuditLog, users, type User, type GroupWithStats,
  wisdom, type Wisdom, type InsertWisdom
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Stats
  getDailyStats(userId: string): Promise<DailyStats | undefined>;
  getDailyStatsHistory(userId: string): Promise<DailyStats[]>;
  getDailyStatsByDate(date: Date): Promise<DailyStats[]>;
  getAllDailyStats(): Promise<DailyStats[]>;
  updateDailyStats(userId: string, stats: Partial<InsertDailyStats>): Promise<DailyStats>;

  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>; // Added for seeding
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;

  // Quran
  getQuranProgress(userId: string): Promise<QuranProgress[]>;
  updateQuranProgress(userId: string, progress: InsertQuranProgress): Promise<QuranProgress>;

  // Resources
  getResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>; // Added for seeding
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: number): Promise<void>;

  // Videos
  getVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>; // Added for seeding
  incrementVideoViews(id: number): Promise<void>;
  deleteVideo(id: number): Promise<void>;

  // Live Classes
  getLiveClasses(): Promise<LiveClass[]>;
  createLiveClass(liveClass: InsertLiveClass): Promise<LiveClass>; // Added for seeding
  updateLiveClass(id: number, data: Partial<InsertLiveClass>): Promise<LiveClass>;

  // Quizzes
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  submitQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>; // Added for seeding
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>; // Added for seeding

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>; // Added for seeding
  awardAchievement(userId: string, achievementId: number): Promise<UserAchievement | undefined>;

  // Salah
  getSalahProgress(userId: string): Promise<SalahProgress[]>;
  updateSalahProgress(userId: string, stepId: string, completed: boolean): Promise<SalahProgress>;

  // Fees
  getFees(): Promise<Fee[]>;
  getFeesByUser(userId: string): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, data: Partial<InsertFee>): Promise<Fee>;

  // Flashcards
  getFlashcards(): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<void>;

  // Course Tests
  getCourseTests(courseId: string): Promise<CourseTest[]>;
  createCourseTest(test: InsertCourseTest): Promise<CourseTest>;
  updateCourseTest(id: number, data: Partial<InsertCourseTest>): Promise<CourseTest>;
  deleteCourseTest(id: number): Promise<void>;
  getCourseTestResults(userId: string): Promise<CourseTestResult[]>;
  getAllCourseTestResults(testId: number): Promise<any[]>;
  submitCourseTestResult(result: InsertCourseTestResult): Promise<CourseTestResult>;
  updateCourseTestResult(id: number, score: number, total: number, feedback: string, graderId: string): Promise<CourseTestResult>;

  // Groups
  getGroups(options?: { search?: string, status?: string, category?: string, offset?: number, limit?: number }): Promise<{ groups: (Group | GroupWithStats)[], total: number }>;
  getGroup(id: string): Promise<GroupWithStats | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: string): Promise<void>;
  lockGroup(id: string, locked: boolean): Promise<Group>;
  getGroupTeachers(groupId: string): Promise<User[]>;
  assignTeacherToGroup(groupId: string, userId: string): Promise<void>;
  removeTeacherFromGroup(groupId: string, userId: string): Promise<void>;
  getGroupStudents(groupId: string): Promise<User[]>;
  addStudentToGroup(groupId: string, userId: string): Promise<void>;
  removeStudentFromGroup(groupId: string, userId: string): Promise<void>;
  transferStudent(userId: string, fromGroupId: string, toGroupId: string): Promise<void>;
  getUserGroups(userId: string, role: string): Promise<Group[]>;

  // Group Content
  getGroupAnnouncements(groupId: string): Promise<GroupAnnouncement[]>;
  getCategoryAnnouncements(groupIds: string[]): Promise<GroupAnnouncement[]>;
  createGroupAnnouncement(announcement: InsertGroupAnnouncement): Promise<GroupAnnouncement>;
  getGroupAssignments(groupId: string): Promise<GroupAssignment[]>;
  createGroupAssignment(assignment: InsertGroupAssignment): Promise<GroupAssignment>;

  // Attendance & Performance
  getGroupAttendance(groupId: string, date?: Date): Promise<GroupAttendance[]>;
  getUserAttendance(userId: string): Promise<GroupAttendance[]>;
  recordAttendance(attendance: InsertGroupAttendance): Promise<GroupAttendance>;
  getGroupPerformance(groupId: string, userId?: string): Promise<GroupPerformance[]>;
  recordPerformance(performance: InsertGroupPerformance): Promise<GroupPerformance>;

  // Analytics
  getSystemAnalytics(): Promise<any>;
  getGroupAnalytics(groupId: string): Promise<any>;

  // Audit Logs
  getAuditLogs(options?: { adminId?: string, offset?: number, limit?: number }): Promise<{ logs: AuditLog[], total: number }>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Wisdom
  getWisdom(): Promise<Wisdom[]>;
  getDailyWisdom(): Promise<Wisdom | undefined>;
  createWisdom(wisdom: InsertWisdom): Promise<Wisdom>;
}

export class MemStorage implements IStorage {
  private stats: DailyStats[] = [];
  private books: Book[] = [];
  private quranProgress: QuranProgress[] = [];
  private resources: Resource[] = [];
  private videos: Video[] = [];
  private liveClasses: LiveClass[] = [];
  private quizzes: Quiz[] = [];
  private quizQuestions: QuizQuestion[] = [];
  private quizResults: QuizResult[] = [];
  private achievements: Achievement[] = [];
  private userAchievements: UserAchievement[] = [];
  private fees: Fee[] = [];
  private flashcards: Flashcard[] = [];
  private courseTests: CourseTest[] = [];
  private courseTestResults: CourseTestResult[] = [];
  private groups: Group[] = [];
  private groupTeachers: GroupTeacher[] = [];
  private groupStudents: GroupStudent[] = [];
  private groupAnnouncements: GroupAnnouncement[] = [];
  private groupAssignments: GroupAssignment[] = [];
  private groupAttendance: GroupAttendance[] = [];
  private groupPerformance: GroupPerformance[] = [];
  private auditLogs: AuditLog[] = [];
  private wisdom: Wisdom[] = [];

  // ID Counters
  private ids = {
    dailyStats: 1,
    books: 1,
    quranProgress: 1,
    resources: 1,
    videos: 1,
    liveClasses: 1,
    quizzes: 1,
    quizQuestions: 1,
    quizResults: 1,
    achievements: 1,
    userAchievements: 1,
    salahProgress: 1,
    fees: 1,
    flashcards: 1,
    courseTests: 1,
    courseTestResults: 1,
    groupAnnouncements: 1,
    groupAssignments: 1,
    groupAttendance: 1,
    groupPerformance: 1,
    groupTeachers: 1,
    groupStudents: 1,
    auditLogs: 1,
    wisdom: 1,
  };

  private salahProgress: SalahProgress[] = [];

  private filePath = path.resolve(process.cwd(), "storage_dump.json");

  constructor() {
    this.stats = [];
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
        // Restore all arrays
        this.stats = data.stats || [];
        this.books = data.books || [];
        this.quranProgress = data.quranProgress || [];
        this.resources = data.resources || [];
        this.videos = data.videos || [];
        this.liveClasses = data.liveClasses || [];
        this.quizzes = data.quizzes || [];
        this.quizQuestions = data.quizQuestions || [];
        this.quizResults = data.quizResults || [];
        this.achievements = data.achievements || [];
        this.userAchievements = data.userAchievements || [];
        this.fees = data.fees || [];
        this.flashcards = data.flashcards || [];
        this.courseTests = data.courseTests || [];
        this.courseTestResults = data.courseTestResults || [];
        this.salahProgress = data.salahProgress || [];
        this.groups = data.groups || [];
        this.groupTeachers = data.groupTeachers || [];
        this.groupStudents = data.groupStudents || [];
        this.groupAnnouncements = data.groupAnnouncements || [];
        this.groupAssignments = data.groupAssignments || [];
        this.groupAttendance = data.groupAttendance || [];
        this.groupPerformance = data.groupPerformance || [];
        this.auditLogs = data.auditLogs || [];
        this.wisdom = data.wisdom || [];
        this.ids = data.ids || this.ids;
        console.log("[MemStorage] Data loaded from storage_dump.json");
      }
    } catch (err) {
      console.error("[MemStorage] Failed to load data:", err);
    }
  }

  private saveData() {
    try {
      const data = {
        stats: this.stats,
        books: this.books,
        quranProgress: this.quranProgress,
        resources: this.resources,
        videos: this.videos,
        liveClasses: this.liveClasses,
        quizzes: this.quizzes,
        quizQuestions: this.quizQuestions,
        quizResults: this.quizResults,
        achievements: this.achievements,
        userAchievements: this.userAchievements,
        fees: this.fees,
        flashcards: this.flashcards,
        courseTests: this.courseTests,
        courseTestResults: this.courseTestResults,
        salahProgress: this.salahProgress,
        groups: this.groups,
        groupTeachers: this.groupTeachers,
        groupStudents: this.groupStudents,
        groupAnnouncements: this.groupAnnouncements,
        groupAssignments: this.groupAssignments,
        groupAttendance: this.groupAttendance,
        groupPerformance: this.groupPerformance,
        auditLogs: this.auditLogs,
        wisdom: this.wisdom,
        ids: this.ids,
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      console.log("[MemStorage] Data saved to storage_dump.json");
    } catch (err) {
      console.error("[MemStorage] Failed to save data:", err);
    }
  }

  // Stats
  async getDailyStats(userId: string): Promise<DailyStats | undefined> {
    return this.stats.find(s => s.userId === userId && new Date(s.date).toDateString() === new Date().toDateString());
  }

  async getDailyStatsHistory(userId: string): Promise<DailyStats[]> {
    return this.stats.filter(s => s.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getDailyStatsByDate(date: Date): Promise<DailyStats[]> {
    const searchDate = date.toDateString();
    return this.stats.filter(s => new Date(s.date).toDateString() === searchDate);
  }

  async getAllDailyStats(): Promise<DailyStats[]> {
    return this.stats;
  }

  async updateDailyStats(userId: string, stats: Partial<InsertDailyStats>): Promise<DailyStats> {
    const searchDate = stats.date ? new Date(stats.date) : new Date();
    const existingIndex = this.stats.findIndex(s =>
      s.userId === userId &&
      new Date(s.date).toDateString() === searchDate.toDateString()
    );
    if (existingIndex >= 0) {
      const updated = { ...this.stats[existingIndex], ...stats };
      this.stats[existingIndex] = updated;
      return updated;
    } else {
      const newStats: DailyStats = {
        id: this.ids.dailyStats++,
        userId,
        date: searchDate,
        attendance: stats.attendance ?? false,
        quizScore: stats.quizScore ?? 0,
        hifzProgress: stats.hifzProgress ?? 0,
        salaahStreak: stats.salaahStreak ?? 0,
        salaah: stats.salaah ?? {},
      };
      this.stats.push(newStats);
      this.saveData();
      return newStats;
    }
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return this.books;
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.find(b => b.id === id);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const newBook: Book = {
      ...book,
      id: this.ids.books++,
      coverUrl: book.coverUrl ?? null,
      pdfUrl: book.pdfUrl ?? null,
      summary: book.summary ?? null,
      program: book.program ?? "General",
      language: book.language ?? "English"
    };
    this.books.push(newBook);
    this.saveData();
    return newBook;
  }

  async updateBook(id: number, data: Partial<InsertBook>): Promise<Book> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Book not found");
    const updated = { ...this.books[index], ...data };
    this.books[index] = updated as Book;
    this.saveData();
    return updated as Book;
  }

  async deleteBook(id: number): Promise<void> {
    this.books = this.books.filter(b => b.id !== id);
    this.saveData();
  }

  // Quran
  async getQuranProgress(userId: string): Promise<QuranProgress[]> {
    return this.quranProgress.filter(q => q.userId === userId);
  }

  async updateQuranProgress(userId: string, progress: InsertQuranProgress): Promise<QuranProgress> {
    const existingIndex = this.quranProgress.findIndex(
      q => q.userId === userId && q.surah === progress.surah && q.ayah === progress.ayah
    );

    if (existingIndex >= 0) {
      // Update existing
      // If status is different, update it. If same, maybe we want to toggle?
      // For now, we'll just update to whatever is passed.
      // If the goal is to "unmark", the frontend might pass a different status or we might add a delete method.
      // But typically "mark memorized" and "mark reading" are just status changes.
      // If we want to support "un-memorizing" (removing the entry or changing back to reading),
      // we can handle that here or just update.
      // Let's assume we just update the record.
      const updated = { ...this.quranProgress[existingIndex], ...progress };
      this.quranProgress[existingIndex] = updated;
      this.saveData();
      return updated;
    } else {
      const newEntry: QuranProgress = {
        ...progress,
        id: this.ids.quranProgress++,
      };
      this.quranProgress.push(newEntry);
      this.saveData();
      return newEntry;
    }
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    return this.resources;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const newResource: Resource = {
      ...resource,
      id: this.ids.resources++,
      category: resource.category ?? null,
      content: resource.content ?? null,
      url: resource.url ?? null,
      imageUrl: resource.imageUrl ?? null
    };
    this.resources.push(newResource);
    this.saveData();
    return newResource;
  }

  async updateResource(id: number, data: Partial<InsertResource>): Promise<Resource> {
    const index = this.resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Resource not found");
    const updated = { ...this.resources[index], ...data };
    this.resources[index] = updated as Resource;
    this.saveData();
    return updated as Resource;
  }

  async deleteResource(id: number): Promise<void> {
    this.resources = this.resources.filter(r => r.id !== id);
    this.saveData();
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return this.videos;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo: Video = {
      ...video,
      id: this.ids.videos++,
      thumbnail: video.thumbnail ?? null,
      duration: video.duration ?? null,
      viewCount: video.viewCount ?? 0,
      progress: video.progress ?? null
    };
    this.videos.push(newVideo);
    this.saveData();
    return newVideo;
  }

  async incrementVideoViews(id: number): Promise<void> {
    const video = this.videos.find(v => v.id === id);
    if (video) {
      video.viewCount = (video.viewCount || 0) + 1;
      this.saveData();
    }
  }

  async deleteVideo(id: number): Promise<void> {
    this.videos = this.videos.filter(v => v.id !== id);
    this.saveData();
  }

  // Live Classes
  async getLiveClasses(): Promise<LiveClass[]> {
    return this.liveClasses;
  }

  async createLiveClass(liveClass: InsertLiveClass): Promise<LiveClass> {
    const newClass: LiveClass = {
      ...liveClass,
      id: this.ids.liveClasses++,
      joinUrl: liveClass.joinUrl ?? null,
      isLive: liveClass.isLive ?? false,
      category: liveClass.category || "General"
    };
    this.liveClasses.push(newClass);
    this.saveData();
    return newClass;
  }

  async updateLiveClass(id: number, data: Partial<InsertLiveClass>): Promise<LiveClass> {
    const index = this.liveClasses.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Live class not found");
    const updated = { ...this.liveClasses[index], ...data };
    this.liveClasses[index] = updated;
    this.saveData();
    return updated;
  }

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    return this.quizzes;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.find(q => q.id === id);
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return this.quizQuestions.filter(q => q.quizId === quizId);
  }

  async submitQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const newResult: QuizResult = {
      ...result,
      id: this.ids.quizResults++,
      completedAt: new Date(),
      quizId: result.quizId ?? null // Handle optional quizId if needed, though schema says references
    };
    this.quizResults.push(newResult);
    this.saveData();
    return newResult;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const newQuiz: Quiz = { ...quiz, id: this.ids.quizzes++ };
    this.quizzes.push(newQuiz);
    this.saveData();
    return newQuiz;
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const newQuestion: QuizQuestion = {
      ...question,
      id: this.ids.quizQuestions++,
      quizId: question.quizId ?? null
    };
    this.quizQuestions.push(newQuestion);
    this.saveData();
    return newQuestion;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return this.achievements;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievements.filter(ua => ua.userId === userId);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const newAchievement: Achievement = {
      ...achievement,
      id: this.ids.achievements++,
      badgeUrl: achievement.badgeUrl ?? null
    };
    this.achievements.push(newAchievement);
    this.saveData();
    return newAchievement;
  }

  async awardAchievement(userId: string, achievementId: number): Promise<UserAchievement | undefined> {
    const existing = this.userAchievements.find(ua => ua.userId === userId && ua.achievementId === achievementId);
    if (existing) return existing;

    const newUA: UserAchievement = {
      id: this.ids.userAchievements++,
      userId,
      achievementId,
      unlockedAt: new Date()
    };
    this.userAchievements.push(newUA);
    this.saveData();
    return newUA;
  }

  // Salah
  async getSalahProgress(userId: string): Promise<SalahProgress[]> {
    return this.salahProgress.filter(p => p.userId === userId);
  }

  async updateSalahProgress(userId: string, stepId: string, completed: boolean): Promise<SalahProgress> {
    const existingIndex = this.salahProgress.findIndex(p => p.userId === userId && p.stepId === stepId);
    if (existingIndex >= 0) {
      const updated = { ...this.salahProgress[existingIndex], completed, updatedAt: new Date() };
      this.salahProgress[existingIndex] = updated;
      this.saveData();
      return updated;
    } else {
      const newEntry: SalahProgress = {
        id: this.ids.salahProgress++,
        userId,
        stepId,
        completed,
        updatedAt: new Date(),
      };
      this.salahProgress.push(newEntry);
      this.saveData();
      return newEntry;
    }
  }

  // Fees
  async getFees(): Promise<Fee[]> {
    return this.fees;
  }

  async getFeesByUser(userId: string): Promise<Fee[]> {
    return this.fees.filter(f => f.userId === userId);
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const newFee: Fee = {
      ...fee,
      id: this.ids.fees++,
      updatedAt: new Date()
    };
    this.fees.push(newFee);
    this.saveData();
    return newFee;
  }

  async updateFee(id: number, data: Partial<InsertFee>): Promise<Fee> {
    const index = this.fees.findIndex(f => f.id === id);
    if (index === -1) throw new Error("Fee record not found");
    const updated = { ...this.fees[index], ...data, updatedAt: new Date() };
    this.fees[index] = updated;
    this.saveData();
    return updated;
  }

  // Flashcards
  async getFlashcards(): Promise<Flashcard[]> {
    return this.flashcards;
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: this.ids.flashcards++,
    };
    this.flashcards.push(newFlashcard);
    this.saveData();
    return newFlashcard;
  }

  async deleteFlashcard(id: number): Promise<void> {
    this.flashcards = this.flashcards.filter(f => f.id !== id);
    this.saveData();
  }

  // Course Tests
  async getCourseTests(courseId: string): Promise<CourseTest[]> {
    return this.courseTests.filter(t => t.courseId === courseId);
  }

  async createCourseTest(test: InsertCourseTest): Promise<CourseTest> {
    const newTest: CourseTest = {
      ...test,
      id: this.ids.courseTests++,
      description: test.description ?? null,
      questions: test.questions ?? null,
      pdfName: test.pdfName ?? null,
      pdfData: test.pdfData ?? null,
      uploadedAt: test.uploadedAt ?? new Date(),
    };
    this.courseTests.push(newTest);
    this.saveData();
    return newTest;
  }

  async updateCourseTest(id: number, data: Partial<InsertCourseTest>): Promise<CourseTest> {
    const index = this.courseTests.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Course test record not found");
    const updated = { ...this.courseTests[index], ...data };
    this.courseTests[index] = updated;
    this.saveData();
    return updated;
  }

  async deleteCourseTest(id: number): Promise<void> {
    this.courseTestResults = this.courseTestResults.filter(r => r.testId !== id);
    this.courseTests = this.courseTests.filter(t => t.id !== id);
    this.saveData();
  }

  async getCourseTestResults(userId: string): Promise<CourseTestResult[]> {
    return this.courseTestResults.filter(r => r.userId === userId);
  }

  async getAllCourseTestResults(testId: number): Promise<any[]> {
    return this.courseTestResults
      .filter(r => r.testId === testId)
      .map(r => {
        const student = this.users.find(u => u.id === r.userId);
        return {
          ...r,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student"
        };
      });
  }

  async submitCourseTestResult(result: InsertCourseTestResult): Promise<CourseTestResult> {
    const newResult: CourseTestResult = {
      ...result,
      id: this.ids.courseTestResults++,
      testId: result.testId ?? null,
      score: result.score ?? null,
      total: result.total ?? null,
      submissionText: result.submissionText ?? null,
      submissionData: result.submissionData ?? null,
      submissionName: result.submissionName ?? null,
      completedAt: result.completedAt ?? new Date(),
    };
    this.courseTestResults.push(newResult);
    this.saveData();
    return newResult;
  }

  // Group Management Methods
  async getGroups(options: { search?: string; status?: string; category?: string; offset?: number; limit?: number } = {}): Promise<{ groups: GroupWithStats[]; total: number }> {
    let filtered = this.groups;
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(g => g.status === options.status);
    }
    if (options && options.category && options.category !== 'all') {
      const cat = options.category.toLowerCase();
      filtered = filtered.filter(g => g.category?.toLowerCase() === cat);
    }
    if (options.search) {
      const s = options.search.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(s));
    }

    const total = filtered.length;
    const paginated = filtered.slice(options.offset || 0, (options.offset || 0) + (options.limit || 50));

    const groupsWithStats = paginated.map(g => {
      const teacherCount = this.groupTeachers.filter(gt => gt.groupId === g.id).length;
      const studentCount = this.groupStudents.filter(gs => gs.groupId === g.id).length;
      return {
        ...g,
        teacherCount,
        studentCount
      };
    });

    return { groups: groupsWithStats, total };
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.find(g => g.id === id);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const newGroup: Group = {
      ...group,
      id: Math.random().toString(36).substring(7),
      description: group.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: group.status || 'active',
      category: group.category || 'General',
      capacity: group.capacity ?? null,
      isLocked: group.isLocked ?? false,
    };
    this.groups.push(newGroup);
    this.saveData();
    return newGroup;
  }

  async updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group> {
    const index = this.groups.findIndex(g => g.id === id);
    if (index === -1) throw new Error("Group not found");
    this.groups[index] = { ...this.groups[index], ...group, updatedAt: new Date() } as Group;
    this.saveData();
    return this.groups[index];
  }

  async deleteGroup(id: string): Promise<void> {
    this.groupAnnouncements = this.groupAnnouncements.filter(a => a.groupId !== id);
    this.groupAssignments = this.groupAssignments.filter(a => a.groupId !== id);
    this.groupAttendance = this.groupAttendance.filter(a => a.groupId !== id);
    this.groupPerformance = this.groupPerformance.filter(p => p.groupId !== id);
    this.groupTeachers = this.groupTeachers.filter(gt => gt.groupId !== id);
    this.groupStudents = this.groupStudents.filter(gs => gs.groupId !== id);
    this.groups = this.groups.filter(g => g.id !== id);
    this.saveData();
  }

  async lockGroup(id: string, locked: boolean): Promise<Group> {
    const index = this.groups.findIndex(g => g.id === id);
    if (index === -1) throw new Error("Group not found");
    this.groups[index] = { ...this.groups[index], isLocked: locked, updatedAt: new Date() } as Group;
    this.saveData();
    return this.groups[index];
  }

  async getGroupTeachers(groupId: string): Promise<User[]> {
    const userIds = this.groupTeachers.filter(gt => gt.groupId === groupId).map(gt => gt.userId);
    const { authStorage } = await import("./replit_integrations/auth/storage");
    const allUsers = await authStorage.getUsers();
    return allUsers.filter(u => userIds.includes(u.id));
  }

  async assignTeacherToGroup(groupId: string, userId: string): Promise<void> {
    this.groupTeachers.push({
      id: this.ids.groupTeachers++,
      groupId,
      userId,
      assignedAt: new Date()
    });
    this.saveData();
  }

  async removeTeacherFromGroup(groupId: string, userId: string): Promise<void> {
    this.groupTeachers = this.groupTeachers.filter(gt => !(gt.groupId === groupId && gt.userId === userId));
    this.saveData();
  }

  async getGroupStudents(groupId: string): Promise<User[]> {
    const userIds = this.groupStudents.filter(gs => gs.groupId === groupId).map(gs => gs.userId);
    const { authStorage } = await import("./replit_integrations/auth/storage");
    const allUsers = await authStorage.getUsers();
    return allUsers.filter(u => userIds.includes(u.id));
  }

  async addStudentToGroup(groupId: string, userId: string): Promise<void> {
    this.groupStudents.push({
      id: this.ids.groupStudents++,
      groupId,
      userId,
      joinedAt: new Date()
    });
    this.saveData();
  }

  async removeStudentFromGroup(groupId: string, userId: string): Promise<void> {
    this.groupStudents = this.groupStudents.filter(gs => !(gs.groupId === groupId && gs.userId === userId));
    this.saveData();
  }

  async transferStudent(userId: string, fromGroupId: string, toGroupId: string): Promise<void> {
    await this.removeStudentFromGroup(fromGroupId, userId);
    await this.addStudentToGroup(toGroupId, userId);
  }

  async getUserGroups(userId: string, role: string): Promise<Group[]> {
    if (role === 'teacher') {
      const gids = this.groupTeachers.filter(gt => gt.userId === userId).map(gt => gt.groupId);
      return this.groups.filter(g => gids.includes(g.id));
    } else {
      const gids = this.groupStudents.filter(gs => gs.userId === userId).map(gs => gs.groupId);
      return this.groups.filter(g => gids.includes(g.id));
    }
  }

  async getGroupAnnouncements(groupId: string): Promise<GroupAnnouncement[]> {
    return this.groupAnnouncements.filter(a => a.groupId === groupId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getGroupAnnouncement(id: number): Promise<GroupAnnouncement | undefined> {
    return this.groupAnnouncements.find(a => a.id === id);
  }

  async deleteGroupAnnouncement(id: number): Promise<void> {
    this.groupAnnouncements = this.groupAnnouncements.filter(a => a.id !== id);
    this.saveData();
  }

  async getCategoryAnnouncements(groupIds: string[]): Promise<GroupAnnouncement[]> {
    return this.groupAnnouncements.filter(a => groupIds.includes(a.groupId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createGroupAnnouncement(announcement: InsertGroupAnnouncement): Promise<GroupAnnouncement> {
    const newAnn: GroupAnnouncement = {
      ...announcement,
      id: this.ids.groupAnnouncements++,
      createdAt: new Date(),
      fileUrl: announcement.fileUrl ?? null,
      fileType: announcement.fileType ?? 'text',
      replyToId: announcement.replyToId ?? null,
      replyToContent: announcement.replyToContent ?? null,
      replyToAuthor: announcement.replyToAuthor ?? null,
    };
    this.groupAnnouncements.push(newAnn);
    this.saveData();
    return newAnn;
  }

  async getGroupAssignments(groupId: string): Promise<GroupAssignment[]> {
    return this.groupAssignments.filter(a => a.groupId === groupId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGroupAssignment(assignment: InsertGroupAssignment): Promise<GroupAssignment> {
    const newAss: GroupAssignment = {
      ...assignment,
      id: this.ids.groupAssignments++,
      createdAt: new Date(),
      fileUrl: assignment.fileUrl ?? null,
      fileType: assignment.fileType ?? null,
      dueDate: assignment.dueDate ?? null,
      description: assignment.description ?? null,
    };
    this.groupAssignments.push(newAss);
    this.saveData();
    return newAss;
  }

  async getGroupAttendance(groupId: string, date?: Date): Promise<GroupAttendance[]> {
    let filtered = this.groupAttendance.filter(a => a.groupId === groupId);
    if (date) {
      const d = date.toDateString();
      filtered = filtered.filter(a => a.date.toDateString() === d);
    }
    return filtered;
  }

  async getUserAttendance(userId: string): Promise<GroupAttendance[]> {
    return this.groupAttendance.filter(a => a.userId === userId).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async recordAttendance(attendance: InsertGroupAttendance): Promise<GroupAttendance> {
    const newAtt: GroupAttendance = {
      ...attendance,
      id: this.ids.groupAttendance++,
      date: attendance.date || new Date()
    };
    this.groupAttendance.push(newAtt);
    this.saveData();
    return newAtt;
  }

  async getGroupPerformance(groupId: string, userId?: string): Promise<GroupPerformance[]> {
    let filtered = this.groupPerformance.filter(p => p.groupId === groupId);
    if (userId) filtered = filtered.filter(p => p.userId === userId);
    return filtered;
  }

  async recordPerformance(performance: InsertGroupPerformance): Promise<GroupPerformance> {
    const newPerf: GroupPerformance = {
      ...performance,
      id: this.ids.groupPerformance++,
      recordedAt: new Date(),
      score: performance.score ?? null,
      notes: performance.notes ?? null,
    };
    this.groupPerformance.push(newPerf);
    this.saveData();
    return newPerf;
  }

  async getSystemAnalytics(): Promise<any> {
    return {
      totalGroups: this.groups.length,
      totalStudents: this.groupStudents.length,
      totalAnnouncements: this.groupAnnouncements.length,
      totalAssignments: this.groupAssignments.length
    };
  }

  async getGroupAnalytics(groupId: string): Promise<any> {
    const g = this.groups.find(g => g.id === groupId);
    return {
      groupName: g?.name,
      studentCount: this.groupStudents.filter(gs => gs.groupId === groupId).length,
      announcementCount: this.groupAnnouncements.filter(a => a.groupId === groupId).length
    };
  }

  async getAuditLogs(options?: { adminId?: string; offset?: number; limit?: number }): Promise<{ logs: AuditLog[]; total: number }> {
    let filtered = this.auditLogs;
    if (options?.adminId) filtered = filtered.filter(l => l.adminId === options.adminId);
    const total = filtered.length;
    const logs = filtered.slice(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50));
    return { logs, total };
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: this.ids.auditLogs++,
      createdAt: new Date(),
      details: log.details || null
    };
    this.auditLogs.push(newLog);
    this.saveData();
    return newLog;
  }

  async getWisdom(): Promise<Wisdom[]> {
    return this.wisdom.sort((a, b) => b.id - a.id);
  }

  async getDailyWisdom(): Promise<Wisdom | undefined> {
    if (this.wisdom.length === 0) return undefined;
    const today = new Date().toDateString();
    const todayWisdom = this.wisdom.filter(w => new Date(w.createdAt).toDateString() === today);
    if (todayWisdom.length > 0) return todayWisdom.sort((a, b) => b.id - a.id)[0];
    return this.wisdom.sort((a, b) => b.id - a.id)[0];
  }

  async createWisdom(wisdom: InsertWisdom): Promise<Wisdom> {
    const newWisdom: Wisdom = {
      ...wisdom,
      id: this.ids.wisdom++,
      createdAt: new Date(),
      author: wisdom.author ?? null,
    };
    this.wisdom.push(newWisdom);
    this.saveData();
    return newWisdom;
  }
}

export class DatabaseStorage implements IStorage {
  // Stats
  async getDailyStats(userId: string): Promise<DailyStats | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [stats] = await db.select().from(daily_stats).where(
      and(
        eq(daily_stats.userId, userId),
        eq(daily_stats.date, today)
      )
    ).limit(1);
    return stats;
  }

  async getDailyStatsHistory(userId: string): Promise<DailyStats[]> {
    return await db.select().from(daily_stats)
      .where(eq(daily_stats.userId, userId))
      .orderBy(desc(daily_stats.date));
  }

  async getDailyStatsByDate(date: Date): Promise<DailyStats[]> {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    return await db.select().from(daily_stats).where(eq(daily_stats.date, searchDate));
  }

  async getAllDailyStats(): Promise<DailyStats[]> {
    return await db.select().from(daily_stats);
  }

  async updateDailyStats(userId: string, stats: Partial<InsertDailyStats>): Promise<DailyStats> {
    const searchDate = stats.date ? new Date(stats.date) : new Date();
    searchDate.setHours(0, 0, 0, 0);

    const [existing] = await db.select().from(daily_stats).where(
      and(
        eq(daily_stats.userId, userId),
        eq(daily_stats.date, searchDate)
      )
    );

    if (existing) {
      const [updated] = await db.update(daily_stats)
        .set({ ...stats, date: searchDate })
        .where(eq(daily_stats.id, existing.id))
        .returning();
      return updated;
    } else {
      const { id, ...statsToInsert } = stats as any; // Avoid ID collision
      const [newStats] = await db.insert(daily_stats)
        .values({
          userId,
          date: searchDate,
          attendance: stats.attendance ?? false,
          quizScore: stats.quizScore ?? 0,
          hifzProgress: stats.hifzProgress ?? 0,
          salaahStreak: stats.salaahStreak ?? 0,
          salaah: stats.salaah ?? {},
        })
        .returning();
      return newStats;
    }
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, data: Partial<InsertBook>): Promise<Book> {
    const [updated] = await db.update(books)
      .set(data)
      .where(eq(books.id, id))
      .returning();
    if (!updated) throw new Error("Book not found");
    return updated;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Quran
  async getQuranProgress(userId: string): Promise<QuranProgress[]> {
    return await db.select().from(quran_progress).where(eq(quran_progress.userId, userId));
  }

  async updateQuranProgress(userId: string, progress: InsertQuranProgress): Promise<QuranProgress> {
    const [existing] = await db.select().from(quran_progress).where(
      and(
        eq(quran_progress.userId, userId),
        eq(quran_progress.surah, progress.surah),
        eq(quran_progress.ayah, progress.ayah)
      )
    );

    if (existing) {
      const [updated] = await db.update(quran_progress)
        .set(progress)
        .where(eq(quran_progress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db.insert(quran_progress).values({ ...progress, userId }).returning();
      return newEntry;
    }
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async updateResource(id: number, data: Partial<InsertResource>): Promise<Resource> {
    const [updated] = await db.update(resources)
      .set(data)
      .where(eq(resources.id, id))
      .returning();
    if (!updated) throw new Error("Resource not found");
    return updated;
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos) as Video[];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo as Video;
  }

  async incrementVideoViews(id: number): Promise<void> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (video) {
      await db.update(videos)
        .set({ viewCount: (video.viewCount || 0) + 1 })
        .where(eq(videos.id, id));
    }
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Live Classes
  async getLiveClasses(): Promise<LiveClass[]> {
    return await db.select().from(live_classes);
  }

  async createLiveClass(liveClass: InsertLiveClass): Promise<LiveClass> {
    const [newClass] = await db.insert(live_classes).values(liveClass).returning();
    return newClass;
  }

  async updateLiveClass(id: number, data: Partial<InsertLiveClass>): Promise<LiveClass> {
    const [updated] = await db.update(live_classes)
      .set(data)
      .where(eq(live_classes.id, id))
      .returning();
    if (!updated) throw new Error("Live class not found");
    return updated;
  }

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes);
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db.select().from(quiz_questions).where(eq(quiz_questions.quizId, quizId));
  }

  async submitQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [newResult] = await db.insert(quiz_results).values({
      ...result,
      completedAt: new Date(),
    }).returning();
    return newResult;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [newQuestion] = await db.insert(quiz_questions).values(question).returning();
    return newQuestion;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db.select().from(user_achievements).where(eq(user_achievements.userId, userId));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async awardAchievement(userId: string, achievementId: number): Promise<UserAchievement | undefined> {
    const [existing] = await db.select().from(user_achievements).where(
      and(
        eq(user_achievements.userId, userId),
        eq(user_achievements.achievementId, achievementId)
      )
    );
    if (existing) return existing;

    const [newUA] = await db.insert(user_achievements).values({
      userId,
      achievementId,
      unlockedAt: new Date()
    }).returning();
    return newUA;
  }

  // Salah
  async getSalahProgress(userId: string): Promise<SalahProgress[]> {
    return await db.select().from(salah_progress).where(eq(salah_progress.userId, userId));
  }

  async updateSalahProgress(userId: string, stepId: string, completed: boolean): Promise<SalahProgress> {
    const [existing] = await db.select().from(salah_progress).where(
      and(
        eq(salah_progress.userId, userId),
        eq(salah_progress.stepId, stepId)
      )
    );
    if (existing) {
      const [updated] = await db.update(salah_progress)
        .set({ completed, updatedAt: new Date() })
        .where(eq(salah_progress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newEntry] = await db.insert(salah_progress).values({
        userId,
        stepId,
        completed,
        updatedAt: new Date(),
      }).returning();
      return newEntry;
    }
  }

  // Fees
  async getFees(): Promise<Fee[]> {
    return await db.select().from(fees);
  }

  async getFeesByUser(userId: string): Promise<Fee[]> {
    return await db.select().from(fees).where(eq(fees.userId, userId));
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const [newFee] = await db.insert(fees).values({
      ...fee,
      updatedAt: new Date()
    }).returning();
    return newFee;
  }

  async updateFee(id: number, data: Partial<InsertFee>): Promise<Fee> {
    const [updated] = await db.update(fees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fees.id, id))
      .returning();
    if (!updated) throw new Error("Fee record not found");
    return updated;
  }

  // Flashcards
  async getFlashcards(): Promise<Flashcard[]> {
    return await db.select().from(flashcards) as Flashcard[];
  }

  async createFlashcard(flashcardData: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcardData).returning();
    return newFlashcard as Flashcard;
  }

  async deleteFlashcard(id: number): Promise<void> {
    await db.delete(flashcards).where(eq(flashcards.id, id));
  }

  // Course Tests
  async getCourseTests(courseId: string): Promise<CourseTest[]> {
    return await db.select().from(course_tests).where(eq(course_tests.courseId, courseId));
  }

  async createCourseTest(test: InsertCourseTest): Promise<CourseTest> {
    const [newTest] = await db.insert(course_tests).values(test).returning();
    return newTest;
  }

  async deleteCourseTest(id: number): Promise<void> {
    await db.delete(course_test_results).where(eq(course_test_results.testId, id));
    await db.delete(course_tests).where(eq(course_tests.id, id));
  }

  async updateCourseTest(id: number, data: Partial<InsertCourseTest>): Promise<CourseTest> {
    const [updated] = await db.update(course_tests)
      .set(data)
      .where(eq(course_tests.id, id))
      .returning();
    if (!updated) throw new Error("Course test record not found");
    return updated;
  }

  async getCourseTestResults(userId: string): Promise<CourseTestResult[]> {
    return await db.select().from(course_test_results).where(eq(course_test_results.userId, userId));
  }

  async getAllCourseTestResults(testId: number): Promise<any[]> {
    return await db.select({
      id: course_test_results.id,
      userId: course_test_results.userId,
      testId: course_test_results.testId,
      score: course_test_results.score,
      total: course_test_results.total,
      submissionText: course_test_results.submissionText,
      submissionData: course_test_results.submissionData,
      submissionName: course_test_results.submissionName,
      teacherFeedback: course_test_results.teacherFeedback,
      gradedBy: course_test_results.gradedBy,
      gradedAt: course_test_results.gradedAt,
      completedAt: course_test_results.completedAt,
      studentName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
    })
      .from(course_test_results)
      .leftJoin(users, eq(course_test_results.userId, users.id))
      .where(eq(course_test_results.testId, testId));
  }

  async submitCourseTestResult(result: InsertCourseTestResult): Promise<CourseTestResult> {
    const [newResult] = await db.insert(course_test_results).values(result).returning();
    return newResult;
  }

  async updateCourseTestResult(id: number, score: number, total: number, feedback: string, graderId: string): Promise<CourseTestResult> {
    const [updated] = await db.update(course_test_results)
      .set({
        score,
        total,
        teacherFeedback: feedback,
        gradedBy: graderId,
        gradedAt: new Date()
      })
      .where(eq(course_test_results.id, id))
      .returning();
    return updated;
  }

  // Groups
  async getGroups(options: { search?: string, status?: string, category?: string, offset?: number, limit?: number } = {}): Promise<{ groups: GroupWithStats[], total: number }> {
    const { search, status, category, offset = 0, limit = 50 } = options;
    let conditions = [];

    if (search) {
      conditions.push(ilike(groups.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(groups.status, status));
    }
    if (category) {
      conditions.push(eq(groups.category, category));
    }

    const whereClause = conditions.length > 0 ? (conditions.length > 1 ? and(...conditions) : conditions[0]) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(groups).where(whereClause);

    // Fetch stats for each group
    const results = await db.select().from(groups)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(groups.createdAt));

    const groupsWithStats = await Promise.all(results.map(async (g) => {
      const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(group_teachers).where(eq(group_teachers.groupId, g.id));
      const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(group_students).where(eq(group_students.groupId, g.id));
      return {
        ...g,
        teacherCount: Number(teacherCount.count),
        studentCount: Number(studentCount.count)
      };
    }));

    return { groups: groupsWithStats, total: Number(countResult.count) };
  }

  async getGroup(id: string): Promise<GroupWithStats | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    if (!group) return undefined;

    const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(group_teachers).where(eq(group_teachers.groupId, id));
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(group_students).where(eq(group_students.groupId, id));

    return {
      ...group,
      teacherCount: Number(teacherCount.count),
      studentCount: Number(studentCount.count)
    };
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    try {
      const [newGroup] = await db.insert(groups).values({
        name: groupData.name,
        description: groupData.description || null,
        category: groupData.category || 'General',
        capacity: groupData.capacity,
        status: groupData.status || 'active'
      }).returning();
      return newGroup;
    } catch (err: any) {
      // If UNIQUE constraint violation (group name already exists), find and return existing
      if (err?.code === '23505' || err?.message?.includes('unique') || err?.message?.includes('duplicate')) {
        const [existing] = await db.select().from(groups).where(eq(groups.name, groupData.name));
        if (existing) {
          console.log(`[DB] Group "${groupData.name}" already exists, skipping.`);
          return existing;
        }
      }
      throw err;
    }
  }

  async updateGroup(id: string, groupData: Partial<InsertGroup>): Promise<Group> {
    const [updated] = await db.update(groups)
      .set({ ...groupData, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    if (!updated) throw new Error("Group not found");
    return updated;
  }

  async deleteGroup(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // First, delete all records from related tables that reference this group
      await tx.delete(group_announcements).where(eq(group_announcements.groupId, id));
      await tx.delete(group_assignments).where(eq(group_assignments.groupId, id));
      await tx.delete(group_attendance).where(eq(group_attendance.groupId, id));
      await tx.delete(group_performance).where(eq(group_performance.groupId, id));
      await tx.delete(group_teachers).where(eq(group_teachers.groupId, id));
      await tx.delete(group_students).where(eq(group_students.groupId, id));

      // Finally, delete the group itself
      await tx.delete(groups).where(eq(groups.id, id));
    });
  }

  async lockGroup(id: string, locked: boolean): Promise<Group> {
    const [updated] = await db.update(groups)
      .set({ isLocked: locked, updatedAt: new Date() } as any)
      .where(eq(groups.id, id))
      .returning();
    if (!updated) throw new Error("Group not found");
    return updated;
  }

  async getGroupTeachers(groupId: string): Promise<User[]> {
    return await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
      .from(group_teachers)
      .innerJoin(users, eq(group_teachers.userId, users.id))
      .where(eq(group_teachers.groupId, groupId)) as User[];
  }

  async assignTeacherToGroup(groupId: string, userId: string): Promise<void> {
    try {
      await db.insert(group_teachers).values({ groupId, userId });
    } catch (err: any) {
      // Ignore duplicate key errors (already assigned)
      if (err?.code !== '23505' && !err?.message?.includes('duplicate')) throw err;
    }
  }

  async removeTeacherFromGroup(groupId: string, userId: string): Promise<void> {
    await db.delete(group_teachers).where(and(eq(group_teachers.groupId, groupId), eq(group_teachers.userId, userId)));
  }

  async getGroupStudents(groupId: string): Promise<User[]> {
    return await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
      .from(group_students)
      .innerJoin(users, eq(group_students.userId, users.id))
      .where(eq(group_students.groupId, groupId)) as User[];
  }

  async addStudentToGroup(groupId: string, userId: string): Promise<void> {
    try {
      await db.insert(group_students).values({ groupId, userId });
    } catch (err: any) {
      // Ignore duplicate key errors (already assigned)
      if (err?.code !== '23505' && !err?.message?.includes('duplicate')) throw err;
    }
  }

  async removeStudentFromGroup(groupId: string, userId: string): Promise<void> {
    await db.delete(group_students).where(and(eq(group_students.groupId, groupId), eq(group_students.userId, userId)));
  }

  async transferStudent(userId: string, fromGroupId: string, toGroupId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(group_students).where(and(eq(group_students.groupId, fromGroupId), eq(group_students.userId, userId)));
      await tx.insert(group_students).values({ groupId: toGroupId, userId });
    });
  }

  async getUserGroups(userId: string, role: string): Promise<GroupWithStats[]> {
    let baseGroups: Group[] = [];
    if (role === 'teacher') {
      const results = await db.select({
        id: groups.id,
        name: groups.name,
        category: groups.category,
        capacity: groups.capacity,
        status: groups.status,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt
      })
        .from(group_teachers)
        .innerJoin(groups, eq(group_teachers.groupId, groups.id))
        .where(eq(group_teachers.userId, userId));
      baseGroups = results as Group[];
    } else {
      const results = await db.select({
        id: groups.id,
        name: groups.name,
        category: groups.category,
        capacity: groups.capacity,
        status: groups.status,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt
      })
        .from(group_students)
        .innerJoin(groups, eq(group_students.groupId, groups.id))
        .where(eq(group_students.userId, userId));
      baseGroups = results as Group[];
    }

    const groupsWithStats = await Promise.all(baseGroups.map(async (g) => {
      const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(group_teachers).where(eq(group_teachers.groupId, g.id));
      const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(group_students).where(eq(group_students.groupId, g.id));
      return {
        ...g,
        teacherCount: Number(teacherCount.count),
        studentCount: Number(studentCount.count)
      };
    }));

    return groupsWithStats;
  }

  async getGroupAnnouncements(groupId: string): Promise<GroupAnnouncement[]> {
    return await db.select().from(group_announcements)
      .where(eq(group_announcements.groupId, groupId))
      .orderBy(desc(group_announcements.createdAt));
  }

  async getGroupAnnouncement(id: number): Promise<GroupAnnouncement | undefined> {
    const [ann] = await db.select().from(group_announcements).where(eq(group_announcements.id, id));
    return ann;
  }

  async deleteGroupAnnouncement(id: number): Promise<void> {
    await db.delete(group_announcements).where(eq(group_announcements.id, id));
  }

  async getCategoryAnnouncements(groupIds: string[]): Promise<GroupAnnouncement[]> {
    if (groupIds.length === 0) return [];
    return await db.select().from(group_announcements)
      .where(sql`${group_announcements.groupId} IN ${groupIds}`)
      .orderBy(desc(group_announcements.createdAt));
  }

  async createGroupAnnouncement(announcement: InsertGroupAnnouncement): Promise<GroupAnnouncement> {
    const [res] = await db.insert(group_announcements).values({
      groupId: announcement.groupId,
      authorId: announcement.authorId,
      content: announcement.content,
      fileUrl: announcement.fileUrl,
      fileType: announcement.fileType || 'text'
    }).returning();
    return res;
  }

  async getGroupAssignments(groupId: string): Promise<GroupAssignment[]> {
    return await db.select().from(group_assignments)
      .where(eq(group_assignments.groupId, groupId))
      .orderBy(desc(group_assignments.createdAt));
  }

  async createGroupAssignment(assignment: InsertGroupAssignment): Promise<GroupAssignment> {
    const [res] = await db.insert(group_assignments).values({
      groupId: assignment.groupId,
      authorId: assignment.authorId,
      title: assignment.title,
      description: assignment.description,
      fileUrl: assignment.fileUrl,
      fileType: assignment.fileType,
      dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null
    }).returning();
    return res;
  }

  async getGroupAttendance(groupId: string, date?: Date): Promise<GroupAttendance[]> {
    let conditions = [eq(group_attendance.groupId, groupId)];
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      conditions.push(eq(group_attendance.date, d));
    }
    return await db.select().from(group_attendance).where(and(...conditions));
  }

  async getUserAttendance(userId: string): Promise<GroupAttendance[]> {
    return await db.select().from(group_attendance)
      .where(eq(group_attendance.userId, userId))
      .orderBy(desc(group_attendance.date));
  }

  async recordAttendance(attendance: InsertGroupAttendance): Promise<GroupAttendance> {
    const date = attendance.date ? new Date(attendance.date) : new Date();
    date.setHours(0, 0, 0, 0);

    // Check for existing record to update instead of insert
    const [existing] = await db.select().from(group_attendance).where(
      and(
        eq(group_attendance.groupId, attendance.groupId),
        eq(group_attendance.userId, attendance.userId),
        eq(group_attendance.date, date)
      )
    );

    let result;
    if (existing) {
      [result] = await db.update(group_attendance)
        .set({ status: attendance.status })
        .where(eq(group_attendance.id, existing.id))
        .returning();
    } else {
      [result] = await db.insert(group_attendance).values({
        groupId: attendance.groupId,
        userId: attendance.userId,
        status: attendance.status,
        date: date
      }).returning();
    }

    // Also update daily_stats for progress report integration
    // Map 'present' or 'late' to true, 'absent' to false
    const isPresent = attendance.status === 'present' || attendance.status === 'late';
    await this.updateDailyStats(attendance.userId, {
      date: date,
      attendance: isPresent
    });

    return result;
  }

  async getGroupPerformance(groupId: string, userId?: string): Promise<GroupPerformance[]> {
    let conditions = [eq(group_performance.groupId, groupId)];
    if (userId) {
      conditions.push(eq(group_performance.userId, userId));
    }
    return await db.select().from(group_performance).where(and(...conditions));
  }

  async recordPerformance(performance: InsertGroupPerformance): Promise<GroupPerformance> {
    const [res] = await db.insert(group_performance).values({
      groupId: performance.groupId,
      userId: performance.userId,
      score: performance.score,
      notes: performance.notes
    }).returning();
    return res;
  }

  async getSystemAnalytics(): Promise<any> {
    const [groupCount] = await db.select({ count: sql<number>`count(*)` }).from(groups);
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'student'));
    const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'teacher'));

    return {
      totalGroups: Number(groupCount.count),
      totalStudents: Number(studentCount.count),
      totalTeachers: Number(teacherCount.count),
    };
  }

  async getGroupAnalytics(groupId: string): Promise<any> {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(group_students).where(eq(group_students.groupId, groupId));
    const attendanceStats = await db.select({
      status: group_attendance.status,
      count: sql<number>`count(*)`
    })
      .from(group_attendance)
      .where(eq(group_attendance.groupId, groupId))
      .groupBy(group_attendance.status);

    return {
      studentCount: Number(studentCount.count),
      attendanceStats
    };
  }

  async getAuditLogs(options: { adminId?: string, offset?: number, limit?: number } = {}): Promise<{ logs: AuditLog[], total: number }> {
    const { adminId, offset = 0, limit = 50 } = options;
    let queryBuilder = db.select().from(audit_logs);
    let conditions = [];
    if (adminId) conditions.push(eq(audit_logs.adminId, adminId));

    const whereClause = conditions.length > 0 ? (conditions.length > 1 ? and(...conditions) : conditions[0]) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(audit_logs).where(whereClause);
    const results = await db.select().from(audit_logs)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(audit_logs.createdAt));

    return { logs: results, total: Number(countResult.count) };
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(audit_logs).values(log).returning();
    return newLog;
  }

  async getWisdom(): Promise<Wisdom[]> {
    return await db.select().from(wisdom).orderBy(desc(wisdom.id));
  }

  async getDailyWisdom(): Promise<Wisdom | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayW] = await db.select()
      .from(wisdom)
      .where(sql`date_trunc('day', ${wisdom.createdAt}) = ${today}`)
      .orderBy(desc(wisdom.id))
      .limit(1);

    if (todayW) return todayW;

    const [latest] = await db.select().from(wisdom).orderBy(desc(wisdom.id)).limit(1);
    return latest;
  }

  async createWisdom(wisdomData: InsertWisdom): Promise<Wisdom> {
    const [res] = await db.insert(wisdom).values(wisdomData).returning();
    return res;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

