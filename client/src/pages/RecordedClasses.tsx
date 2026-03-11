import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, Clock, Plus, Video, Trash2, AlertTriangle } from "lucide-react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MediaPlayer from "@/components/MediaPlayer";
import { useVideos, useCreateVideo, useDeleteVideo } from "@/hooks/use-resources";
import { useAuth } from "@/hooks/use-auth";
import MediaUpload from "@/components/MediaUpload";
import { motion, AnimatePresence } from "framer-motion";
import LectureCover from "@/components/LectureCover";

export default function RecordedClasses() {
    const { lang } = useTheme();
    const { toast } = useToast();
    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "teacher";

    const { data: videos = [], isLoading: isLoadingVideos } = useVideos();
    const createVideoMutation = useCreateVideo();
    const deleteVideoMutation = useDeleteVideo();

    const [filter, setFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("Tajweed");
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
    const [playingVideo, setPlayingVideo] = useState<any | null>(null);

    const t = {
        title: lang === 'en' ? 'Recorded Classes' : 'ریکارڈ شدہ کلاسیں',
        watch: lang === 'en' ? 'Watch Now' : 'اب دیکھیں',
        recent: lang === 'en' ? 'Recently Watched' : 'حال ہی میں دیکھے گئے',
        allSubjects: lang === 'en' ? 'All Subjects' : 'تمام مضامین',
        filterBy: lang === 'en' ? 'Filter by Subject' : 'مضمون کے لحاظ سے فلٹر کریں',
        addLecture: lang === 'en' ? 'Add Lecture' : 'لیکچر شامل کریں',
        addTitle: lang === 'en' ? 'Add New Recorded Lecture' : 'نیا ریکارڈ شدہ لیکچر شامل کریں',
        addDesc: lang === 'en' ? 'Fill out the details below to add a new lecture to the library.' : 'لائبریری میں نیا لیکچر شامل کرنے کے لیے نیچے دی گئی تفصیلات بھریں۔',
        titleEn: lang === 'en' ? 'Title (English)' : 'عنوان (انگریزی)',
        titleUr: lang === 'en' ? 'Title (Urdu)' : 'عنوان (اردو)',
        subject: lang === 'en' ? 'Subject' : 'مضمون',
        duration: lang === 'en' ? 'Duration (e.g., 45 min)' : 'دورانیہ (مثلاً 45 منٹ)',
        thumbnail: lang === 'en' ? 'Thumbnail URL' : 'تھمب نیل یو آر ایل',
        cancel: lang === 'en' ? 'Cancel' : 'منسوخ کریں',
        save: lang === 'en' ? 'Save Lecture' : 'لیکچر محفوظ کریں',
        delete: lang === 'en' ? 'Delete' : 'حذف کریں',
        confirmDelete: lang === 'en' ? 'Are you sure?' : 'کیا آپ کو یقین ہے؟',
        deleteDesc: lang === 'en' ? 'This action cannot be undone. This will permanently delete the lecture.' : 'یہ عمل واپس نہیں لیا جا سکتا۔ یہ مستقل طور پر لیکچر کو حذف کر دے گا۔',
    };

    const handleDeleteVideo = async () => {
        if (!videoToDelete) return;

        try {
            await deleteVideoMutation.mutateAsync(videoToDelete);
            toast({
                title: lang === 'en' ? "Lecture Deleted" : "لیکچر حذف کر دیا گیا",
                description: lang === 'en' ? "The lecture has been successfully removed." : "لیکچر کامیابی کے ساتھ ختم کر دیا گیا ہے۔",
            });
        } catch (error: any) {
            toast({
                title: lang === 'en' ? "Error" : "خرابی",
                description: error.message || "Failed to delete video",
                variant: "destructive"
            });
        } finally {
            setVideoToDelete(null);
        }
    };

    const filteredClasses = filter === "all"
        ? videos
        : videos.filter(c => c.category.toLowerCase() === filter.toLowerCase());

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                    <p className="text-muted-foreground">{t.recent}</p>
                </div>
                <div className="flex items-center gap-3">
                    <MediaUpload category={filter !== "all" ? (filter.charAt(0).toUpperCase() + filter.slice(1)) : "Tajweed"} />

                    <div className="w-[180px]">
                        <Select onValueChange={setFilter} defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder={t.filterBy} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.allSubjects}</SelectItem>
                                <SelectItem value="tajweed">🕌 Tajweed</SelectItem>
                                <SelectItem value="tafseer">📖 Tafseer</SelectItem>
                                <SelectItem value="hadith">🏺 Hadith</SelectItem>
                                <SelectItem value="fiqh">⚖️ Fiqh</SelectItem>
                                <SelectItem value="history">📜 History</SelectItem>
                                <SelectItem value="arabic">🖋️ Arabic</SelectItem>
                                <SelectItem value="namaz">🤲 Namaz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {isLoadingVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-[350px] animate-pulse bg-muted" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((video) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/40 hover:border-primary/30 flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-2xl">
                                <div className="relative aspect-video bg-muted shrink-0 overflow-hidden">
                                    <LectureCover
                                        title={(video.title as any)[lang]}
                                        category={video.category}
                                        imageUrl={video.thumbnail ?? undefined}
                                    />

                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                        <div className="transform scale-75 group-hover:scale-100 transition-transform duration-500 bg-primary rounded-full p-4 shadow-2xl">
                                            <PlayCircle className="h-10 w-10 text-white" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                                        <Badge variant="secondary" className="gap-1.5 bg-black/70 text-white hover:bg-black/80 border-none backdrop-blur-md px-2.5 py-1 text-[10px] font-bold">
                                            <Clock className="h-3 w-3" />
                                            {video.duration}
                                        </Badge>
                                    </div>

                                    {isAdmin && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-9 w-9 rounded-xl shadow-xl z-30"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVideoToDelete(video.id);
                                            }}
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </Button>
                                    )}
                                </div>

                                <CardHeader className="p-5 pb-2">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <div className={`h-1.5 w-8 rounded-full bg-primary/40`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {video.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 h-12">
                                        {(video.title as any)[lang]}
                                    </h3>
                                </CardHeader>

                                <CardContent className="p-5 py-3 flex-grow">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                            <span>Progress</span>
                                            <span className="text-primary">{video.progress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${video.progress || 0}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-5 pt-0">
                                    <Button
                                        className="w-full h-11 rounded-xl gap-2 font-bold shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary/90"
                                        onClick={() => setPlayingVideo(video)}
                                    >
                                        <PlayCircle className="h-4.5 w-4.5" />
                                        {t.watch}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {t.confirmDelete}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.deleteDesc}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteVideo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {playingVideo && (
                <MediaPlayer
                    url={playingVideo.url} // Fixed property name
                    title={(playingVideo.title as any)[lang]}
                    onClose={() => setPlayingVideo(null)}
                />
            )}
        </div>
    );
}
