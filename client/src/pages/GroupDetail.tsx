import { useState, useMemo, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { useGroups } from "@/hooks/use-groups";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft, Search, Plus, Send, FileText, Download,
    Calendar, CheckCircle2, XCircle, TrendingUp, MoreVertical,
    UserPlus, UserMinus, Mail, Clock, BarChart2, Activity,
    Megaphone, BookOpen, ClipboardCheck, ClipboardList, Users, Shield,
    Loader2, AlertCircle, Star, BookMarked, Award, Target,
    Trophy, Zap, Mic, MicOff, Square, Play, Trash2, AlertTriangle,
    Lock as LockIcon, Unlock as UnlockIcon, CornerUpLeft as CornerUpLeftIcon, X as XIcon,
    Phone, Video, Paperclip as PaperclipIcon, ExternalLink
} from "lucide-react";
import { useVoiceRecorder } from "@/replit_integrations/audio/useVoiceRecorder";
import CallOverlay from "@/components/CallOverlay";
import VoicePlayer from "@/components/VoicePlayer";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const GROUP_COLORS = [
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-orange-500 to-amber-600",
    "from-sky-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-lime-500 to-green-600",
];
const GROUP_ICONS = ["📖", "🕌", "✨", "🌙", "📿", "🤲"];

export default function GroupDetail() {
    const [, params] = useRoute("/groups/:id");
    const [, setLocation] = useLocation();
    const { user } = useAuthContext();
    const { lang } = useTheme();
    const { toast } = useToast();
    const groupId = params?.id || "";

    const {
        getGroup, getStudents, getTeachers, getAnnouncements, getAssignments,
        getAttendance, createAnnouncement, deleteAnnouncement, createAssignment, recordAttendance,
        addStudent, assignTeacher, getGroupAnalytics, transferStudent, getGroups,
        removeStudent, removeTeacher
    } = useGroups();

    const { data: group, isLoading: loadingGroup } = getGroup(groupId);
    const category = group?.category;
    const { data: students = [], isLoading: loadingStudents } = getStudents(groupId);
    const { data: teachers = [], isLoading: loadingTeachers } = getTeachers(groupId);
    const { data: announcements = [], isLoading: loadingAnnouncements } = getAnnouncements(groupId);
    const { data: assignments = [], isLoading: loadingAssignments } = getAssignments(groupId);
    const { data: analytics } = getGroupAnalytics(groupId);

    const [activeTab, setActiveTab] = useState("announcements");
    const [searchMember, setSearchMember] = useState("");
    const [announcementText, setAnnouncementText] = useState("");
    const [announcementTitle, setAnnouncementTitle] = useState("");

    // Add Member dialog
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [memberType, setMemberType] = useState<"student" | "teacher">("student");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberUserId, setMemberUserId] = useState("");
    const [createNewMode, setCreateNewMode] = useState(false);
    const [newStudentData, setNewStudentData] = useState({
        firstName: "",
        lastName: "",
        studentId: "",
        username: "",
        password: "",
        email: ""
    });

    // Call state
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');

    // Attendance state
    const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "late">>({});

    // Transfer dialog
    const [transferOpen, setTransferOpen] = useState(false);
    const [userToTransfer, setUserToTransfer] = useState<any>(null);
    const [targetGroupId, setTargetGroupId] = useState("");

    // Student Report dialog
    const [reportStudent, setReportStudent] = useState<any>(null);

    // Remove Member Confirmation
    const [memberToRemove, setMemberToRemove] = useState<any>(null);

    // Voice recording states
    const { state: recordingState, startRecording: startMic, stopRecording: stopMic } = useVoiceRecorder();
    const isRecording = recordingState === "recording";
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown');
    const [isIframe, setIsIframe] = useState(false);
    const [showMicHelper, setShowMicHelper] = useState(false);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Reply / quote state
    const [replyTo, setReplyTo] = useState<{ id: number; content: string; author: string } | null>(null);

    // Group lock state (synced from group data)
    const [isGroupLocked, setIsGroupLocked] = useState<boolean>(false);
    const [isTogglingLock, setIsTogglingLock] = useState(false);

    // Sync lock state from group data
    useEffect(() => {
        setIsIframe(window.self !== window.top);
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
                setMicPermission(status.state);
                status.onchange = () => setMicPermission(status.state);
            });
        }
    }, []);

    useEffect(() => {
        if (group && (group as any).isLocked !== undefined) {
            setIsGroupLocked(!!(group as any).isLocked);
        }
    }, [group]);

    const toggleGroupLock = async () => {
        if (!groupId) return;
        setIsTogglingLock(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/lock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locked: !isGroupLocked })
            });
            if (!res.ok) throw new Error('Failed');
            setIsGroupLocked(l => !l);
            toast({ title: !isGroupLocked ? '🔒 Group locked — only teacher/admin can post' : '🔓 Group unlocked — everyone can post' });
        } catch {
            toast({ title: 'Failed to toggle lock', variant: 'destructive' });
        } finally {
            setIsTogglingLock(false);
        }
    };

    // Build a name lookup map from all members
    const memberNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        const t = Array.isArray(teachers) ? teachers : [];
        const s = Array.isArray(students) ? students : [];
        [...t, ...s].forEach((m: any) => {
            if (m?.id) map[m.id] = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Member';
        });
        return map;
    }, [teachers, students]);

    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isTeacher = user?.role?.toLowerCase() === "teacher";
    const canManage = isAdmin || isTeacher;

    // Auto-scroll to bottom when messages change (WhatsApp behaviour)
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [announcements]);

    // Fix: ensure members filter works even when data loads asynchronously
    const filteredMembers = useMemo(() => {
        const teacherList = Array.isArray(teachers) ? teachers : [];
        const studentList = Array.isArray(students) ? students : [];
        const all = [
            ...teacherList.map((t: any) => ({ ...t, type: 'teacher' })),
            ...studentList.map((s: any) => ({ ...s, type: 'student' }))
        ];
        if (!searchMember.trim()) return all;
        const q = searchMember.toLowerCase();
        return all.filter((m: any) =>
            `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q)
        );
    }, [students, teachers, searchMember]);

    const grad = GROUP_COLORS[(groupId?.charCodeAt(0) || 0) % GROUP_COLORS.length];
    const groupIcon = GROUP_ICONS[(groupId?.charCodeAt(0) || 0) % GROUP_ICONS.length];

    const handlePostAnnouncement = (voiceUrl?: string, customFileType?: string) => {
        if (!announcementText.trim() && !voiceUrl) return;

        createAnnouncement.mutate(
            {
                groupId,
                data: {
                    content: announcementText || (voiceUrl ? (customFileType === 'image' ? "Sent an image" : "Voice Message") : ""),
                    title: announcementTitle,
                    fileUrl: voiceUrl || null,
                    fileType: voiceUrl ? (customFileType || 'voice') : 'text',
                    replyToId: replyTo?.id || null,
                    replyToContent: replyTo?.content || null,
                    replyToAuthor: replyTo?.author || null,
                }
            },
            {
                onSuccess: () => {
                    toast({ title: voiceUrl ? "🎤 Voice message sent!" : "📢 Message sent!" });
                    setAnnouncementText("");
                    setAnnouncementTitle("");
                    setVoiceBlob(null);
                    setAudioUrl(null);
                    setReplyTo(null);
                },
                onError: (err: any) => toast({ title: err?.message || "Failed to post", variant: "destructive" })
            }
        );
    };

    const handleDeleteAnnouncement = async (annId: number) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteAnnouncement.mutateAsync({ id: annId, groupId });
            toast({ title: "🗑️ Message deleted for everyone" });
        } catch (err: any) {
            toast({ title: "Failed to delete message", description: err.message, variant: "destructive" });
        }
    };

    const startRecording = async () => {
        if ((micPermission as any) === 'denied') {
            toast({
                title: "Mic Blocked: Switch to Upload",
                description: "Recording is blocked by your browser/preview. Please select an audio file to send.",
            });
            audioInputRef.current?.click();
            return;
        }

        try {
            await startMic();
            setRecordingSeconds(0);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } catch (err: any) {
            console.error("Recording error:", err);

            // If the error is a permission error, automatically fall back to upload
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError' || (micPermission as any) === 'denied') {
                toast({
                    title: "Switching to Voice Upload",
                    description: isIframe ? "Replit prevents live recording. Select an audio file instead." : "Microphone access denied. Select an audio file instead.",
                    variant: "default"
                });
                audioInputRef.current?.click();
                return;
            }

            toast({
                title: "Microphone Error",
                description: err.name === 'NotFoundError' ? "No microphone found." : "Could not start recording.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = async () => {
        try {
            const blob = await stopMic();
            if (blob.size < 100) return;
            setVoiceBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setRecordingSeconds(0);
        } catch (err) {
            console.error("Stop recording error:", err);
        }
    };

    const handleAudioPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingVoice(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            handlePostAnnouncement(data.url);
            toast({ title: "Voice note uploaded successfully" });
        } catch (err) {
            toast({ title: "Upload failed", variant: "destructive" });
        } finally {
            setIsUploadingVoice(false);
            if (audioInputRef.current) audioInputRef.current.value = '';
        }
    };

    const uploadVoice = async () => {
        if (!voiceBlob) return;
        setIsUploadingVoice(true);
        const formData = new FormData();
        formData.append("file", voiceBlob, "voice_message.webm");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            handlePostAnnouncement(data.url);
        } catch (err) {
            console.error("Voice upload error:", err);
            toast({ title: "Failed to upload voice message", variant: "destructive" });
        } finally {
            setIsUploadingVoice(false);
        }
    };

    const handleSaveAttendance = () => {
        const entries = Object.entries(attendanceMap);
        if (entries.length === 0) return toast({ title: "No attendance marked", variant: "destructive" });
        Promise.all(entries.map(([userId, status]) =>
            recordAttendance.mutateAsync({ groupId, data: { groupId, userId, status, date: new Date().toISOString() } })
        )).then(() => {
            toast({ title: "✅ Attendance saved!" });
            setAttendanceMap({});
        }).catch(() => toast({ title: "Error saving attendance", variant: "destructive" }));
    };

    const handleRemoveMember = (member: any) => {
        setMemberToRemove(member);
    };

    const confirmRemoveMember = () => {
        if (!memberToRemove) return;
        const member = memberToRemove;
        const isRemovingTeacher = member.type === 'teacher';
        const mutation = isRemovingTeacher ? removeTeacher : removeStudent;

        mutation.mutate(
            { groupId, userId: member.id },
            {
                onSuccess: () => {
                    toast({ title: "✅ Member removed" });
                    setMemberToRemove(null);
                },
                onError: (err: any) => {
                    toast({
                        title: "Failed to remove",
                        description: err.message || "Unknown error occurred",
                        variant: "destructive"
                    });
                    setMemberToRemove(null);
                }
            }
        );
    };

    if (loadingGroup) {
        return (
            <div className="space-y-4 animate-pulse">
                <Skeleton className="h-32 rounded-3xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground font-bold">Group not found</p>
                <Button variant="outline" onClick={() => setLocation("/groups")} className="rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-10">
            {/* ── Hero Banner ── */}
            <div className={`relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br ${grad} shadow-2xl`}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
                </div>
                <div className="relative z-10 p-5 md:p-7">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 text-white/80 hover:text-white hover:bg-white/10 rounded-xl -ml-2"
                        onClick={() => setLocation("/groups")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> {lang === 'en' ? 'All Groups' : 'تمام گروپس'}
                    </Button>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg border border-white/30">
                                {groupIcon}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{(group as any).name}</h1>
                                {(group as any).description && (
                                    <p className="text-white/70 text-sm">{(group as any).description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold">
                                        {(group as any).status?.toUpperCase() || 'ACTIVE'}
                                    </Badge>
                                    {(group as any).capacity && (
                                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                            Max {(group as any).capacity} students
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Quick stats */}
                        <div className="flex gap-3">
                            <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                                <p className="text-2xl font-black text-white">{students?.length ?? (group as any).studentCount ?? 0}</p>
                                <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Students</p>
                            </div>
                            <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                                <p className="text-2xl font-black text-white">{teachers?.length ?? (group as any).teacherCount ?? 0}</p>
                                <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Teachers</p>
                            </div>
                            <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
                                <p className="text-2xl font-black text-white">{announcements?.length ?? 0}</p>
                                <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Posts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* ── Left: Tabs ── */}
                <div className="lg:col-span-8 space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        {/* Tab bar */}
                        <div className="bg-card rounded-2xl p-1.5 shadow-sm border border-border/50 flex overflow-x-auto no-scrollbar">
                            <TabsList className="bg-transparent border-none w-full justify-start p-0 h-auto gap-1">
                                {[
                                    { value: "announcements", icon: Megaphone, label: lang === 'en' ? 'Announcements' : 'اعلانات' },
                                    { value: "assignments", icon: BookOpen, label: lang === 'en' ? 'Assignments' : 'اسائنمنٹس' },
                                    { value: "attendance", icon: ClipboardCheck, label: lang === 'en' ? 'Attendance' : 'حاضری' },
                                    { value: "performance", icon: TrendingUp, label: lang === 'en' ? 'Performance' : 'کارکردگی' },
                                    ...(canManage ? [{ value: "analytics", icon: BarChart2, label: 'Analytics' }] : []),
                                ].map(tab => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                                    >
                                        <tab.icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* ── ANNOUNCEMENTS / WHATSAPP CHAT ── */}
                        <TabsContent value="announcements" className="mt-0">
                            <div className="flex flex-col rounded-2xl overflow-hidden shadow-xl border border-border/40" style={{ height: '75vh' }}>

                                {/* ── Chat header ── */}
                                <div className={`bg-gradient-to-r ${grad} px-4 py-3 flex items-center gap-3 shadow-sm`}>
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">{groupIcon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-white text-sm">{(group as any).name}</p>
                                            {isGroupLocked && (
                                                <span className="bg-red-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Locked</span>
                                            )}
                                        </div>
                                        <p className="text-white/70 text-xs">{Array.isArray(students) ? students.length : 0} students · {Array.isArray(teachers) ? teachers.length : 0} teachers</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Call buttons */}
                                        <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                                                onClick={() => { setCallType('audio'); setIsCallOpen(true); }}
                                            >
                                                <Phone className="h-4.5 w-4.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                                                onClick={() => { setCallType('video'); setIsCallOpen(true); }}
                                            >
                                                <Video className="h-4.5 w-4.5" />
                                            </Button>
                                        </div>

                                        {/* Lock / Unlock button — teacher/admin only */}
                                        {canManage && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`rounded-full h-8 px-3 gap-1.5 font-bold text-white border border-white/30 hover:bg-white/20 transition-all ${isGroupLocked ? 'bg-red-500/40' : 'bg-white/10'}`}
                                                onClick={toggleGroupLock}
                                                disabled={isTogglingLock}
                                            >
                                                {isTogglingLock ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isGroupLocked ? <LockIcon className="h-3.5 w-3.5" /> : <UnlockIcon className="h-3.5 w-3.5" />}
                                                <span className="text-[10px] hidden sm:inline">{isGroupLocked ? 'Locked' : 'Lock'}</span>
                                            </Button>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-white/80 text-xs font-bold">Live</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Messages area ── */}
                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-1"
                                    style={{
                                        background: `linear-gradient(135deg, #e5ddd5 0%, #d4c8bb 100%)`,
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                    }}
                                >
                                    {loadingAnnouncements ? (
                                        <div className="flex flex-col gap-3 py-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                    <Skeleton className={`h-14 rounded-2xl ${i % 2 === 0 ? 'w-48 rounded-tr-none' : 'w-56 rounded-tl-none'}`} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : announcements.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3">
                                            <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                                <Megaphone className="h-8 w-8 text-emerald-700 opacity-60" />
                                            </div>
                                            <p className="text-sm font-bold text-emerald-900/50">No messages yet</p>
                                            <p className="text-xs text-emerald-900/30">Be the first to say something!</p>
                                        </div>
                                    ) : (
                                        [...announcements].reverse().map((ann: any, idx: number, arr: any[]) => {
                                            const isMe = ann.authorId === user?.id;
                                            const authorName = memberNameMap[ann.authorId] ||
                                                (ann.authorId === user?.id ? `${user?.firstName || 'Me'} ${user?.lastName || ''}` : 'Member');
                                            const prevAnn = idx > 0 ? arr[idx - 1] : null;
                                            const showDate = !prevAnn || new Date(ann.createdAt).toDateString() !== new Date(prevAnn.createdAt).toDateString();
                                            const showAuthor = !isMe && (!prevAnn || prevAnn.authorId !== ann.authorId || showDate);
                                            const msgPreview = ann.fileType === 'voice' ? '🎤 Voice message' : (ann.content || '').slice(0, 60) + ((ann.content || '').length > 60 ? '…' : '');

                                            return (
                                                <div key={ann.id}>
                                                    {showDate && (
                                                        <div className="flex justify-center my-3">
                                                            <span className="text-[10px] font-bold bg-white/70 backdrop-blur-sm text-emerald-900/60 px-3 py-1 rounded-full shadow-sm">
                                                                {format(new Date(ann.createdAt), 'MMMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Message row — show reply button on hover */}
                                                    <div className={`group/msg flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-1`}>
                                                        {!isMe && (
                                                            <Avatar className="h-7 w-7 shrink-0 mb-1">
                                                                <AvatarFallback className={`text-[10px] font-black bg-gradient-to-br ${grad} text-white`}>
                                                                    {authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || (user ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '') : 'M')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}

                                                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            {showAuthor && (
                                                                <span className="text-[10px] font-black text-emerald-800 mb-0.5 px-1">{authorName}</span>
                                                            )}

                                                            <div className={`relative px-3 py-2 rounded-2xl shadow-sm ${isMe
                                                                ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                                                                : 'bg-white text-gray-800 rounded-tl-none'
                                                                }`}>
                                                                {/* WhatsApp bubble tail */}
                                                                <div className={`absolute top-0 w-3 h-3 overflow-hidden ${isMe ? '-right-2' : '-left-2'}`}>
                                                                    <div className={`w-4 h-4 rotate-45 ${isMe ? 'bg-[#dcf8c6] -translate-x-2' : 'bg-white translate-x-0'}`} />
                                                                </div>

                                                                {/* Quoted reply block */}
                                                                {ann.replyToContent && (
                                                                    <div className={`mb-2 pl-2 border-l-2 ${isMe ? 'border-emerald-500 bg-emerald-50/60' : 'border-blue-400 bg-blue-50/60'} rounded-md p-1.5`}>
                                                                        <p className={`text-[10px] font-black mb-0.5 ${isMe ? 'text-emerald-700' : 'text-blue-600'}`}>{ann.replyToAuthor || 'Member'}</p>
                                                                        <p className="text-[11px] text-gray-500 line-clamp-2">{ann.replyToContent}</p>
                                                                    </div>
                                                                )}

                                                                {ann.title && (
                                                                    <p className="font-black text-xs text-emerald-700 mb-1">{ann.title}</p>
                                                                )}

                                                                {ann.fileType === 'voice' && ann.fileUrl ? (
                                                                    <VoicePlayer url={ann.fileUrl} id={ann.id} />
                                                                ) : (
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                                                )}

                                                                <div className="flex items-center gap-1 mt-1 justify-end">
                                                                    <span className="text-[9px] text-gray-400">
                                                                        {ann.createdAt ? format(new Date(ann.createdAt), 'h:mm a') : ''}
                                                                    </span>
                                                                    {isMe && <span className="text-[9px] text-blue-400">✓✓</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions area — appears on hover */}
                                                        <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex flex-col gap-1 items-center shrink-0 mb-1 ${isMe ? 'order-first' : 'order-last'}`}>
                                                            {/* Reply button */}
                                                            <button
                                                                className="h-7 w-7 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white"
                                                                title="Reply"
                                                                onClick={() => setReplyTo({
                                                                    id: ann.id,
                                                                    content: msgPreview,
                                                                    author: authorName
                                                                })}
                                                            >
                                                                <CornerUpLeftIcon className="h-3.5 w-3.5 text-emerald-700" />
                                                            </button>

                                                            {/* Delete button (Admin, Teacher, or Author only) */}
                                                            {(canManage || isMe) && (
                                                                <button
                                                                    className="h-7 w-7 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                                                                    title="Delete for everyone"
                                                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* ── Sticky input area ── */}
                                <div className="bg-[#f0f0f0] border-t border-gray-200">
                                    {/* Reply preview bar */}
                                    {replyTo && (
                                        <div className="flex items-center gap-2 px-3 pt-2">
                                            <div className="flex-1 bg-white rounded-xl px-3 py-1.5 border-l-4 border-emerald-500">
                                                <p className="text-[10px] font-black text-emerald-600">{replyTo.author}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{replyTo.content}</p>
                                            </div>
                                            <button className="h-7 w-7 rounded-full hover:bg-gray-200 flex items-center justify-center" onClick={() => setReplyTo(null)}>
                                                <XIcon className="h-4 w-4 text-gray-500" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="p-2">
                                        {/* Students see locked banner */}
                                        {isGroupLocked && !canManage ? (
                                            <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                                                <LockIcon className="h-4 w-4 text-red-500" />
                                                <span className="text-sm font-bold text-red-600">This group is locked. Only the teacher can post.</span>
                                            </div>
                                        ) : isRecording ? (
                                            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-sm font-black text-red-500 flex-1">
                                                    Recording {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                                </span>
                                                <Button size="sm" variant="destructive" className="rounded-full h-8 px-4 gap-1 font-bold" onClick={stopRecording}>
                                                    <Square className="h-3 w-3 fill-white" /> Stop
                                                </Button>
                                            </div>
                                        ) : audioUrl ? (
                                            <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                                    <Mic className="h-4 w-4 text-white" />
                                                </div>
                                                <audio src={audioUrl} controls className="flex-1 h-8" />
                                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-500 hover:bg-red-50"
                                                    onClick={() => { setVoiceBlob(null); setAudioUrl(null); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" className="rounded-full h-10 w-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                                                    onClick={uploadVoice} disabled={isUploadingVoice}>
                                                    {isUploadingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm flex flex-col gap-0.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Title (optional)"
                                                        value={announcementTitle}
                                                        onChange={e => setAnnouncementTitle(e.target.value)}
                                                        className="text-xs font-bold text-emerald-700 outline-none bg-transparent placeholder:text-gray-300 w-full"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Type a message"
                                                        value={announcementText}
                                                        onChange={e => setAnnouncementText(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && announcementText.trim()) { e.preventDefault(); handlePostAnnouncement(); } }}
                                                        className="text-sm outline-none bg-transparent placeholder:text-gray-400 w-full"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioPick} />
                                                    {/* File Upload Button */}
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id="chat-file-upload"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append("file", file);
                                                                try {
                                                                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                                    const data = await res.json();
                                                                    handlePostAnnouncement(data.url, file.type.includes('image') ? 'image' : 'pdf');
                                                                } catch (err) {
                                                                    toast({ title: "Upload failed", variant: "destructive" });
                                                                }
                                                            }}
                                                        />
                                                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-emerald-600 hover:bg-emerald-50">
                                                            <PaperclipIcon className="h-5 w-5" />
                                                        </Button>
                                                    </div>

                                                    {!announcementText.trim() ? (
                                                        <Button
                                                            size="icon"
                                                            className={`rounded-full h-11 w-11 shadow-lg relative transition-all active:scale-90 ${isRecording ? 'bg-red-500 animate-pulse' :
                                                                micPermission === 'denied' ? 'bg-amber-500 hover:bg-amber-600' :
                                                                    'bg-emerald-600 hover:bg-emerald-700'
                                                                }`}
                                                            onClick={startRecording}
                                                        >
                                                            {micPermission === 'denied' ? <FileText className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
                                                            {micPermission === 'denied' && (
                                                                <div className="absolute -top-1 -right-1 bg-red-500 border-2 border-white rounded-full p-0.5 animate-bounce">
                                                                    <AlertCircle className="h-2 w-2 text-white" />
                                                                </div>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button size="icon" className="rounded-full h-11 w-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                                                            onClick={() => handlePostAnnouncement()} disabled={createAnnouncement.isPending}>
                                                            {createAnnouncement.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>


                        {/* ── ASSIGNMENTS ── */}
                        <TabsContent value="assignments" className="mt-0">
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <div>
                                        <CardTitle className="text-lg">{lang === 'en' ? 'Assignments' : 'اسائنمنٹس'}</CardTitle>
                                        <CardDescription>Homework, tests and tasks for this group</CardDescription>
                                    </div>
                                    {canManage && (
                                        <Button size="sm" className="rounded-xl shadow-sm gap-2">
                                            <Plus className="h-4 w-4" /> New Task
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {loadingAssignments ? (
                                        [1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl mb-3" />)
                                    ) : assignments.length > 0 ? (
                                        <div className="space-y-3">
                                            {assignments.map((task: any) => (
                                                <div key={task.id} className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-4">
                                                    <div className={`p-2.5 bg-gradient-to-br ${grad} rounded-xl text-white shrink-0`}>
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-sm">{task.title}</h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {task.dueDate && (
                                                                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Due {format(new Date(task.dueDate), 'MMM dd')}
                                                                </Badge>
                                                            )}
                                                            {task.type && (
                                                                <Badge variant="secondary" className="text-[10px] h-5 uppercase">
                                                                    {task.type}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="rounded-lg text-xs shrink-0">View</Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14 rounded-xl border-2 border-dashed border-border/50">
                                            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                            <p className="font-bold text-muted-foreground">No tasks assigned yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── ATTENDANCE ── */}
                        <TabsContent value="attendance" className="mt-0">
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <div>
                                        <CardTitle className="text-lg">{lang === 'en' ? 'Attendance' : 'حاضری'}</CardTitle>
                                        <CardDescription>
                                            {format(new Date(), 'EEEE, MMMM do yyyy')}
                                        </CardDescription>
                                    </div>
                                    {canManage && (
                                        <Button
                                            size="sm"
                                            className="rounded-xl bg-green-600 hover:bg-green-700 gap-2"
                                            onClick={handleSaveAttendance}
                                            disabled={recordAttendance.isPending}
                                        >
                                            {recordAttendance.isPending
                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                : <CheckCircle2 className="h-4 w-4" />}
                                            Save
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    {loadingStudents ? (
                                        [1, 2, 3].map(i => <Skeleton key={i} className="h-16 mx-4 mb-2 rounded-xl" />)
                                    ) : Array.isArray(students) && students.length > 0 ? (
                                        <div className="divide-y divide-border/50">
                                            {students.map((student: any, i: number) => {
                                                const s = attendanceMap[student.id] || null;
                                                return (
                                                    <div key={student.id} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${i % 2 === 0 ? 'bg-muted/5' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className={`text-xs font-bold bg-gradient-to-br ${grad} text-white`}>
                                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-bold">{student.firstName} {student.lastName}</p>
                                                                <p className="text-[10px] text-muted-foreground">{student.email?.split('@')[0]}</p>
                                                            </div>
                                                        </div>
                                                        {canManage ? (
                                                            <div className="flex gap-2">
                                                                {(['present', 'late', 'absent'] as const).map(status => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: status }))}
                                                                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all text-sm font-black
                                                                            ${s === status
                                                                                ? status === 'present' ? 'bg-green-500 border-green-500 text-white scale-110'
                                                                                    : status === 'absent' ? 'bg-red-500 border-red-500 text-white scale-110'
                                                                                        : 'bg-yellow-500 border-yellow-500 text-white scale-110'
                                                                                : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/50'
                                                                            }`}
                                                                        title={status}
                                                                    >
                                                                        {status === 'present' ? '✓' : status === 'absent' ? '✗' : '~'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs">—</Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14">
                                            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                            <p className="font-bold text-muted-foreground">No students in this group yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── PERFORMANCE ── */}
                        <TabsContent value="performance" className="mt-0">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">{lang === 'en' ? 'Performance' : 'کارکردگی'}</CardTitle>
                                    <CardDescription>Academic progress per student</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {Array.isArray(students) && students.length > 0 ? (
                                        <div className="divide-y divide-border/50">
                                            {students.map((s: any) => (
                                                <div key={s.id} className="flex items-center justify-between px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className={`text-xs font-bold bg-gradient-to-br ${grad} text-white`}>
                                                                {s.firstName?.[0]}{s.lastName?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-bold">{s.firstName} {s.lastName}</p>
                                                            <p className="text-xs text-muted-foreground">{s.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-lg text-xs gap-1.5"
                                                        onClick={() => setReportStudent(s)}
                                                    >
                                                        <BarChart2 className="h-3.5 w-3.5" />
                                                        View Report
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-14">
                                            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                            <p className="font-bold text-muted-foreground">No students to track yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── ANALYTICS ── */}
                        {canManage && (
                            <TabsContent value="analytics" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Students', value: students?.length ?? 0, icon: Users, color: 'from-blue-500/10 to-blue-500/5', iconColor: 'text-blue-600', bg: 'bg-blue-500/15' },
                                        { label: 'Teachers', value: teachers?.length ?? 0, icon: Shield, color: 'from-purple-500/10 to-purple-500/5', iconColor: 'text-purple-600', bg: 'bg-purple-500/15' },
                                        { label: 'Announcements', value: announcements?.length ?? 0, icon: Megaphone, color: 'from-green-500/10 to-green-500/5', iconColor: 'text-green-600', bg: 'bg-green-500/15' },
                                        { label: 'Assignments', value: assignments?.length ?? 0, icon: BookOpen, color: 'from-orange-500/10 to-orange-500/5', iconColor: 'text-orange-600', bg: 'bg-orange-500/15' },
                                    ].map(stat => (
                                        <Card key={stat.label} className={`border-none shadow-sm bg-gradient-to-br ${stat.color}`}>
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className={`p-2.5 ${stat.bg} rounded-xl`}>
                                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">{stat.value}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Capacity bar */}
                                {(group as any).capacity && (
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-bold">Capacity Usage</p>
                                                <p className="text-sm font-black">{students?.length ?? 0} / {(group as any).capacity}</p>
                                            </div>
                                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                                                    style={{ width: `${Math.min(100, ((students?.length ?? 0) / (group as any).capacity) * 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                {(group as any).capacity - (students?.length ?? 0)} spots remaining
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Attendance stats */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <BarChart2 className="h-4 w-4 text-primary" /> Attendance Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {analytics?.attendanceStats && analytics.attendanceStats.length > 0 ? (
                                            <div className="space-y-3">
                                                {analytics.attendanceStats.map((s: any) => {
                                                    const total = analytics.attendanceStats.reduce((acc: number, x: any) => acc + Number(x.count), 0);
                                                    const pct = total > 0 ? Math.round((Number(s.count) / total) * 100) : 0;
                                                    return (
                                                        <div key={s.status} className="flex items-center gap-3">
                                                            <Badge className={`w-16 justify-center text-[10px] font-bold border-none ${s.status === 'present' ? 'bg-green-100 text-green-700' : s.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {s.status}
                                                            </Badge>
                                                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${s.status === 'present' ? 'bg-green-500' : s.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-black w-8 text-right">{s.count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-6">No attendance data yet. Mark attendance to see stats.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                {/* ── Right Sidebar: Members ── */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="border-none shadow-md overflow-hidden">
                        {/* Members header */}
                        <div className={`bg-gradient-to-br ${grad} p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-black text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {lang === 'en' ? 'Members' : 'ارکان'}
                                </h3>
                                <Badge className="bg-white/20 text-white border-white/30 font-bold text-xs">
                                    {filteredMembers.length} TOTAL
                                </Badge>
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
                                <Input
                                    placeholder={lang === 'en' ? 'Search members...' : 'رکن تلاش کریں...'}
                                    value={searchMember}
                                    onChange={e => setSearchMember(e.target.value)}
                                    className="pl-8 bg-white/15 border-white/20 text-white placeholder:text-white/50 text-sm h-9 rounded-xl focus-visible:ring-white/30"
                                />
                            </div>
                        </div>

                        {/* Add member button */}
                        {canManage && (
                            <div className="px-4 pt-3 pb-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full rounded-xl gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                                    onClick={() => setAddMemberOpen(true)}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {lang === 'en' ? 'Add Member' : 'رکن شامل کریں'}
                                </Button>
                            </div>
                        )}

                        {/* Member list */}
                        <ScrollArea className="h-[420px]">
                            {loadingStudents || loadingTeachers ? (
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-1.5">
                                                <Skeleton className="h-3 w-28 rounded" />
                                                <Skeleton className="h-2.5 w-20 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredMembers.length > 0 ? (
                                <div className="p-3 space-y-1">
                                    {filteredMembers.map((member: any) => (
                                        <div
                                            key={`${member.type}-${member.id}`}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors group/member"
                                        >
                                            <Avatar className="h-10 w-10 shrink-0">
                                                <AvatarFallback className={`text-xs font-black ${member.type === 'teacher' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {member.firstName?.[0]?.toUpperCase()}{member.lastName?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge className={`text-[9px] font-bold border-none h-4 px-1.5 ${member.type === 'teacher' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {member.type === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {member.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {canManage && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 opacity-0 group-hover/member:opacity-100 transition-opacity"
                                                        >
                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 px-2 py-2 rounded-xl">
                                                        <DropdownMenuItem className="rounded-lg gap-2">
                                                            <Mail className="h-4 w-4" /> Message
                                                        </DropdownMenuItem>
                                                        {canManage && member.type === 'student' && (
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 text-blue-600 focus:text-blue-700"
                                                                onClick={() => {
                                                                    setUserToTransfer(member);
                                                                    setTransferOpen(true);
                                                                }}
                                                            >
                                                                <TrendingUp className="h-4 w-4" /> Transfer
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="rounded-lg gap-2 text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => handleRemoveMember(member)}
                                                            disabled={removeStudent.isPending || removeTeacher.isPending}
                                                        >
                                                            <UserMinus className="h-4 w-4" /> Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                    <Users className="h-8 w-8 opacity-20 mb-2" />
                                    <p className="text-xs font-bold">
                                        {searchMember
                                            ? "No members match your search"
                                            : "No members yet"}
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </Card>

                    {/* Group Info Card */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            <h4 className="font-bold text-sm">Group Info</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                                    <span className="text-muted-foreground font-medium">Status</span>
                                    <Badge className={`text-[10px] font-bold border-none ${(group as any).status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {(group as any).status?.toUpperCase() || 'ACTIVE'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                                    <span className="text-muted-foreground font-medium">Capacity</span>
                                    <span className="font-black">{(group as any).capacity ? `${students?.length ?? 0}/${(group as any).capacity}` : 'Unlimited'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-muted-foreground font-medium">Created</span>
                                    <span className="font-bold">{(group as any).createdAt ? format(new Date((group as any).createdAt), 'MMM dd, yyyy') : '—'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Add Member Dialog (Smart User Picker + Create New) ── */}
            <Dialog open={addMemberOpen} onOpenChange={open => { setAddMemberOpen(open); if (!open) { setMemberUserId(""); setMemberEmail(""); setCreateNewMode(false); } }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5 text-primary" />
                            {lang === 'en' ? 'Add Member to Group' : 'گروپ میں رکن شامل کریں'}
                        </DialogTitle>
                        <DialogDescription>
                            {createNewMode ? "Create a new student account and add them to this group." : "Select an existing user to add to this group."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mode toggle */}
                    <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-2">
                        <Button
                            variant={!createNewMode ? "secondary" : "ghost"}
                            size="sm"
                            className={`flex-1 rounded-xl font-bold ${!createNewMode ? 'shadow-sm' : ''}`}
                            onClick={() => setCreateNewMode(false)}
                        >
                            Select Existing
                        </Button>
                        <Button
                            variant={createNewMode ? "secondary" : "ghost"}
                            size="sm"
                            className={`flex-1 rounded-xl font-bold ${createNewMode ? 'shadow-sm' : ''}`}
                            onClick={() => { setCreateNewMode(true); setMemberType("student"); }}
                        >
                            Create New Student
                        </Button>
                    </div>

                    {!createNewMode ? (
                        <>
                            {/* Role toggle (only for existing) */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    variant={memberType === "student" ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-xl flex-1 gap-2"
                                    onClick={() => setMemberType("student")}
                                >
                                    <span>👨‍🎓</span> Add Student
                                </Button>
                                <Button
                                    variant={memberType === "teacher" ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-xl flex-1 gap-2"
                                    onClick={() => setMemberType("teacher")}
                                >
                                    <span>👨‍🏫</span> Add Teacher
                                </Button>
                            </div>

                            {/* Search box */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={memberEmail}
                                    onChange={e => setMemberEmail(e.target.value)}
                                    className="pl-9 rounded-xl"
                                    autoFocus
                                />
                            </div>

                            {/* User list */}
                            <UserPickerList
                                searchQuery={memberEmail}
                                memberType={memberType}
                                existingIds={[
                                    ...(Array.isArray(students) ? students.map((s: any) => s.id) : []),
                                    ...(Array.isArray(teachers) ? teachers.map((t: any) => t.id) : [])
                                ]}
                                onSelect={(userId) => {
                                    const mutation = memberType === "student" ? addStudent : assignTeacher;
                                    mutation.mutate(
                                        { groupId, userId },
                                        {
                                            onSuccess: () => {
                                                toast({ title: `✅ ${memberType === 'student' ? 'Student' : 'Teacher'} added successfully!` });
                                                setAddMemberOpen(false);
                                                setMemberUserId("");
                                                setMemberEmail("");
                                            },
                                            onError: (err: any) => toast({
                                                title: "Failed to add member",
                                                description: err?.message,
                                                variant: "destructive"
                                            })
                                        }
                                    );
                                }}
                                isPending={addStudent.isPending || assignTeacher.isPending}
                            />
                        </>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">First Name</Label>
                                    <Input
                                        placeholder="John"
                                        className="rounded-xl"
                                        value={newStudentData.firstName}
                                        onChange={e => setNewStudentData(p => ({ ...p, firstName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Last Name</Label>
                                    <Input
                                        placeholder="Doe"
                                        className="rounded-xl"
                                        value={newStudentData.lastName}
                                        onChange={e => setNewStudentData(p => ({ ...p, lastName: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Student ID (Username)</Label>
                                <Input
                                    placeholder="stu123"
                                    className="rounded-xl"
                                    value={newStudentData.studentId}
                                    onChange={e => setNewStudentData(p => ({ ...p, studentId: e.target.value, username: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="rounded-xl"
                                    value={newStudentData.password}
                                    onChange={e => setNewStudentData(p => ({ ...p, password: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Email (Optional)</Label>
                                <Input
                                    placeholder="student@example.com"
                                    className="rounded-xl"
                                    value={newStudentData.email}
                                    onChange={e => setNewStudentData(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <Button
                                className="w-full rounded-xl h-11 font-bold mt-2"
                                disabled={!newStudentData.studentId || !newStudentData.password || addStudent.isPending}
                                onClick={async () => {
                                    try {
                                        // 1. Create the user
                                        const res = await fetch("/api/signup/local", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                ...newStudentData,
                                                username: newStudentData.studentId, // Use studentId as username
                                                role: "student"
                                            }),
                                        });

                                        if (!res.ok) {
                                            const error = await res.json();
                                            throw new Error(error.message);
                                        }

                                        const newUser = await res.json();

                                        // 2. Add to group
                                        addStudent.mutate(
                                            { groupId, userId: newUser.id },
                                            {
                                                onSuccess: () => {
                                                    toast({ title: "✅ New student created and added successfully!" });
                                                    setAddMemberOpen(false);
                                                    setNewStudentData({ firstName: "", lastName: "", studentId: "", username: "", password: "", email: "" });
                                                }
                                            }
                                        );
                                    } catch (err: any) {
                                        toast({ title: "Error", description: err.message, variant: "destructive" });
                                    }
                                }}
                            >
                                {addStudent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                Create & Add Student
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Transfer Student Dialog ── */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Transfer Student
                        </DialogTitle>
                        <DialogDescription>
                            Move <strong>{userToTransfer?.firstName} {userToTransfer?.lastName}</strong> to another group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="text-sm font-bold mb-2 block">Target Group</Label>
                        <GroupSelect
                            value={targetGroupId}
                            onValueChange={setTargetGroupId}
                            excludeId={groupId}
                            getGroups={getGroups}
                            category={category}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransferOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            disabled={!targetGroupId || transferStudent.isPending}
                            className="rounded-xl px-6"
                            onClick={() => {
                                transferStudent.mutate(
                                    { userId: userToTransfer.id, fromGroupId: groupId, toGroupId: targetGroupId },
                                    {
                                        onSuccess: () => {
                                            toast({ title: "✅ Student transferred successfully!" });
                                            setTransferOpen(false);
                                            setUserToTransfer(null);
                                            setTargetGroupId("");
                                        }
                                    }
                                );
                            }}
                        >
                            {transferStudent.isPending ? "Transferring..." : "Confirm Transfer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Student Report Dialog ── */}
            {
                reportStudent && (
                    <StudentReportDialog
                        student={reportStudent}
                        groupId={groupId!}
                        grad={grad}
                        onClose={() => setReportStudent(null)}
                        setCallType={setCallType}
                        setIsCallOpen={setIsCallOpen}
                    />
                )
            }
            {/* ── Remove Member Confirmation ── */}
            <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {lang === 'en' ? 'Remove Member?' : 'ممبر کو ہٹائیں؟'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            {lang === 'en'
                                ? `Are you sure you want to remove ${memberToRemove?.firstName} ${memberToRemove?.lastName} from this group?`
                                : `کیا آپ واقعی ${memberToRemove?.firstName} ${memberToRemove?.lastName} کو اس گروپ سے ہٹانا چاہتے ہیں؟`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">{lang === 'en' ? 'Cancel' : 'منسوخ'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveMember}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6"
                        >
                            {lang === 'en' ? 'Remove' : 'ہٹائیں'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CallOverlay
                isOpen={isCallOpen}
                onClose={() => setIsCallOpen(false)}
                recipientName={(group as any)?.name || "Group"}
                callType={callType}
            />

            {/* Mic Help Button */}
            {(micPermission as any) === 'denied' && (
                <div className="fixed bottom-24 right-8 z-[50]">
                    <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full shadow-2xl gap-2 font-black text-[10px] uppercase pr-4 animate-bounce border-2 border-white dark:border-zinc-800"
                        onClick={() => setShowMicHelper(true)}
                    >
                        <AlertCircle className="h-4 w-4" /> Unblock Mic
                    </Button>
                </div>
            )}

            {/* Mic Helper Modal */}
            {showMicHelper && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                            <MicOff className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-center text-zinc-900 dark:text-zinc-100 mb-2">Microphone Blocked</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm font-medium mb-8 leading-relaxed">
                            {isIframe
                                ? "You are using the Replit Preview window. For security, browsers block recording here. Please click 'Open in New Tab' to fix this."
                                : "Your browser has blocked the microphone. Click the Lock (🔒) icon in your address bar and set Microphone to 'Allow'."}
                        </p>

                        <div className="space-y-3">
                            {isIframe ? (
                                <>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-800">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                                            <ExternalLink className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Recording is blocked in this preview box. Click the small square icon with an arrow in the top-right of this window or the button below.</p>
                                    </div>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg flex gap-2"
                                        onClick={() => {
                                            const url = window.location.href;
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }}
                                    >
                                        <ExternalLink className="h-5 w-5" /> Open in New Tab to Fix
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase tracking-widest text-[11px]"
                                    onClick={() => setShowMicHelper(false)}
                                >
                                    Got It, I'll Try Now
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full text-zinc-400 font-bold uppercase tracking-widest text-[10px]"
                                onClick={() => {
                                    setShowMicHelper(false);
                                    audioInputRef.current?.click();
                                }}
                            >
                                Send Voice File Instead
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Subcomponent: Group Select ──────────────────────────────────────
function GroupSelect({ value, onValueChange, excludeId, getGroups, category }: any) {
    const { data } = getGroups({ status: 'active', category });
    const options = (data?.groups || []).filter((g: any) => g.id !== excludeId);

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select a group..." />
            </SelectTrigger>
            <SelectContent>
                {options.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
                {options.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">No other active groups found.</div>
                )}
            </SelectContent>
        </Select>
    );
}

// ── Subcomponent: User Picker List ──────────────────────────────────
function UserPickerList({ searchQuery, memberType, existingIds, onSelect, isPending }: {
    searchQuery: string;
    memberType: "student" | "teacher";
    existingIds: string[];
    onSelect: (userId: string) => void;
    isPending: boolean;
}) {
    const { data: allUsers = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/users"],
        queryFn: async () => {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
    });

    const filtered = useMemo(() => {
        return allUsers.filter((u: any) => {
            if (existingIds.includes(u.id)) return false;
            if (memberType === "student" && u.role?.toLowerCase() !== "student") return false;
            if (memberType === "teacher" && u.role?.toLowerCase() !== "teacher") return false;
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q)
            );
        });
    }, [allUsers, searchQuery, memberType, existingIds]);

    return (
        <ScrollArea className="h-64 rounded-xl border border-border/60 bg-muted/5">
            {isLoading ? (
                <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3 w-32 rounded" />
                                <Skeleton className="h-2.5 w-48 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-20 mb-2" />
                    <p className="text-sm font-bold">
                        {searchQuery ? "No users match your search" : `No available ${memberType}s to add`}
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                        {existingIds.length > 0 ? "All eligible users are already in this group." : ""}
                    </p>
                </div>
            ) : (
                <div className="p-2 space-y-1">
                    {filtered.map((u: any) => (
                        <button
                            key={u.id}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:border-primary/30 border border-transparent transition-all text-left group disabled:opacity-50"
                            onClick={() => onSelect(u.id)}
                            disabled={isPending}
                        >
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className={`text-xs font-black ${memberType === 'teacher' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {(u.firstName?.[0] || '?').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold group-hover:text-primary transition-colors">
                                    {u.firstName} {u.lastName}
                                    {(!u.firstName && !u.lastName) ? u.email?.split('@')[0] : ''}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                            <Badge className={`shrink-0 text-[10px] font-bold border-none ${memberType === 'teacher' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {memberType}
                            </Badge>
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                            ) : (
                                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </ScrollArea>
    );
}

// Missing imports to be added at the top if not present
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Subcomponent: Student Report Dialog ─────────────────────────────
function StudentReportDialog({ student, groupId, grad, onClose, setCallType, setIsCallOpen }: {
    student: any;
    groupId: string;
    grad: string;
    onClose: () => void;
    setCallType: (type: 'audio' | 'video') => void;
    setIsCallOpen: (open: boolean) => void;
}) {
    const { data: attendance = [], isLoading: loadingAtt } = useQuery<any[]>({
        queryKey: ["/api/groups", groupId, "attendance", student.id],
        queryFn: async () => {
            const res = await fetch(`/api/groups/${groupId}/attendance`);
            if (!res.ok) throw new Error("Failed to fetch attendance");
            const all = await res.json();
            return all.filter((a: any) => a.userId === student.id);
        }
    });

    const { data: dailyStats = [] } = useQuery<any[]>({
        queryKey: ["/api/daily-stats", student.id],
        queryFn: async () => {
            const res = await fetch(`/api/daily-stats?userId=${student.id}`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    const present = attendance.filter((a: any) => a.status === "present").length;
    const absent = attendance.filter((a: any) => a.status === "absent").length;
    const late = attendance.filter((a: any) => a.status === "late").length;
    const total = attendance.length;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

    const avgQuiz = dailyStats.length > 0
        ? Math.round(dailyStats.reduce((acc: number, d: any) => acc + (d.quizScore || 0), 0) / dailyStats.length)
        : 0;
    const totalHifz = dailyStats.reduce((acc: number, d: any) => acc + (d.hifzProgress || 0), 0);

    const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();

    // Determine color based on attendance
    const attendanceColor = attendancePct >= 80 ? '#22c55e' : attendancePct >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                >
                    {/* Header with Gradient Background */}
                    <div className={`bg-gradient-to-br ${grad} p-6 relative overflow-hidden`}>
                        {/* Decorative blobs */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white/30 shadow-xl">
                                    <AvatarFallback className="text-xl font-black bg-white/20 text-white backdrop-blur-md">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-white">
                                    <h2 className="text-2xl font-black leading-tight tracking-tight">
                                        {student.firstName} {student.lastName}
                                    </h2>
                                    <p className="text-white/70 text-sm font-medium flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        {student.email}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white hover:bg-white/20 h-9 w-9 rounded-full shrink-0"
                            >
                                <XCircle className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="max-h-[75vh]">
                        <div className="p-6 space-y-6">
                            {/* Attendance & Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Attendance Circle Card */}
                                <Card className="border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-sm relative overflow-hidden group">
                                    <CardContent className="p-6 flex flex-col items-center">
                                        <div className="w-32 h-32 mb-4 relative drop-shadow-xl">
                                            <CircularProgressbar
                                                value={attendancePct}
                                                text={`${attendancePct}%`}
                                                styles={buildStyles({
                                                    textSize: '22px',
                                                    pathColor: attendanceColor,
                                                    textColor: attendanceColor,
                                                    trailColor: '#e2e8f0',
                                                    strokeLinecap: 'round',
                                                })}
                                            />
                                            {attendancePct >= 90 && (
                                                <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-lg h-8 w-8 flex items-center justify-center animate-bounce">
                                                    <Trophy className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-4">Attendance Rate</p>

                                        <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <div className="text-center">
                                                <p className="text-sm font-black text-green-600">{present}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pres.</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-amber-500">{late}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Late</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-red-500">{absent}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Abs.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance Badges */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500 rounded-xl shadow-blue-500/20 shadow-lg">
                                                    <Star className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-blue-800/60 dark:text-blue-200/60 uppercase">Average Quiz</p>
                                                    <p className="text-xl font-black text-blue-900 dark:text-blue-100">{avgQuiz > 0 ? `${avgQuiz}%` : 'Pending'}</p>
                                                </div>
                                            </div>
                                            {avgQuiz >= 80 && <Badge className="bg-blue-500 text-white border-none">Top Score</Badge>}
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.02 }} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200/50 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 rounded-xl shadow-emerald-500/20 shadow-lg">
                                                    <BookMarked className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-800/60 dark:text-emerald-200/60 uppercase">Hifz Progress</p>
                                                    <p className="text-xl font-black text-emerald-900 dark:text-emerald-100">{totalHifz > 0 ? `${totalHifz} Ayahs` : 'No Data'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3].map(i => <Zap key={i} className={`h-3 w-3 ${i <= Math.ceil(totalHifz / 10) ? 'text-emerald-500 fill-emerald-500' : 'text-emerald-300'}`} />)}
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Overall Standing Card */}
                                    <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-3">
                                            <Award className="h-6 w-6 text-yellow-400" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Active Student</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                                                onClick={() => { setCallType('audio'); setIsCallOpen(true); }}
                                            >
                                                <Phone className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                                                onClick={() => { setCallType('video'); setIsCallOpen(true); }}
                                            >
                                                <Video className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sessions Table */}
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Recent History
                                </h3>
                                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
                                    {attendance.length > 0 ? (
                                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {[...attendance].reverse().slice(0, 5).map((a: any, i: number) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    className="flex items-center justify-between px-5 py-4 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full ${a.status === 'present' ? 'bg-green-500 ring-4 ring-green-500/10'
                                                            : a.status === 'late' ? 'bg-amber-500 ring-4 ring-amber-500/10'
                                                                : 'bg-red-500 ring-4 ring-red-500/10'
                                                            }`} />
                                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">
                                                            {a.date ? format(new Date(a.date), 'EEEE, MMMM do') : 'Unknown Date'}
                                                        </span>
                                                    </div>
                                                    <Badge className={`text-[10px] font-black border-none px-3 h-6 rounded-full ${a.status === 'present' ? 'bg-green-100 text-green-700'
                                                        : a.status === 'late' ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {a.status.toUpperCase()}
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-bold text-muted-foreground">No sessions recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 pt-0">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-widest border-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            Back to Overview
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
