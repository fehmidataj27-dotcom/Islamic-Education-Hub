import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// ==========================================
// DAILY STATS
// ==========================================
export function useDailyStats() {
  return useQuery({
    queryKey: [api.dailyStats.get.path],
    queryFn: async () => {
      const res = await fetch(api.dailyStats.get.path);
      if (res.status === 404) return null; // Handle 404 as "no stats yet"
      if (!res.ok) throw new Error("Failed to fetch daily stats");
      return api.dailyStats.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateDailyStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.dailyStats.update.path, {
        method: api.dailyStats.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update stats");
      return api.dailyStats.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyStats.get.path] });
    },
  });
}

// ==========================================
// BOOKS
// ==========================================
export function useBooks() {
  return useQuery({
    queryKey: [api.books.list.path],
    queryFn: async () => {
      const res = await fetch(api.books.list.path);
      if (!res.ok) throw new Error("Failed to fetch books");
      return api.books.list.responses[200].parse(await res.json());
    },
  });
}

// ==========================================
// QURAN
// ==========================================
export function useQuranProgress() {
  return useQuery({
    queryKey: [api.quran.progress.path],
    queryFn: async () => {
      const res = await fetch(api.quran.progress.path);
      if (!res.ok) throw new Error("Failed to fetch quran progress");
      return api.quran.progress.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateQuranProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.quran.updateProgress.path, {
        method: api.quran.updateProgress.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return api.quran.updateProgress.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quran.progress.path] });
    },
  });
}

// ==========================================
// VIDEOS
// ==========================================
export function useVideos() {
  return useQuery({
    queryKey: [api.videos.list.path],
    queryFn: async () => {
      const res = await fetch(api.videos.list.path);
      if (!res.ok) throw new Error("Failed to fetch videos");
      return api.videos.list.responses[200].parse(await res.json());
    },
  });
}

// ==========================================
// LIVE CLASSES
// ==========================================
export function useLiveClasses() {
  return useQuery({
    queryKey: [api.liveClasses.list.path],
    queryFn: async () => {
      const res = await fetch(api.liveClasses.list.path);
      if (!res.ok) throw new Error("Failed to fetch live classes");
      return api.liveClasses.list.responses[200].parse(await res.json());
    },
  });
}

// ==========================================
// QUIZZES
// ==========================================
export function useQuizzes() {
  return useQuery({
    queryKey: [api.quizzes.list.path],
    queryFn: async () => {
      const res = await fetch(api.quizzes.list.path);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return api.quizzes.list.responses[200].parse(await res.json());
    },
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: [api.quizzes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.quizzes.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      return api.quizzes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSubmitQuiz(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { score: number }) => {
      const url = buildUrl(api.quizzes.submit.path, { id });
      const res = await fetch(url, {
        method: api.quizzes.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      return api.quizzes.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.achievements.myAchievements.path] });
    },
  });
}

// ==========================================
// ACHIEVEMENTS & LEADERBOARD
// ==========================================
export function useAchievements() {
  return useQuery({
    queryKey: [api.achievements.myAchievements.path],
    queryFn: async () => {
      const res = await fetch(api.achievements.myAchievements.path);
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return api.achievements.myAchievements.responses[200].parse(await res.json());
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });
}
