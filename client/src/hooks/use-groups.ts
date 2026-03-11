import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Group, GroupAnnouncement, GroupAssignment, GroupAttendance, GroupPerformance, AuditLog, GroupWithStats } from "@shared/schema";

export function useGroups() {
    const getGroups = (params: { search?: string, status?: string, category?: string, offset?: number, limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set("search", params.search);
        if (params.status) queryParams.set("status", params.status);
        if (params.category) queryParams.set("category", params.category);
        if (params.offset) queryParams.set("offset", params.offset.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());

        return useQuery<{ groups: GroupWithStats[], total: number }>({
            queryKey: ["/api/groups", params],
            queryFn: async () => {
                const res = await fetch(`/api/groups?${queryParams.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch groups");
                return res.json();
            }
        });
    };

    const getUserGroups = () => {
        return useQuery<GroupWithStats[]>({
            queryKey: ["/api/groups/my"],
            queryFn: async () => {
                const res = await fetch("/api/groups/my");
                if (!res.ok) throw new Error("Failed to fetch your groups");
                return res.json();
            }
        });
    };

    const getGroup = (id: string) => {
        return useQuery<GroupWithStats>({
            queryKey: ["/api/groups", id],
            queryFn: async () => {
                const res = await fetch(`/api/groups/${id}`);
                if (!res.ok) throw new Error("Failed to fetch group details");
                return res.json();
            }
        });
    };

    const createGroup = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/groups", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    const updateGroup = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await apiRequest("PATCH", `/api/groups/${id}`, data);
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.id] });
        }
    });

    const deleteGroup = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/groups/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    // Members
    const getTeachers = (groupId: string) => {
        return useQuery<any[]>({
            queryKey: ["/api/groups", groupId, "teachers"],
            queryFn: async () => {
                const res = await fetch(`/api/groups/${groupId}/teachers`);
                if (!res.ok) throw new Error("Failed to fetch teachers");
                return res.json();
            }
        });
    };

    const getStudents = (groupId: string) => {
        return useQuery<any[]>({
            queryKey: ["/api/groups", groupId, "students"],
            queryFn: async () => {
                if (!groupId) return [];
                const res = await fetch(`/api/groups/${groupId}/students`);
                if (!res.ok) throw new Error("Failed to fetch students");
                return res.json();
            },
            enabled: !!groupId
        });
    };

    const assignTeacher = useMutation({
        mutationFn: async ({ groupId, userId }: { groupId: string, userId: string }) => {
            await apiRequest("POST", `/api/groups/${groupId}/teachers`, { userId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "teachers"] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    const addStudent = useMutation({
        mutationFn: async ({ groupId, userId }: { groupId: string, userId: string }) => {
            await apiRequest("POST", `/api/groups/${groupId}/students`, { userId });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "students"] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    const removeTeacher = useMutation({
        mutationFn: async ({ groupId, userId }: { groupId: string, userId: string }) => {
            await apiRequest("DELETE", `/api/groups/${groupId}/teachers/${userId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "teachers"] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    const removeStudent = useMutation({
        mutationFn: async ({ groupId, userId }: { groupId: string, userId: string }) => {
            await apiRequest("DELETE", `/api/groups/${groupId}/students/${userId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "students"] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    // Content
    const getAnnouncements = (groupId: string) => {
        return useQuery<GroupAnnouncement[]>({
            queryKey: ["/api/groups", groupId, "announcements"],
            queryFn: async () => {
                const res = await fetch(`/api/groups/${groupId}/announcements`);
                if (!res.ok) throw new Error("Failed to fetch announcements");
                return res.json();
            }
        });
    };

    const createAnnouncement = useMutation({
        mutationFn: async ({ groupId, data }: { groupId: string, data: any }) => {
            const res = await apiRequest("POST", `/api/groups/${groupId}/announcements`, data);
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "announcements"] });
        }
    });

    const deleteAnnouncement = useMutation({
        mutationFn: async ({ id, groupId }: { id: number, groupId: string }) => {
            await apiRequest("DELETE", `/api/announcements/${id}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "announcements"] });
        }
    });

    const getAssignments = (groupId: string) => {
        return useQuery<GroupAssignment[]>({
            queryKey: ["/api/groups", groupId, "assignments"],
            queryFn: async () => {
                const res = await fetch(`/api/groups/${groupId}/assignments`);
                if (!res.ok) throw new Error("Failed to fetch assignments");
                return res.json();
            }
        });
    };

    const createAssignment = useMutation({
        mutationFn: async ({ groupId, data }: { groupId: string, data: any }) => {
            const res = await apiRequest("POST", `/api/groups/${groupId}/assignments`, data);
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "assignments"] });
        }
    });

    // Attendance & Performance
    const getAttendance = (groupId: string, date?: string) => {
        const url = date ? `/api/groups/${groupId}/attendance?date=${date}` : `/api/groups/${groupId}/attendance`;
        return useQuery<GroupAttendance[]>({
            queryKey: ["/api/groups", groupId, "attendance", date],
            queryFn: async () => {
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch attendance");
                return res.json();
            }
        });
    };

    const getGroupAnalytics = (groupId: string) => {
        return useQuery<any>({
            queryKey: ["/api/groups", groupId, "analytics"],
            queryFn: async () => {
                const res = await fetch(`/api/groups/${groupId}/analytics`);
                if (!res.ok) throw new Error("Failed to fetch analytics");
                return res.json();
            }
        });
    };

    const recordAttendance = useMutation({
        mutationFn: async ({ groupId, data }: { groupId: string, data: any }) => {
            const res = await apiRequest("POST", `/api/groups/${groupId}/attendance`, data);
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "attendance"] });
        }
    });

    const getMyAttendance = () => {
        return useQuery<GroupAttendance[]>({
            queryKey: ["/api/attendance/me"],
            queryFn: async () => {
                const res = await fetch("/api/attendance/me");
                if (!res.ok) throw new Error("Failed to fetch attendance");
                return res.json();
            }
        });
    };

    const bulkCreateGroups = useMutation({
        mutationFn: async (groups: any[]) => {
            const res = await apiRequest("POST", "/api/groups/bulk", { groups });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    const importStudents = useMutation({
        mutationFn: async ({ groupId, students }: { groupId: string, students: any[] }) => {
            const res = await apiRequest("POST", `/api/groups/${groupId}/import-students`, { students });
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups", variables.groupId, "students"] });
        }
    });

    const transferStudent = useMutation({
        mutationFn: async (data: { userId: string, fromGroupId: string, toGroupId: string }) => {
            await apiRequest("POST", "/api/groups/transfer", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        }
    });

    return {
        getGroups,
        getUserGroups,
        getGroup,
        createGroup,
        updateGroup,
        deleteGroup,
        getTeachers,
        getStudents,
        assignTeacher,
        addStudent,
        removeTeacher,
        removeStudent,
        getAnnouncements,
        createAnnouncement,
        deleteAnnouncement,
        getAssignments,
        createAssignment,
        getAttendance,
        recordAttendance,
        bulkCreateGroups,
        importStudents,
        transferStudent,
        getGroupAnalytics,
        getMyAttendance
    };
}
