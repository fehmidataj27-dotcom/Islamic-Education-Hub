import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Users, Search, UserPlus, Trash2, Loader2, Eye, EyeOff, Copy, CheckCircle2,
    GraduationCap, BookOpenCheck, ShieldCheck, UserCircle2, KeyRound, IdCard, Mail
} from "lucide-react";
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/use-resources";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
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
import { AlertTriangle } from "lucide-react";

const EMPTY_FORM = { firstName: "", lastName: "", role: "student", username: "", studentId: "", password: "" };

const roleColors: Record<string, string> = {
    admin: "bg-rose-100 text-rose-700 border-rose-200",
    teacher: "bg-violet-100 text-violet-700 border-violet-200",
    student: "bg-emerald-100 text-emerald-700 border-emerald-200",
    parent: "bg-blue-100 text-blue-700 border-blue-200",
};

const roleIcons: Record<string, React.ReactNode> = {
    admin: <ShieldCheck className="h-3 w-3" />,
    teacher: <BookOpenCheck className="h-3 w-3" />,
    student: <GraduationCap className="h-3 w-3" />,
    parent: <UserCircle2 className="h-3 w-3" />,
};

export default function UserManagement() {
    const { lang } = useTheme();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [createdUser, setCreatedUser] = useState<any>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

    const { data: users, isLoading } = useUsers();
    const createUserMutation = useCreateUser();
    const deleteUserMutation = useDeleteUser();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.password) {
            toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }
        try {
            const newUser = await createUserMutation.mutateAsync(formData);
            setCreatedUser({ ...formData, id: newUser?.id });
            setIsAddOpen(false);
            setFormData({ ...EMPTY_FORM });
            toast({ title: "✅ User Created!", description: `${formData.firstName} ${formData.lastName} has been added.` });
        } catch (error: any) {
            let errorMsg = error?.message || "Failed to create user.";
            toast({ title: "Error", description: errorMsg, variant: "destructive" });
        }
    };

    const handleDelete = (id: string, name: string) => {
        setUserToDelete({ id, name });
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUserMutation.mutateAsync(userToDelete.id);
            toast({ title: "User Deleted", description: `${userToDelete.name} has been removed.` });
        } catch {
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        } finally {
            setUserToDelete(null);
        }
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredUsers = (users || []).filter((u: any) => {
        const matchSearch = `${u.firstName || ''} ${u.lastName || ''} ${u.username || ''} ${u.studentId || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter;
        return matchSearch && matchRole;
    });

    const stats = {
        total: (users || []).length,
        students: (users || []).filter((u: any) => u.role === "student").length,
        teachers: (users || []).filter((u: any) => u.role === "teacher").length,
        admins: (users || []).filter((u: any) => u.role === "admin").length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        {lang === 'en' ? 'User Management' : 'صارفین کا انتظام'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {lang === 'en' ? 'Create and manage user accounts with login credentials' : 'صارف اکاؤنٹ اور لاگ ان معلومات بنائیں اور سنبھالیں'}
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200 rounded-xl px-6">
                            <UserPlus className="h-4 w-4" />
                            {lang === 'en' ? 'Add User' : 'صارف شامل کریں'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-violet-600" />
                                    {lang === 'en' ? 'Create New User' : 'نیا صارف بنائیں'}
                                </DialogTitle>
                                <DialogDescription>
                                    {lang === 'en' ? 'Fill in the details and set login credentials.' : 'تفصیلات پُر کریں اور لاگ ان معلومات سیٹ کریں۔'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {lang === 'en' ? 'First Name *' : 'پہلا نام *'}
                                        </Label>
                                        <Input
                                            placeholder="Ahmed"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {lang === 'en' ? 'Last Name *' : 'آخری نام *'}
                                        </Label>
                                        <Input
                                            placeholder="Ali"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>



                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                            <KeyRound className="h-3 w-3" /> {lang === 'en' ? 'Username (Login)' : 'یوزر نیم'}
                                        </Label>
                                        <Input
                                            placeholder="ahmed_ali"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                            <IdCard className="h-3 w-3" /> {lang === 'en' ? 'Employee / Student ID' : 'ملازم / طالب علم کا ID'}
                                        </Label>
                                        <Input
                                            placeholder={formData.role === 'teacher' ? "TCH001" : "STU001"}
                                            value={formData.studentId}
                                            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {lang === 'en' ? 'Password *' : 'پاس ورڈ *'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Set login password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="rounded-xl pr-10"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {lang === 'en' ? 'Role' : 'کردار'}
                                    </Label>
                                    <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">🎓 Student</SelectItem>
                                            <SelectItem value="teacher">📖 Teacher</SelectItem>
                                            <SelectItem value="parent">👤 Parent</SelectItem>
                                            <SelectItem value="admin">🛡️ Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                                    {lang === 'en' ? 'Cancel' : 'منسوخ'}
                                </Button>
                                <Button type="submit" disabled={createUserMutation.isPending} className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
                                    {createUserMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : "Create User"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: stats.total, color: "from-violet-500 to-purple-600", icon: <Users className="h-5 w-5 text-white" /> },
                    { label: "Students", value: stats.students, color: "from-emerald-500 to-teal-600", icon: <GraduationCap className="h-5 w-5 text-white" /> },
                    { label: "Teachers", value: stats.teachers, color: "from-blue-500 to-indigo-600", icon: <BookOpenCheck className="h-5 w-5 text-white" /> },
                    { label: "Admins", value: stats.admins, color: "from-rose-500 to-pink-600", icon: <ShieldCheck className="h-5 w-5 text-white" /> },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Card className="border-none shadow-md overflow-hidden rounded-2xl">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>{s.icon}</div>
                                <div>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Success credentials card */}
            <AnimatePresence>
                {createdUser && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <AlertDescription>
                                <div className="flex flex-col gap-3">
                                    <p className="font-semibold text-emerald-800">
                                        {lang === 'en' ? 'Account allocated successfully!' : 'اکاؤنٹ کامیابی کے ساتھ مختص کر دیا گیا ہے!'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mt-1">
                                        <div className="p-2 bg-white/50 rounded-lg border border-emerald-100">
                                            <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1 opacity-70">
                                                {lang === 'en' ? 'Login ID' : 'لاگ ان ID'}
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-sm font-bold text-emerald-900 truncate">
                                                    {createdUser.username || createdUser.studentId}
                                                </span>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-emerald-200" onClick={() => handleCopy(createdUser.username || createdUser.studentId, 'uid')}>
                                                    {copied === 'uid' ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-emerald-600" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white/50 rounded-lg border border-emerald-100">
                                            <p className="text-[10px] uppercase text-emerald-600 font-bold mb-1 opacity-70">
                                                {lang === 'en' ? 'Password' : 'پاس ورڈ'}
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-sm font-bold text-emerald-900 truncate">
                                                    {createdUser.password}
                                                </span>
                                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-emerald-200" onClick={() => handleCopy(createdUser.password, 'pwd')}>
                                                    {copied === 'pwd' ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-emerald-600" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-emerald-700 mt-1 opacity-80">
                                        {lang === 'en' ? 'Share these credentials with the user for login.' : 'لاگ ان کے لیے یہ معلومات صارف کے ساتھ شیئر کریں۔'}
                                    </p>
                                    <Button size="sm" variant="ghost" onClick={() => setCreatedUser(null)} className="self-end text-xs text-muted-foreground">
                                        Dismiss
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={lang === 'en' ? 'Search by name, username or ID...' : 'نام، یوزر نیم یا ID سے تلاش کریں...'}
                        className="pl-10 rounded-xl"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-44 rounded-xl">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">🎓 Students</SelectItem>
                        <SelectItem value="teacher">📖 Teachers</SelectItem>
                        <SelectItem value="parent">👤 Parents</SelectItem>
                        <SelectItem value="admin">🛡️ Admins</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">{lang === 'en' ? 'No users found' : 'کوئی صارف نہیں ملا'}</p>
                            <p className="text-sm">{lang === 'en' ? 'Try adjusting your search filter or add a new user.' : 'تلاش تبدیل کریں یا نیا صارف شامل کریں۔'}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-semibold">{lang === 'en' ? 'Name' : 'نام'}</TableHead>

                                    <TableHead className="font-semibold">{lang === 'en' ? 'Username' : 'یوزر نیم'}</TableHead>
                                    <TableHead className="font-semibold">{lang === 'en' ? 'Password' : 'پاس ورڈ'}</TableHead>
                                    <TableHead className="font-semibold">{lang === 'en' ? 'ID' : 'آئی ڈی'}</TableHead>
                                    <TableHead className="font-semibold">{lang === 'en' ? 'Role' : 'کردار'}</TableHead>
                                    <TableHead className="text-right font-semibold">{lang === 'en' ? 'Actions' : 'عمل'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user: any, idx: number) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${user.role === 'admin' ? 'from-rose-400 to-pink-500' :
                                                    user.role === 'teacher' ? 'from-violet-400 to-purple-500' :
                                                        user.role === 'student' ? 'from-emerald-400 to-teal-500' : 'from-blue-400 to-indigo-500'
                                                    } flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                    {(user.firstName?.[0] || '?').toUpperCase()}
                                                </div>
                                                <span className="font-semibold">{user.firstName} {user.lastName}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {user.username ? (
                                                <span className="flex items-center gap-1 text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg w-fit">
                                                    <KeyRound className="h-3 w-3" /> {user.username}
                                                </span>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-mono font-bold bg-slate-50 px-2 py-1 rounded border">
                                                    {user.password || '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.studentId ? (
                                                <span className="flex items-center gap-1 text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit border border-blue-100 italic">
                                                    <IdCard className="h-3 w-3" /> {user.studentId}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground opacity-50 italic">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColors[user.role?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                                                {roleIcons[user.role?.toLowerCase()]}
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                                disabled={deleteUserMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {/* Delete Confirmation */}
            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {lang === 'en' ? 'Delete User?' : 'صارف کو حذف کریں؟'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground">
                            {lang === 'en'
                                ? `Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`
                                : `کیا آپ واقعی ${userToDelete?.name} کو حذف کرنا چاہتے ہیں؟ اس عمل کو واپس نہیں لیا جا سکے گا۔`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">{lang === 'en' ? "Cancel" : "منسوخ کریں"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6 font-bold"
                        >
                            {lang === 'en' ? "Delete" : "حذف کریں"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
