import { z } from 'zod';
import { 
  insertDailyStatsSchema, 
  insertBookSchema, 
  insertQuranProgressSchema, 
  insertResourceSchema, 
  insertVideoSchema, 
  insertLiveClassSchema, 
  insertQuizSchema, 
  insertQuizResultSchema,
  insertAchievementSchema,
  daily_stats,
  books,
  quran_progress,
  resources,
  videos,
  live_classes,
  quizzes,
  quiz_questions,
  quiz_results,
  achievements,
  user_achievements,
  users
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Stats
  dailyStats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats/daily' as const,
      responses: {
        200: z.custom<typeof daily_stats.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'POST' as const,
      path: '/api/stats/daily' as const,
      input: insertDailyStatsSchema.partial(),
      responses: {
        200: z.custom<typeof daily_stats.$inferSelect>(),
      }
    }
  },
  
  // Books (Darse Nizami)
  books: {
    list: {
      method: 'GET' as const,
      path: '/api/books' as const,
      responses: {
        200: z.array(z.custom<typeof books.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/books/:id' as const,
      responses: {
        200: z.custom<typeof books.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },

  // Quran & Tajweed
  quran: {
    progress: {
      method: 'GET' as const,
      path: '/api/quran/progress' as const,
      responses: {
        200: z.array(z.custom<typeof quran_progress.$inferSelect>()),
      }
    },
    updateProgress: {
      method: 'POST' as const,
      path: '/api/quran/progress' as const,
      input: insertQuranProgressSchema,
      responses: {
        200: z.custom<typeof quran_progress.$inferSelect>(),
      }
    }
  },

  // Resources
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/resources' as const,
      responses: {
        200: z.array(z.custom<typeof resources.$inferSelect>()),
      }
    }
  },

  // Videos
  videos: {
    list: {
      method: 'GET' as const,
      path: '/api/videos' as const,
      responses: {
        200: z.array(z.custom<typeof videos.$inferSelect>()),
      }
    }
  },

  // Live Classes
  liveClasses: {
    list: {
      method: 'GET' as const,
      path: '/api/classes/live' as const,
      responses: {
        200: z.array(z.custom<typeof live_classes.$inferSelect>()),
      }
    }
  },

  // Quizzes
  quizzes: {
    list: {
      method: 'GET' as const,
      path: '/api/quizzes' as const,
      responses: {
        200: z.array(z.custom<typeof quizzes.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/quizzes/:id' as const,
      responses: {
        200: z.object({
          quiz: z.custom<typeof quizzes.$inferSelect>(),
          questions: z.array(z.custom<typeof quiz_questions.$inferSelect>())
        }),
        404: errorSchemas.notFound,
      }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/quizzes/:id/submit' as const,
      input: z.object({ score: z.number() }),
      responses: {
        201: z.custom<typeof quiz_results.$inferSelect>(),
      }
    }
  },

  // Achievements
  achievements: {
    list: {
      method: 'GET' as const,
      path: '/api/achievements' as const,
      responses: {
        200: z.array(z.custom<typeof achievements.$inferSelect>()),
      }
    },
    myAchievements: {
      method: 'GET' as const,
      path: '/api/achievements/me' as const,
      responses: {
        200: z.array(z.custom<typeof user_achievements.$inferSelect>()),
      }
    }
  },

  // Leaderboard
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: {
        200: z.array(z.object({
          username: z.string(),
          points: z.number()
        })),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
