import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    FileText,
    Upload,
    Trash2,
    FileUp,
    Eye,
    BookOpen,
    Search,
    Pencil,
    AlertTriangle
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api, buildUrl } from "@shared/routes";
import { CourseTest } from "@shared/schema";

export default function CourseNotesSection({ courseId }: { courseId: string }) {
    const { user } = useAuth();
    const { lang } = useTheme();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Queries
    const { data: allItems = [], isLoading } = useQuery<CourseTest[]>({
        queryKey: [buildUrl(api.courseTests.list.path, { courseId })],
    });

    // Filter only for 'notes' type
    const notes = allItems.filter(item => item.type === 'notes');

    // Mutations
    const createNoteMutation = useMutation({
        mutationFn: async (newNote: any) => {
            const res = await apiRequest("POST", buildUrl(api.courseTests.create.path, { courseId }), newNote);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [buildUrl(api.courseTests.list.path, { courseId })] });
            toast({ title: lang === 'en' ? "✅ Notes uploaded successfully!" : "✅ نوٹس کامیابی سے اپلوڈ ہو گئے!" });
        },
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", buildUrl(api.courseTests.delete.path, { id }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [buildUrl(api.courseTests.list.path, { courseId })] });
            toast({ title: lang === 'en' ? "🗑️ Notes deleted" : "🗑️ نوٹس حذف کر دیے گئے" });
        },
    });

    const editNoteMutation = useMutation({
        mutationFn: async ({ id, title }: { id: number, title: string }) => {
            await apiRequest("PATCH", buildUrl(api.courseTests.update.path, { id }), { title });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [buildUrl(api.courseTests.list.path, { courseId })] });
            toast({ title: lang === 'en' ? "✏️ Notes updated" : "✏️ نوٹس اپ ڈیٹ ہو گئے" });
            setEditNote(null);
        },
    });

    // Upload dialog state
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteFile, setNoteFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Edit state
    const [editNote, setEditNote] = useState<CourseTest | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const isTeacher = user?.role === "teacher" || user?.role === "admin";

    const handleSaveNote = async () => {
        if (!noteTitle.trim() || !noteFile) {
            toast({ variant: "destructive", title: lang === 'en' ? "Please enter title and select file" : "براہ کرم عنوان درج کریں اور فائل منتخب کریں" });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", noteFile);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json().catch(() => ({ message: "Upload failed" }));
                throw new Error(errData.message || (lang === 'en' ? "Upload failed" : "اپ لوڈ ناکام ہو گیا"));
            }

            const { url } = await uploadRes.json();

            await createNoteMutation.mutateAsync({
                type: "notes",
                title: noteTitle,
                pdfName: noteFile.name,
                pdfData: url,
            });

            setUploadDialogOpen(false);
            setNoteTitle("");
            setNoteFile(null);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: lang === 'en' ? "Error" : "غلطی",
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateNote = () => {
        if (!editNote || !editTitle.trim()) return;
        editNoteMutation.mutate({ id: editNote.id, title: editTitle });
    };

    const deleteNote = (id: number) => {
        setItemToDelete(id);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteNoteMutation.mutate(itemToDelete, {
                onSuccess: () => setItemToDelete(null),
                onError: () => setItemToDelete(null)
            });
        }
    };

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Edit Dialog */}
            <Dialog open={!!editNote} onOpenChange={(open) => !open && setEditNote(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{lang === 'en' ? 'Edit Notes Title' : 'نوٹس کے عنوان میں ترمیم کریں'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{lang === 'en' ? 'Notes Title' : 'نوٹس کا عنوان'}</Label>
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditNote(null)}>{lang === 'en' ? 'Cancel' : 'منسوخ'}</Button>
                        <Button onClick={handleUpdateNote} disabled={editNoteMutation.isPending}>
                            {editNoteMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : null}
                            {lang === 'en' ? 'Save Changes' : 'تبدیلیاں محفوظ کریں'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        {lang === 'en' ? 'Course Notes' : 'کورس نوٹس'}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {lang === 'en' ? 'Study materials and lecture notes' : 'مطالعاتی مواد اور لیکچر نوٹس'}
                    </p>
                </div>

                {isTeacher && (
                    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 rounded-xl shadow bg-primary hover:bg-primary/90">
                                <FileUp className="h-4 w-4" /> {lang === 'en' ? 'Upload Notes' : 'نوٹس اپلوڈ کریں'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" />
                                    {lang === 'en' ? 'Upload Study Material' : 'مطالعاتی مواد اپلوڈ کریں'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                    <Label>{lang === 'en' ? 'Notes Title *' : 'نوٹس کا عنوان *'}</Label>
                                    <Input
                                        placeholder={lang === 'en' ? "e.g. Chapter 1 Summary" : "مثلاً باب 1 کا خلاصہ"}
                                        value={noteTitle}
                                        onChange={e => setNoteTitle(e.target.value)}
                                    />
                                </div>
                                <div
                                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="hidden"
                                        onChange={e => setNoteFile(e.target.files?.[0] || null)}
                                    />
                                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    {noteFile ? (
                                        <div>
                                            <p className="font-semibold text-primary">{noteFile.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{(noteFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium">{lang === 'en' ? 'Click to upload PDF / DOC' : 'پی ڈی ایف / ڈاک اپلوڈ کرنے کے لیے کلک کریں'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{lang === 'en' ? 'Supports PDF, Word, and Text files' : 'پی ڈی ایف، ورڈ اور ٹیکسٹ فائلیں'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>{lang === 'en' ? 'Cancel' : 'منسوخ'}</Button>
                                <Button onClick={handleSaveNote} disabled={!noteFile || createNoteMutation.isPending || isUploading} className="gap-2">
                                    {(createNoteMutation.isPending || isUploading) ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    {isUploading ? (lang === 'en' ? 'Uploading...' : 'اپلوڈ ہو رہا ہے...') : (lang === 'en' ? 'Upload' : 'اپلوڈ')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={lang === 'en' ? "Search notes..." : "نوٹس تلاش کریں..."}
                    className="pl-10 rounded-xl"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Notes List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredNotes.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border"
                >
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{lang === 'en' ? 'No Notes Available' : 'کوئی نوٹس دستیاب نہیں ہیں'}</h3>
                        <p className="text-muted-foreground max-w-sm mt-1">
                            {lang === 'en' ? 'Study materials uploaded by teachers will appear here.' : 'اساتذہ کی طرف سے اپلوڈ کردہ مواد یہاں نظر آئے گا۔'}
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filteredNotes.map((note, idx) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden">
                                    <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                    {note.pdfName?.split('.').pop() || 'PDF'}
                                                </p>
                                            </div>
                                        </div>
                                        {isTeacher && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary"
                                                    onClick={() => {
                                                        setEditNote(note);
                                                        setEditTitle(note.title);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => deleteNote(note.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1 italic">By {note.uploadedBy}</span>
                                            <span>{note.uploadedAt ? new Date(note.uploadedAt).toLocaleDateString() : ''}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                            onClick={() => {
                                                if (note.pdfData) {
                                                    const a = document.createElement("a");
                                                    a.href = note.pdfData;
                                                    a.download = note.pdfName || "notes.pdf";
                                                    a.click();
                                                }
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                            {lang === 'en' ? 'Download / View' : 'ڈاؤنلوڈ / دیکھیں'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
            {/* Delete Confirmation */}
            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {lang === 'en' ? 'Delete Notes?' : 'نوٹس حذف کریں؟'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground">
                            {lang === 'en' ? "Delete these notes? This action cannot be undone." : "کیا آپ یہ نوٹس حذف کرنا چاہتے ہیں؟ اس عمل کو واپس نہیں لیا جا سکے گا۔"}
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
