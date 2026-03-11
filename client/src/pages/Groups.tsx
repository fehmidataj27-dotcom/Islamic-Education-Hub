import { useState, useMemo } from "react";
import { useGroups } from "@/hooks/use-groups";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
    Plus, Search, Users, BookOpen, Calendar, MoreVertical,
    Trash2, Edit2, LayoutGrid, List, FileText, TrendingUp,
    ChevronRight, GraduationCap, Star, Zap, Loader2, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GROUP_COLORS = [
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-orange-500 to-amber-600",
    "from-sky-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-lime-500 to-green-600",
];
const GROUP_ICONS = ["📖", "🕌", "✨", "🌙", "📿", "🤲"];

export default function Groups() {
    const { user } = useAuthContext();
    const { lang } = useTheme();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("active");
    const [view, setView] = useState<"grid" | "list">("grid");

    // Existing States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", category: "General", capacity: "" });
    const CATEGORIES = ["Hadees", "Tajweed", "Namaz", "Tafseer", "General"];

    // New Bulk/Import States
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [bulkData, setBulkData] = useState("");
    const [importData, setImportData] = useState("");
    const [targetGroupId, setTargetGroupId] = useState("");

    const { getGroups, getUserGroups, createGroup, deleteGroup, bulkCreateGroups, importStudents } = useGroups();
    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isTeacher = user?.role?.toLowerCase() === "teacher";

    const allGroupsQuery = getGroups({ search, status });
    const userGroupsQuery = getUserGroups();

    const isLoading = isAdmin ? allGroupsQuery.isLoading : userGroupsQuery.isLoading;
    const groups = isAdmin ? allGroupsQuery.data?.groups : userGroupsQuery.data;
    const total = isAdmin ? (allGroupsQuery.data?.total ?? 0) : (userGroupsQuery.data?.length ?? 0);

    const handleCreate = () => {
        if (!newGroup.name.trim()) return toast({ title: "Name required", variant: "destructive" });
        createGroup.mutate(
            {
                name: newGroup.name,
                description: newGroup.description,
                category: newGroup.category,
                capacity: newGroup.capacity ? parseInt(newGroup.capacity) : null,
                status: "active"
            },
            {
                onSuccess: () => {
                    toast({ title: "✅ Group created successfully!" });
                    setIsCreateOpen(false);
                    setNewGroup({ name: "", description: "", category: "General", capacity: "" });
                },
                onError: () => toast({ title: "Failed to create group", variant: "destructive" })
            }
        );
    };

    const handleDelete = () => {
        if (!selectedGroup) return;
        deleteGroup.mutate(selectedGroup.id, {
            onSuccess: () => {
                toast({ title: "🗑️ Group deleted" });
                setIsDeleteOpen(false);
                setSelectedGroup(null);
            }
        });
    };

    const getGroupColor = (id: string) => GROUP_COLORS[(id?.charCodeAt(0) || 0) % GROUP_COLORS.length];
    const getGroupIcon = (id: string) => GROUP_ICONS[(id?.charCodeAt(0) || 0) % GROUP_ICONS.length];

    return (
        <div className="min-h-screen">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 shadow-2xl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                <div className="relative z-10 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🕌</span>
                                <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold tracking-wider">
                                    {lang === 'en' ? 'GROUP MANAGEMENT' : 'گروپ مینجمنٹ'}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                                {lang === 'en' ? 'Educate. Inspire. Grow.' : 'تعلیم۔ ترغیب۔ ترقی۔'}
                            </h1>
                            <p className="text-emerald-50/80 max-w-xl text-sm md:text-base font-medium">
                                {lang === 'en' ? 'Manage your students and teachers in a beautiful, organized way.' : 'اپنے طلباء اور اساتذہ کا خوبصورت اور منظم طریقے سے انتظام کریں۔'}
                            </p>
                        </div>
                        {isAdmin && (
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl px-6 font-black shadow-lg transition-all hover:scale-105"
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-5 w-5" /> {lang === 'en' ? 'New Group' : 'نیا گروپ'}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl px-4">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 px-2 py-2 rounded-2xl shadow-xl border-border/50">
                                        <DropdownMenuItem
                                            className="rounded-xl gap-2 cursor-pointer font-bold py-2.5"
                                            onClick={() => setIsBulkOpen(true)}
                                        >
                                            <TrendingUp className="h-4 w-4 text-blue-500" />
                                            Bulk Create Groups
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl gap-2 cursor-pointer font-bold py-2.5"
                                            onClick={() => setIsImportOpen(true)}
                                        >
                                            <FileText className="h-4 w-4 text-emerald-500" />
                                            Import Students (CSV)
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer font-bold py-2.5 text-orange-600">
                                            <Star className="h-4 w-4" /> Archive All
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Filters Bar ── */}
            <div className="bg-card rounded-2xl p-4 mb-6 shadow-sm border border-border/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={lang === 'en' ? 'Search groups...' : 'گروپ تلاش کریں...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 rounded-xl bg-muted/30 border-none outline-none focus-visible:ring-emerald-500"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px] rounded-xl bg-muted/30 border-none">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-none w-full md:w-auto justify-between">
                    <p className="text-sm font-bold text-muted-foreground">
                        <span className="text-emerald-600 ml-1">{total}</span> {lang === 'en' ? 'Groups' : 'گروپس'}
                    </p>
                    <div className="flex bg-muted/40 p-1 rounded-xl">
                        <Button
                            variant={view === "grid" ? "default" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === "list" ? "default" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setView("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Groups Grid ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
            ) : Array.isArray(groups) && groups.length > 0 ? (
                <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {groups.map((group: any) => {
                        const grad = getGroupColor(group.id);
                        const icon = getGroupIcon(group.id);
                        return (
                            <Card
                                key={group.id}
                                className={`group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl ${view === "list" ? "flex items-center p-2" : ""}`}
                                onClick={() => setLocation(`/groups/${group.id}`)}
                            >
                                <div className={`${view === "list" ? "w-16 h-16" : "h-2 w-full"} bg-gradient-to-r ${grad} shrink-0 rounded-xl`} />
                                <CardContent className={`p-5 ${view === "list" ? "flex-1 flex items-center justify-between py-2" : ""}`}>
                                    <div className={view === "grid" ? "flex items-start justify-between mb-4" : "flex items-center gap-4"}>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl shadow-inner border border-white/20`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-xl truncate group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{group.name}</h3>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black h-5">
                                                    {group.status?.toUpperCase()}
                                                </Badge>
                                                {group.category && (
                                                    <Badge variant="outline" className={`text-[10px] font-black h-5 uppercase
                                                        ${group.category === 'Staff' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            group.category === 'General' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                                    `}>
                                                        {group.category === 'Staff' ? '🔒 Staff Only' : group.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem className="gap-2 font-bold"><Edit2 className="h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 font-bold"><Calendar className="h-4 w-4" /> Schedule</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive focus:text-destructive font-bold"
                                                        onClick={e => { e.stopPropagation(); setSelectedGroup(group); setIsDeleteOpen(true); }}
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    <div className={view === "grid" ? "space-y-4" : "flex items-center gap-10"}>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Students</span>
                                                <span className="font-black text-lg text-emerald-950 flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-emerald-600" /> {group.studentCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Growth</span>
                                                <span className="font-black text-lg text-emerald-950 flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3 text-teal-600" /> +{Math.floor(Math.random() * 5)}
                                                </span>
                                            </div>
                                        </div>

                                        {view === "grid" && (
                                            <div className="space-y-1.5 pt-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                                                    <span>Capacity</span>
                                                    <span>{Math.round(((group.studentCount || 0) / (group.capacity || 50)) * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${grad} opacity-80`}
                                                        style={{ width: `${Math.min(100, ((group.studentCount || 0) / (group.capacity || 50)) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-border/50 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">{lang === 'en' ? 'No groups yet' : 'پاس کوئی گروپ نہیں ہے'}</h3>
                    <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                        {lang === 'en' ? 'Create your first group to start organizing your Madrasa students and teachers.' : 'اپنے مدرسہ کے طلباء اور اساتذہ کو منظم کرنے کے لیے اپنا پہلا گروپ بنائیں۔'}
                    </p>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 h-auto text-lg font-black shadow-xl"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="mr-2 h-6 w-6" /> {lang === 'en' ? 'Create Group' : 'گروپ بنائیں'}
                    </Button>
                </div>
            )}

            {/* ── Create Dialog ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            {lang === 'en' ? 'Create New Group' : 'نیا گروپ بنائیں'}
                        </DialogTitle>
                        <DialogDescription>
                            Organize your students by creating a new learning group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Group Name</Label>
                            <Input
                                placeholder="e.g. Hifz Class A"
                                value={newGroup.name}
                                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                className="rounded-xl border-none bg-muted/30 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                            <Select
                                value={newGroup.category}
                                onValueChange={(val) => setNewGroup({ ...newGroup, category: val })}
                            >
                                <SelectTrigger className="rounded-xl border-none bg-muted/30">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                            <Input
                                placeholder="Optional description..."
                                value={newGroup.description}
                                onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                className="rounded-xl border-none bg-muted/30 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Capacity</Label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={newGroup.capacity}
                                onChange={e => setNewGroup({ ...newGroup, capacity: e.target.value })}
                                className="rounded-xl border-none bg-muted/30 focus-visible:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createGroup.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8"
                        >
                            {createGroup.isPending ? "Creating..." : "Create Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" /> Delete Group
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedGroup?.name}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl" disabled={deleteGroup.isPending}>
                            {deleteGroup.isPending ? "Deleting..." : "Delete Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Bulk Create Dialog ── */}
            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-none">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Bulk Create Groups</DialogTitle>
                        <DialogDescription className="font-medium">
                            Paste a list of names to create multiple groups at once.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-muted-foreground">Group Names (one per line)</Label>
                        <textarea
                            className="w-full min-h-[150px] p-4 rounded-2xl bg-muted/50 border-none outline-none text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all"
                            placeholder="Example:&#10;Hifz-A&#10;Hifz-B&#10;Tajweed-C"
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="sm:justify-between gap-3">
                        <Button variant="ghost" onClick={() => setIsBulkOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black shadow-lg shadow-blue-500/20"
                            disabled={!bulkData.trim() || bulkCreateGroups.isPending}
                            onClick={() => {
                                const names = bulkData.split('\n').filter(n => n.trim());
                                bulkCreateGroups.mutate(names.map(name => ({ name, status: 'active' })), {
                                    onSuccess: () => {
                                        toast({ title: `✅ Created ${names.length} groups!` });
                                        setIsBulkOpen(false);
                                        setBulkData("");
                                    }
                                });
                            }}
                        >
                            {bulkCreateGroups.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : `Create ${bulkData.split('\n').filter(n => n.trim()).length || ''} Groups`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Import Students Dialog ── */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-none">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-2">
                            <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Import Students</DialogTitle>
                        <DialogDescription className="font-medium">
                            Bulk add students to a group via CSV format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Target Group</Label>
                            <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                                <SelectTrigger className="rounded-xl h-11 border-none bg-muted/50 font-bold">
                                    <SelectValue placeholder="Select a group..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    {(groups || []).map((g: any) => (
                                        <SelectItem key={g.id} value={g.id} className="font-bold py-2.5">{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">CSV Data</Label>
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Format: firstName, lastName, email</span>
                            </div>
                            <textarea
                                className="w-full min-h-[150px] p-4 rounded-2xl bg-muted/50 border-none outline-none text-xs font-bold font-mono focus:ring-2 ring-emerald-500/20 transition-all"
                                placeholder="firstName,lastName,email&#10;Ahmed,Ali,ahmed@example.com&#10;Sara,Khan,sara@example.com"
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 font-black shadow-lg shadow-emerald-500/20"
                            disabled={!targetGroupId || !importData.trim() || importStudents.isPending}
                            onClick={() => {
                                // Simple CSV parser
                                const lines = importData.split('\n').filter(l => l.trim());
                                const headers = lines[0].split(',').map(h => h.trim());
                                const studentsImport = lines.slice(1).map(line => {
                                    const values = line.split(',').map(v => v.trim());
                                    const student: any = {};
                                    headers.forEach((h, i) => student[h] = values[i]);
                                    return student;
                                });

                                importStudents.mutate({ groupId: targetGroupId, students: studentsImport }, {
                                    onSuccess: () => {
                                        toast({ title: `✅ Successfully imported ${studentsImport.length} students!` });
                                        setIsImportOpen(false);
                                        setImportData("");
                                        setTargetGroupId("");
                                    }
                                });
                            }}
                        >
                            {importStudents.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
