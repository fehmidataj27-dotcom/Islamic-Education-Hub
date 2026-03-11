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

export function useDailyStatsHistory() {
  return useQuery({
    queryKey: [api.dailyStats.history.path],
    queryFn: async () => {
      const res = await fetch(api.dailyStats.history.path);
      if (!res.ok) throw new Error("Failed to fetch daily stats history");
      return api.dailyStats.history.responses[200].parse(await res.json());
    },
  });
}

export function useDailyStatsByDate(date: string) {
  return useQuery({
    queryKey: [api.dailyStats.getByDate.path, date],
    queryFn: async () => {
      const url = buildUrl(api.dailyStats.getByDate.path, { date });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch daily stats for date");
      return api.dailyStats.getByDate.responses[200].parse(await res.json());
    },
    enabled: !!date,
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

export function useBulkUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, groupId, updates }: { date?: string; groupId?: string; updates: any[] }) => {
      const res = await fetch(api.dailyStats.bulkUpdate.path, {
        method: api.dailyStats.bulkUpdate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, groupId, updates }),
      });
      if (!res.ok) throw new Error("Failed to bulk update attendance");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dailyStats.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.dailyStats.getByDate.path] });
      queryClient.invalidateQueries({ queryKey: [api.dailyStats.history.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.books.create.path, {
        method: api.books.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create book");
      return api.books.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.books.delete.path, { id });
      const res = await fetch(url, {
        method: api.books.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete book");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
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
      if (!res.ok) {
        const error = await res.json();
        throw error;
      }
      return api.quran.updateProgress.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quran.progress.path] });
    },
  });
}

// ==========================================
// RESOURCES
// ==========================================
export function useResources() {
  return useQuery({
    queryKey: [api.resources.list.path],
    queryFn: async () => {
      const res = await fetch(api.resources.list.path);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return api.resources.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.resources.create.path, {
        method: api.resources.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create resource");
      }
      return api.resources.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resources.delete.path, { id });
      const res = await fetch(url, {
        method: api.resources.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete resource");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const url = buildUrl(api.resources.update.path, { id });
      const res = await fetch(url, {
        method: api.resources.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update resource");
      }
      return api.resources.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
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

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.videos.create.path, {
        method: api.videos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create video");
      }
      return api.videos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.videos.list.path] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.videos.delete.path, { id });
      const res = await fetch(url, {
        method: api.videos.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete video");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.videos.list.path] });
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

export function useCreateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.liveClasses.create.path, {
        method: api.liveClasses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create live class");
      return api.liveClasses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.liveClasses.list.path] });
    },
  });
}

export function useUpdateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const url = buildUrl(api.liveClasses.update.path, { id });
      const res = await fetch(url, {
        method: api.liveClasses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update live class");
      return api.liveClasses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.liveClasses.list.path] });
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

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.quizzes.create.path, {
        method: api.quizzes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      return api.quizzes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.list.path] });
    },
  });
}

export function useCreateQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, data }: { quizId: number; data: any }) => {
      const url = buildUrl(api.quizzes.addQuestion.path, { id: quizId });
      const res = await fetch(url, {
        method: api.quizzes.addQuestion.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add question");
      return api.quizzes.addQuestion.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.quizzes.get.path, variables.quizId] });
    },
  });
}

// ==========================================
// ACHIEVEMENTS & LEADERBOARD
// ==========================================
export function useAchievements() {
  return useQuery({
    queryKey: [api.achievements.list.path],
    queryFn: async () => {
      const res = await fetch(api.achievements.list.path);
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return api.achievements.list.responses[200].parse(await res.json());
    },
  });
}

export function useUserAchievements() {
  return useQuery({
    queryKey: [api.achievements.myAchievements.path],
    queryFn: async () => {
      const res = await fetch(api.achievements.myAchievements.path);
      if (!res.ok) throw new Error("Failed to fetch my achievements");
      return api.achievements.myAchievements.responses[200].parse(await res.json());
    },
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flags: {
      visitedLibrary?: boolean;
      duasListened?: number;
      quizCount?: number;
      visitedTajweed?: boolean;
      visitedHadees?: boolean;
      visitedNamaz?: boolean;
      visitedTafseer?: boolean;
    } = {}) => {
      const res = await fetch("/api/achievements/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flags),
      });
      if (!res.ok) return null;
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.achievements.myAchievements.path] });
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

// ==========================================
// SALAH PROGRESS
// ==========================================
export function useSalahProgress() {
  return useQuery({
    queryKey: ["/api/salah-progress"],
    queryFn: async () => {
      const res = await fetch("/api/salah-progress");
      if (!res.ok) throw new Error("Failed to fetch salah progress");
      return await res.json();
    },
  });
}

export function useUpdateSalahProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stepId, completed }: { stepId: string; completed: boolean }) => {
      const res = await fetch("/api/salah-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, completed }),
      });
      if (!res.ok) throw new Error("Failed to update salah progress");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salah-progress"] });
    },
  });
}

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================
export function useUsers() {
  return useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
}

// ==========================================
// FEES
// ==========================================
export function useFees() {
  return useQuery({
    queryKey: [api.fees.list.path],
    queryFn: async () => {
      const res = await fetch(api.fees.list.path);
      if (!res.ok) throw new Error("Failed to fetch fees");
      return api.fees.list.responses[200].parse(await res.json());
    },
  });
}

export function useFeesByUser(userId: string) {
  return useQuery({
    queryKey: [api.fees.getByUser.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.fees.getByUser.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch user fees");
      return api.fees.getByUser.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.fees.create.path, {
        method: api.fees.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create fee record");
      }
      return api.fees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fees.list.path] });
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const url = buildUrl(api.fees.update.path, { id });
      const res = await fetch(url, {
        method: api.fees.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update fee record");
      }
      return api.fees.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fees.list.path] });
    },
  });
}
// ==========================================
// GROUPS
// ==========================================
export function useUserGroups() {
  return useQuery({
    queryKey: ["/api/groups/my"],
    queryFn: async () => {
      const res = await fetch("/api/groups/my");
      if (!res.ok) throw new Error("Failed to fetch user groups");
      return await res.json();
    },
  });
}

export function useGroupAnnouncements(groupId: string) {
  return useQuery({
    queryKey: ["/api/groups", groupId, "announcements"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/announcements`);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return await res.json();
    },
    enabled: !!groupId,
  });
}

export function useCategoryAnnouncements(category: string) {
  return useQuery({
    queryKey: ["/api/announcements", "category", category],
    queryFn: async () => {
      const res = await fetch(`/api/announcements/category/${category}`);
      if (!res.ok) throw new Error("Failed to fetch category announcements");
      return await res.json();
    },
    enabled: !!category,
  });
}

// ==========================================
// WISDOM
// ==========================================
export function useDailyWisdom() {
  return useQuery({
    queryKey: ["/api/wisdom/daily"],
    queryFn: async () => {
      const res = await fetch("/api/wisdom/daily");
      if (!res.ok) throw new Error("Failed to fetch daily wisdom");
      return await res.json();
    },
  });
}

export function useAllWisdom() {
  return useQuery({
    queryKey: ["/api/wisdom"],
    queryFn: async () => {
      const res = await fetch("/api/wisdom");
      if (!res.ok) throw new Error("Failed to fetch wisdom list");
      return await res.json();
    },
  });
}

export function useCreateWisdom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add wisdom");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wisdom/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wisdom"] });
    },
  });
}
