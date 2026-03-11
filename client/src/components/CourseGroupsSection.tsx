import { useState } from "react";
import { useGroups } from "@/hooks/use-groups";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
    Users, ChevronRight, Plus, MoreVertical, Trash2,
    Edit2, Calendar, FileText, TrendingUp, Loader2,
    Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourseGroupsSectionProps {
    category: string;
}

export default function CourseGroupsSection({ category }: CourseGroupsSectionProps) {
    const { user } = useAuthContext();
    const { lang } = useTheme();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { getGroups, getUserGroups, createGroup, deleteGroup, bulkCreateGroups, importStudents } = useGroups();

    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isTeacher = user?.role?.toLowerCase() === "teacher";
    const canManage = isAdmin || isTeacher;

    // Local States for Management
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", capacity: "" });
    const [bulkData, setBulkData] = useState("");
    const [importData, setImportData] = useState("");
    const [targetGroupId, setTargetGroupId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Data Fetching
    const allGroupsQuery = getGroups({ category, search: searchTerm, status: "active" });
    const userGroupsQuery = getUserGroups();

    const isLoading = canManage ? allGroupsQuery.isLoading : userGroupsQuery.isLoading;
    const allGroups = allGroupsQuery.data?.groups || [];
    const userGroups = userGroupsQuery.data || [];

    // Defensively filter by category on the frontend as well
    const displayGroups = (canManage ? allGroups : userGroups).filter(
        (g: any) => g.category?.toLowerCase() === category.toLowerCase()
    );

    const handleCreate = async () => {
        if (!newGroup.name.trim()) return toast({ title: "Name required", variant: "destructive" });
        try {
            await createGroup.mutateAsync({
                name: newGroup.name.trim(),
                category: category,
                capacity: newGroup.capacity ? parseInt(newGroup.capacity) : null,
                status: "active"
            } as any);
            toast({ title: `✅ ${newGroup.name} group created!`, description: `New ${category} group is ready.` });
            setIsCreateOpen(false);
            setNewGroup({ name: "", description: "", capacity: "" });
        } catch (err: any) {
            toast({ title: "❌ Failed to create group", description: err.message || "Server error", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!selectedGroup) return;
        try {
            await deleteGroup.mutateAsync(selectedGroup.id);
            toast({ title: "🗑️ Group removed" });
            setIsDeleteOpen(false);
            setSelectedGroup(null);
        } catch (err: any) {
            toast({ title: "❌ Failed to delete", description: err.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
            </div>
        );
    }

    const GROUP_COLORS: Record<string, string> = {
        Tajweed: "from-indigo-500 to-purple-600",
        Tafseer: "from-rose-500 to-pink-600",
        Hadees: "from-amber-500 to-orange-600",
        Namaz: "from-emerald-500 to-teal-600",
        General: "from-sky-500 to-blue-600",
    };

    const grad = GROUP_COLORS[category] || "from-emerald-500 to-teal-600";

    return (
        <div className="space-y-6">
            {/* ── Management Header ── */}
            {canManage && (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/50">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={lang === 'en' ? `Search ${category} groups...` : `${category} گروپس تلاش کریں...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-xl bg-background/50 border-none ring-1 ring-border"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            className={`flex-1 md:flex-none rounded-xl font-bold bg-gradient-to-r ${grad} text-white shadow-lg`}
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Add Group' : 'نیا گروپ'}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-xl border-border px-3">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2">
                                <DropdownMenuItem className="rounded-xl gap-2 font-bold py-2.5 cursor-pointer" onClick={() => setIsBulkOpen(true)}>
                                    <TrendingUp className="h-4 w-4 text-blue-500" /> Bulk Create
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl gap-2 font-bold py-2.5 cursor-pointer" onClick={() => setIsImportOpen(true)}>
                                    <FileText className="h-4 w-4 text-emerald-500" /> Import CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            {/* ── Groups Grid ── */}
            {displayGroups.length === 0 ? (
                <Card className="p-16 text-center border-dashed bg-muted/10 rounded-3xl">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Users className="h-16 w-16 opacity-10" />
                        <p className="font-bold text-lg">
                            {lang === 'en'
                                ? `No active ${category} groups.`
                                : `کوئی فعال ${category} گروپ موجود نہیں ہے۔`}
                        </p>
                        {canManage && (
                            <Button variant="outline" className="rounded-xl mt-2" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Create First Group' : 'پہلا گروپ بنائیں'}
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayGroups.map((group: any) => (
                        <Card
                            key={group.id}
                            className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl bg-card/60 backdrop-blur-md"
                            onClick={() => setLocation(`/groups/${group.id}`)}
                        >
                            <div className={`h-2 w-full bg-gradient-to-r ${grad} opacity-80`} />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl shadow-inner border border-white/20 text-white`}>
                                        {category === 'Tajweed' ? '📖' : category === 'Tafseer' ? '✨' : category === 'Hadees' ? '📜' : '🕌'}
                                    </div>
                                    {canManage ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl p-2">
                                                <DropdownMenuItem className="gap-2 font-bold rounded-lg"><Edit2 className="h-4 w-4 text-blue-500" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 font-bold rounded-lg"><Calendar className="h-4 w-4 text-emerald-500" /> Schedule</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive focus:text-destructive font-bold rounded-lg"
                                                    onClick={e => { e.stopPropagation(); setSelectedGroup(group); setIsDeleteOpen(true); }}
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>

                                <h3 className="font-black text-xl truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {group.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 mb-2">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                                        {group.category}
                                    </Badge>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Students</span>
                                        <span className="font-black text-lg text-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3 text-primary" /> {group.studentCount || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Status</span>
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black h-5 px-2 mt-1">
                                            {group.status?.toUpperCase() || 'ACTIVE'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                                        <span>Capacity</span>
                                        <span>{group.capacity || 50} Max</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${grad} opacity-80`}
                                            style={{ width: `${Math.min(100, ((group.studentCount || 0) / (group.capacity || 50)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Dialogs ── */}
            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${grad} text-white`}>
                                <Plus className="h-4 w-4" />
                            </div>
                            {lang === 'en' ? `New ${category} Group` : `نیا ${category} گروپ`}
                        </DialogTitle>
                        <DialogDescription>
                            Setup a new learning group for this section.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Group Name</Label>
                            <Input
                                placeholder="e.g. Morning Batch A"
                                value={newGroup.name}
                                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Capacity</Label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={newGroup.capacity}
                                onChange={e => setNewGroup({ ...newGroup, capacity: e.target.value })}
                                className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                            <Input
                                placeholder="Optional details..."
                                value={newGroup.description}
                                onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createGroup.isPending}
                            className={`bg-gradient-to-r ${grad} text-white rounded-xl px-8 font-bold shadow-lg`}
                        >
                            {createGroup.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" /> Delete Group
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedGroup?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} className="rounded-xl px-6 font-bold" disabled={deleteGroup.isPending}>
                            {deleteGroup.isPending ? "Removing..." : "Delete Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Create Dialog */}
            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-none">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Bulk Create {category} Groups</DialogTitle>
                        <DialogDescription className="font-medium">
                            Paste a list of names to create multiple groups in this category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block text-muted-foreground">Group Names (one per line)</Label>
                        <textarea
                            className="w-full min-h-[150px] p-4 rounded-2xl bg-muted/50 border-none outline-none text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all font-mono"
                            placeholder="e.g.&#10;Batch A&#10;Batch B"
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="sm:justify-between gap-3">
                        <Button variant="ghost" onClick={() => setIsBulkOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-black shadow-lg"
                            disabled={!bulkData.trim() || bulkCreateGroups.isPending}
                            onClick={() => {
                                const names = bulkData.split('\n').filter(n => n.trim());
                                bulkCreateGroups.mutate(names.map(name => ({ name, category, status: 'active' })), {
                                    onSuccess: () => {
                                        toast({ title: `✅ Created ${names.length} ${category} groups!` });
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

            {/* Import Students Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-lg rounded-2xl shadow-2xl border-none">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-2">
                            <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black">Import Students</DialogTitle>
                        <DialogDescription className="font-medium">
                            Bulk add students to a {category} group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Target Group</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between rounded-xl h-11 bg-muted/50 font-bold border-none">
                                        {targetGroupId ? displayGroups.find((g: any) => g.id === targetGroupId)?.name : "Select a group..."}
                                        <ChevronRight className="h-4 w-4 rotate-90" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full min-w-[300px] rounded-xl">
                                    {displayGroups.map((g: any) => (
                                        <DropdownMenuItem key={g.id} className="font-bold py-2.5 cursor-pointer" onClick={() => setTargetGroupId(g.id)}>
                                            {g.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">CSV Data</Label>
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase">firstName, lastName, email</span>
                            </div>
                            <textarea
                                className="w-full min-h-[150px] p-4 rounded-2xl bg-muted/50 border-none outline-none text-xs font-bold font-mono focus:ring-2 ring-emerald-500/20 transition-all"
                                placeholder="Ahmed,Ali,ahmed@example.com"
                                value={importData}
                                onChange={(e) => setImportData(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 font-black shadow-lg"
                            disabled={!targetGroupId || !importData.trim() || importStudents.isPending}
                            onClick={() => {
                                const lines = importData.split('\n').filter(l => l.trim());
                                const studentsImport = lines.map(line => {
                                    const [firstName, lastName, email] = line.split(',').map(v => v.trim());
                                    return { firstName, lastName, email };
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
