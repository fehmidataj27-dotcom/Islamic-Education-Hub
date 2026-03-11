import { z } from 'zod';
import {
  insertDailyStatsSchema,
  insertBookSchema,
  insertQuranProgressSchema,
  insertResourceSchema,
  insertVideoSchema,
  insertLiveClassSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertQuizResultSchema,
  insertAchievementSchema,
  insertFeeSchema,
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
  users,
  fees,
  course_tests,
  course_test_results,
  insertCourseTestSchema,
  insertCourseTestResultSchema
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
    },
    bulkUpdate: {
      method: 'POST' as const,
      path: '/api/stats/bulk' as const,
      input: z.object({
        date: z.string().optional(),
        groupId: z.string().optional(),
        updates: z.array(z.object({
          userId: z.string(),
          attendance: z.boolean().optional(),
          status: z.string().optional(),
        }))
      }),
      responses: {
        200: z.object({ success: z.boolean(), count: z.number() }),
      }
    },
    getByDate: {
      method: 'GET' as const,
      path: '/api/stats/daily/date/:date' as const,
      responses: {
        200: z.array(z.custom<typeof daily_stats.$inferSelect>()),
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/stats/daily/history' as const,
      responses: {
        200: z.array(z.custom<typeof daily_stats.$inferSelect>()),
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
    },
    create: {
      method: 'POST' as const,
      path: '/api/books' as const,
      input: insertBookSchema,
      responses: {
        201: z.custom<typeof books.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/books/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
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
    },
    create: {
      method: 'POST' as const,
      path: '/api/resources' as const,
      input: insertResourceSchema,
      responses: {
        201: z.custom<typeof resources.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resources/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/resources/:id' as const,
      input: insertResourceSchema.partial(),
      responses: {
        200: z.custom<typeof resources.$inferSelect>(),
        404: errorSchemas.notFound,
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
    },
    create: {
      method: 'POST' as const,
      path: '/api/videos' as const,
      input: insertVideoSchema,
      responses: {
        201: z.custom<typeof videos.$inferSelect>(),
      }
    },
    incrementView: {
      method: 'PATCH' as const,
      path: '/api/videos/:id/view' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/videos/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
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
    },
    create: {
      method: 'POST' as const,
      path: '/api/classes/live' as const,
      input: insertLiveClassSchema,
      responses: {
        201: z.custom<typeof live_classes.$inferSelect>(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/classes/live/:id' as const,
      input: insertLiveClassSchema.partial(),
      responses: {
        200: z.custom<typeof live_classes.$inferSelect>(),
        404: errorSchemas.notFound,
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
    create: {
      method: 'POST' as const,
      path: '/api/quizzes' as const,
      input: insertQuizSchema,
      responses: {
        201: z.custom<typeof quizzes.$inferSelect>(),
      }
    },
    addQuestion: {
      method: 'POST' as const,
      path: '/api/quizzes/:id/questions' as const,
      input: insertQuizQuestionSchema.omit({ quizId: true }),
      responses: {
        201: z.custom<typeof quiz_questions.$inferSelect>(),
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
          id: z.string(),
          name: z.string(),
          points: z.number(),
          avatar: z.string(),
          rank: z.number()
        })),
      }
    }
  },

  // Fees
  fees: {
    list: {
      method: 'GET' as const,
      path: '/api/fees' as const,
      responses: {
        200: z.array(z.custom<typeof fees.$inferSelect>()),
      }
    },
    getByUser: {
      method: 'GET' as const,
      path: '/api/fees/user/:userId' as const,
      responses: {
        200: z.array(z.custom<typeof fees.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/fees' as const,
      input: insertFeeSchema,
      responses: {
        201: z.custom<typeof fees.$inferSelect>(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/fees/:id' as const,
      input: insertFeeSchema.partial(),
      responses: {
        200: z.custom<typeof fees.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },

  // Users (Admin Only)
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/users' as const,
      input: z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.string().default('student'),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id' as const,
      input: z.object({
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/users/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      }
    }
  },

  // Course Tests
  courseTests: {
    list: {
      method: 'GET' as const,
      path: '/api/courses/:courseId/tests' as const,
      responses: {
        200: z.array(z.custom<typeof course_tests.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/courses/:courseId/tests' as const,
      input: insertCourseTestSchema,
      responses: {
        201: z.custom<typeof course_tests.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/courses/tests/:id' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/courses/tests/:id' as const,
      input: insertCourseTestSchema.partial(),
      responses: {
        200: z.custom<typeof course_tests.$inferSelect>(),
      }
    },
    results: {
      method: 'GET' as const,
      path: '/api/courses/tests/results' as const,
      responses: {
        200: z.array(z.custom<typeof course_test_results.$inferSelect>()),
      }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/courses/tests/results' as const,
      input: insertCourseTestResultSchema,
      responses: {
        201: z.custom<typeof course_test_results.$inferSelect>(),
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
