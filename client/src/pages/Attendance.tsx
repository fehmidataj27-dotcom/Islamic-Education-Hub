import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
import {
    Calendar as CalendarIcon,
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Save,
    Plus,
    UserPlus,
    Trash2,
    AlertTriangle,
    Search,
    Filter,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    useUsers,
    useBulkUpdateAttendance,
    useCreateUser,
    useDeleteUser,
    useDailyStatsByDate,
    useDailyStatsHistory
} from "@/hooks/use-resources";
import { useGroups } from "@/hooks/use-groups";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Attendance() {
    const { lang } = useTheme();
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { getGroups, getUserGroups, getStudents } = useGroups();
    const { data: statsHistory = [], isLoading: historyLoading } = useDailyStatsHistory();
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
    const isTeacher = currentUser?.role?.toLowerCase() === 'teacher';

    // Fetch appropriate groups based on role
    const { data: allGroupsData, isLoading: allGroupsLoading } = getGroups({ limit: 100 });
    const { data: userGroupsData, isLoading: userGroupsLoading } = getUserGroups();

    // For Admins, show ALL groups. For Teachers, show only THEIR groups.
    const myGroups = isAdmin ? (allGroupsData?.groups || []) : (userGroupsData || []);
    const groupsLoading = isAdmin ? allGroupsLoading : userGroupsLoading;

    const { data: groupStudents = [], isLoading: groupStudentsLoading } = getStudents(selectedGroupId);

    // Track initialization state to avoid resetting local edits on refetches
    const [initKey, setInitKey] = useState<string>("");

    // Default to first group for teachers
    useEffect(() => {
        if (isTeacher && myGroups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(myGroups[0].id);
        }
    }, [myGroups, isTeacher, selectedGroupId]);

    const { data: users, isLoading: usersLoading } = useUsers();
    const createUserMutation = useCreateUser();
    const deleteUserMutation = useDeleteUser();
    const bulkUpdate = useBulkUpdateAttendance();

    // If teacher selects a group, use those students. Otherwise use all if admin.
    const effectiveStudents = (selectedGroupId && selectedGroupId !== 'all')
        ? groupStudents
        : (isAdmin ? users?.filter((u: any) => u.role?.toLowerCase() === 'student') : []);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [newStudent, setNewStudent] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const isStudent = currentUser?.role?.toLowerCase() === "student";
    const isAdminOrTeacher = currentUser?.role?.toLowerCase() === "admin" || currentUser?.role?.toLowerCase() === "teacher";

    // Local state for attendance edits
    const [localAttendance, setLocalAttendance] = useState<Record<string, string>>({});

    // Fetch stats for the selected date
    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
    const { data: dateStats, isLoading: statsLoading } = useDailyStatsByDate(formattedDate);

    // Reset local attendance ONLY when date or group fundamentally changes
    const currentKey = `${selectedGroupId}-${formattedDate}-${effectiveStudents?.length}`;

    useEffect(() => {
        if (effectiveStudents && dateStats && currentKey !== initKey) {
            const initial: Record<string, string> = {};
            effectiveStudents.forEach((u: any) => {
                const existing = dateStats?.find((s: any) => s.userId === u.id);
                if (existing) {
                    // Check if it's late via a custom field or daily stats integration
                    // For now, we use a simple mapping, but teachers can toggle
                    initial[u.id] = existing.attendance ? "Present" : "Absent";
                } else {
                    initial[u.id] = "Absent";
                }
            });
            setLocalAttendance(initial);
            setInitKey(currentKey);
        }
    }, [effectiveStudents, dateStats, currentKey, initKey]);

    const t = {
        title: lang === 'en' ? 'Attendance Tracking' : 'حاضری کی ٹریکنگ',
        teacherPanel: lang === 'en' ? 'Teacher Panel' : 'ٹیچر پینل',
        markAllPresent: lang === 'en' ? 'Mark All Present' : 'سب کو حاضر لگائیں',
        save: lang === 'en' ? 'Save Attendance' : 'حاضری محفوظ کریں',
        date: lang === 'en' ? 'Select Date' : 'تاریخ منتخب کریں',
        present: lang === 'en' ? 'Present' : 'حاضر',
        absent: lang === 'en' ? 'Absent' : 'غیر حاضر',
        late: lang === 'en' ? 'Late' : 'تاخیر',
        addStudent: lang === 'en' ? 'Add Student' : 'طالب علم شامل کریں',
        firstName: lang === 'en' ? 'First Name' : 'پہلا نام',
        lastName: lang === 'en' ? 'Last Name' : 'آخری نام',
        email: lang === 'en' ? 'Email Address' : 'ای میل ایڈریس',
        overall: lang === 'en' ? 'Overall Attendance' : 'مجموعی حاضری',
        percentage: lang === 'en' ? 'Attendance Percentage' : 'حاضری کا تناسب',
        totalDays: lang === 'en' ? 'Total Days' : 'کل دن',
    };

    const handleStatusChange = (userId: string, status: string) => {
        setLocalAttendance(prev => ({ ...prev, [userId]: status }));
    };

    const markAll = () => {
        const allPresent: Record<string, string> = {};
        Object.keys(localAttendance).forEach(id => {
            allPresent[id] = "Present";
        });
        setLocalAttendance(allPresent);
    };

    const handleSave = async () => {
        try {
            const updates = Object.entries(localAttendance).map(([userId, status]) => ({
                userId,
                attendance: status === "Present" || status === "Late",
                status: status.toLowerCase()
            }));
            // Pass the date and groupId to the bulk update
            await bulkUpdate.mutateAsync({
                date: date?.toISOString(),
                groupId: selectedGroupId,
                updates
            });
            toast({ title: "Success", description: "Attendance records saved successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save attendance.", variant: "destructive" });
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserMutation.mutateAsync({
                ...newStudent,
                role: "student"
            });
            setIsAddModalOpen(false);
            setNewStudent({ firstName: "", lastName: "", email: "" });
            toast({ title: "Success", description: "Student added successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to add student.", variant: "destructive" });
        }
    };

    const handleDeleteStudent = async () => {
        if (!userToDelete) return;
        try {
            await deleteUserMutation.mutateAsync(userToDelete);
            toast({ title: "Success", description: "Student removed successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to remove student.", variant: "destructive" });
        } finally {
            setUserToDelete(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
            case "Absent": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
            case "Late": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
            default: return "";
        }
    };

    const studentsCount = effectiveStudents?.length || 0;

    if (isStudent) {
        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <ClipboardList className="h-32 w-32 text-emerald-900" />
                    </div>
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-800">
                                {t.overall}
                            </h1>
                        </div>
                        <p className="text-slate-500 font-bold pl-1.5 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            {lang === 'en' ? 'Track your overall presence across all sessions' : 'تمام سیشنز میں اپنی مجموعی حاضری کو ٹریک کریں'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-none shadow-md bg-emerald-500 text-white overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-100 flex items-center gap-2">
                                    <Activity className="h-3 w-3" />
                                    {t.percentage}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black">
                                    {statsHistory.length > 0
                                        ? Math.round((statsHistory.filter(a => a.attendance).length / statsHistory.length) * 100)
                                        : 0}%
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-none shadow-md bg-white text-emerald-600 overflow-hidden relative border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {t.present}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-slate-800">
                                    {statsHistory.filter(a => a.attendance).length}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="border-none shadow-md bg-white text-blue-600 overflow-hidden relative border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3 text-blue-500" />
                                    {t.totalDays}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-slate-800">
                                    {statsHistory.length}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <Card className="border-slate-50 shadow-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-800">Attendance History</CardTitle>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed Daily Log</p>
                        </div>
                        <CalendarIcon className="h-6 w-6 text-slate-300" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {historyLoading ? (
                            <div className="p-24 flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                                <p className="font-bold text-slate-400 animate-pulse">Loading History...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-xs px-8">Date</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-xs">Status</TableHead>
                                        <TableHead className="font-black text-slate-500 uppercase tracking-widest text-xs text-right px-8">Session Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statsHistory.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-emerald-50/20 transition-colors border-slate-50">
                                            <TableCell className="font-bold py-5 px-8">
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </div>
                                                    {format(new Date(record.date), "PPP")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-wider border-none",
                                                    record.attendance ? "bg-green-100 text-green-700 shadow-sm" : "bg-rose-100 text-rose-700 shadow-sm"
                                                )}>
                                                    <div className="flex items-center gap-1.5">
                                                        {record.attendance ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                        {record.attendance ? "Present" : "Absent"}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8 text-slate-400 font-bold italic text-sm">
                                                Recorded by Teacher
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {statsHistory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-32">
                                                <div className="flex flex-col items-center gap-4 opacity-20">
                                                    <Search className="h-16 w-16" />
                                                    <p className="font-black text-xl tracking-tight">No attendance records found yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdminOrTeacher && currentUser) {
        return (
            <div className="flex items-center justify-center p-12">
                <Card className="max-w-md w-full p-6 text-center space-y-4">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold">Access Denied</h2>
                    <p className="text-muted-foreground">This panel is only accessible to Teachers and Admins.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        {t.title}
                    </h1>
                    <p className="text-muted-foreground">{t.teacherPanel}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">Group:</span>
                        <Select
                            value={selectedGroupId}
                            onValueChange={setSelectedGroupId}
                            disabled={groupsLoading}
                        >
                            <SelectTrigger className="w-[200px] rounded-xl shadow-sm border-emerald-100">
                                {groupsLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="All Students" />
                                )}
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {isAdmin && (
                                    <SelectItem value="all">All Students (Admin)</SelectItem>
                                )}
                                {myGroups.length > 0 ? (
                                    myGroups.map((g) => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))
                                ) : (
                                    !groupsLoading && <div className="p-2 text-xs text-muted-foreground text-center">No groups available</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal rounded-xl border-emerald-100 shadow-sm", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                                {date ? format(date, "PPP") : <span>{t.date}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>

                    <Button onClick={markAll} variant="secondary" disabled={studentsCount === 0} className="rounded-xl shadow-sm">
                        {t.markAllPresent}
                    </Button>

                    <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="rounded-xl shadow-sm border-emerald-100 gap-2">
                        <UserPlus className="h-4 w-4 text-emerald-600" />
                        {t.addStudent}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-none shadow-md bg-emerald-50 text-emerald-900 overflow-hidden relative group">
                        <div className="absolute top-2 right-2 p-2 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> {t.present}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-emerald-600">{Object.values(localAttendance).filter(s => s === 'Present').length}</div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-none shadow-md bg-red-50 text-red-900 overflow-hidden relative group">
                        <div className="absolute top-2 right-2 p-2 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <XCircle className="h-12 w-12" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> {t.absent}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-red-600">{Object.values(localAttendance).filter(s => s === 'Absent').length}</div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-none shadow-md bg-amber-50 text-amber-900 overflow-hidden relative group">
                        <div className="absolute top-2 right-2 p-2 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <Clock className="h-12 w-12" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4" /> {t.late}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-amber-600">{Object.values(localAttendance).filter(s => s === 'Late').length}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Card className="border-emerald-50 shadow-xl rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    {usersLoading || groupStudentsLoading || statsLoading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading student data...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-xs px-8 h-16">Student Profile</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-xs h-16">Current Status</TableHead>
                                    <TableHead className="text-right font-black text-slate-500 uppercase tracking-widest text-xs px-8 h-16">Marking Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {effectiveStudents.map((student: any) => (
                                    <TableRow key={student.id} className="hover:bg-emerald-50/30 transition-colors border-slate-50">
                                        <TableCell className="font-bold px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 text-sm font-black shadow-inner">
                                                    {student.firstName?.[0] || '?'}{student.lastName?.[0] || ''}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 font-black">{student.firstName} {student.lastName}</span>
                                                    <span className="text-xs font-bold text-slate-400">{student.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-wider border-none shadow-sm",
                                                getStatusColor(localAttendance[student.id])
                                            )}>
                                                {localAttendance[student.id] || "Absent"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-8 space-x-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleStatusChange(student.id, "Present")}
                                                className={cn("rounded-xl font-black gap-2 transition-all", localAttendance[student.id] === 'Present' ? "bg-green-500 text-white hover:bg-green-600 scale-105" : "bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600")}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                {t.present}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleStatusChange(student.id, "Absent")}
                                                className={cn("rounded-xl font-black gap-2 transition-all", localAttendance[student.id] === 'Absent' ? "bg-rose-500 text-white hover:bg-rose-600 scale-105" : "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600")}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                {t.absent}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleStatusChange(student.id, "Late")}
                                                className={cn("rounded-xl font-black gap-2 transition-all", localAttendance[student.id] === 'Late' ? "bg-amber-500 text-white hover:bg-amber-600 scale-105" : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600")}
                                            >
                                                <Clock className="h-4 w-4" />
                                                {t.late}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {studentsCount === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Search className="h-16 w-16" />
                                                <p className="font-black text-xl tracking-tight">No students found for this group.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-2xl border border-emerald-50 mb-8">
                <div className="flex items-center gap-4 pl-4">
                    <div className="w-2 h-10 rounded-full bg-emerald-500 hidden md:block" />
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{studentsCount} STUDENTS</p>
                        <p className="text-xs font-bold text-slate-300">Ready for synchronization</p>
                    </div>
                </div>
                <Button
                    size="lg"
                    className="gap-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-black px-12 bg-emerald-600 hover:bg-emerald-700 py-8"
                    onClick={handleSave}
                    disabled={bulkUpdate.isPending || studentsCount === 0}
                >
                    {bulkUpdate.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    {t.save}
                </Button>
            </div>

            {/* Add Student Sheets/Dialogs could go here */}
            {/* ... Rest of existing Modals for Add Student and Delete Confirmation ... */}

            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
                    <AlertDialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 mx-auto">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-slate-800 text-center">
                            Delete Student Record?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-slate-500 text-center">
                            This action cannot be undone. This will permanently remove the student's profile and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-8">
                        <AlertDialogCancel className="rounded-2xl font-black px-8 border-slate-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 text-white hover:bg-red-700 rounded-2xl font-black px-8 shadow-lg shadow-red-200">
                            Delete Student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
