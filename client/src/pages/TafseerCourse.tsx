import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import MediaPlayer from "@/components/MediaPlayer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Clock,
    PlayCircle,
    Info,
    Video,
    Trash2,
    Loader2,
    ClipboardList,
    AlertTriangle,
    Users, Megaphone, Mic
} from "lucide-react";
import { motion } from "framer-motion";
import { useVideos, useDeleteVideo, useCheckAchievements, useUserGroups, useCategoryAnnouncements } from "@/hooks/use-resources";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import MediaUpload from "@/components/MediaUpload";
import AnnouncementUpload from "@/components/AnnouncementUpload";
import CourseTestSection from "@/components/CourseTestSection";
import CourseNotesSection from "@/components/CourseNotesSection";
import LectureCover from "@/components/LectureCover";
import CourseHero from "@/components/CourseHero";
import CourseGuard from "@/components/CourseGuard";
import CourseGroupsSection from "@/components/CourseGroupsSection";
import tafseerHero from "@/assets/images/tafseer_hero.png";
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

export default function TafseerCourse() {
    const { lang } = useTheme();
    const [activeTab, setActiveTab] = useState("foundations");
    const [tafseerVideos, setTafseerVideos] = useState<any[]>([]);
    const [playingVideo, setPlayingVideo] = useState<any | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();
    const { data: videosData } = useVideos();
    const { data: userGroups } = useUserGroups();
    const deleteVideoMutation = useDeleteVideo();
    const { mutate: checkAchievements } = useCheckAchievements();

    const { data: announcements } = useCategoryAnnouncements("Tafseer");


    useEffect(() => {
        // Award Tafseer badge
        checkAchievements({ visitedTafseer: true });
    }, []);

    useEffect(() => {
        if (videosData) {
            setTafseerVideos(videosData.filter((v: any) => v.category === 'Tafseer'));
        }
    }, [videosData]);

    const t = {
        title: lang === 'en' ? 'Tafseer Course' : 'تفسیرِ قرآن کورس',
        subtitle: lang === 'en' ? 'Understanding the deep meanings and context of the Holy Quran' : 'قرآن مجید کے گہرے معانی اور پس منظر کو سمجھنا',
        foundations: lang === 'en' ? 'Foundations' : 'بنیادی باتیں',
        sessions: lang === 'en' ? 'Video Library' : 'ویڈیو لائبریری',
        watch: lang === 'en' ? 'Watch Now' : 'اب دیکھیں',
        confirmDelete: lang === 'en' ? "Are you sure?" : "کیا آپ کو یقین ہے؟",
        deleteDesc: lang === 'en' ? "This will permanently remove this lecture." : "یہ مستقل طور پر اس لیکچر کو ہٹا دے گا۔",
        cancel: lang === 'en' ? "Cancel" : "منسوخ کریں",
        delete: lang === 'en' ? "Delete" : "حذف کریں",
    };

    const handleDeleteVideo = async () => {
        if (!videoToDelete) return;
        try {
            await deleteVideoMutation.mutateAsync(videoToDelete);
            toast({
                title: lang === 'en' ? "Lecture Deleted" : "لیکچر حذف کر دیا گیا",
                description: lang === 'en' ? "The lecture has been removed successfully." : "لیکچر کو کامیابی کے ساتھ ہٹا دیا گیا ہے۔",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setVideoToDelete(null);
        }
    };

    return (
        <CourseGuard courseName="Tafseer">
            <div className="space-y-8 pb-20">
                <CourseHero
                    title={t.title}
                    subtitle={t.subtitle}
                    badgeText={lang === 'en' ? 'Deep Insights of Quran' : 'قرآنی بصیرت'}
                    color="amber"
                    illustration={tafseerHero}
                >
                    <div className="hidden md:block">
                        <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 backdrop-blur-sm animate-pulse">
                            <Info className="h-10 w-10 text-rose-600" />
                        </div>
                    </div>
                </CourseHero>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="lg:w-[70%] xl:w-[75%] space-y-6 order-2 lg:order-1">
                        <Tabs value={activeTab} defaultValue="foundations" className="w-full" onValueChange={setActiveTab}>
                            <div className="flex justify-start mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-border/50 flex w-max">
                                    <TabsTrigger value="foundations" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {t.foundations}
                                    </TabsTrigger>
                                    <TabsTrigger value="sessions" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <Video className="h-4 w-4 mr-2" /> {t.sessions}
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Notes' : 'کورس نوٹس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="tests" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <ClipboardList className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Take a Test' : 'ٹیسٹ لیں'}
                                    </TabsTrigger>
                                    <TabsTrigger value="groups" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <Users className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Groups' : 'گروپس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="rounded-xl px-6 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all duration-300">
                                        <Megaphone className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Latest Updates' : 'تازہ ترین اپ ڈیٹس'}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="foundations" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { title: lang === 'en' ? 'Intro to Tafseer' : 'تفسیر کا تعارف', desc: lang === 'en' ? 'Definition and importance of interpretation.' : 'تشریح کی تعریف اور اہمیت۔' },
                                        { title: lang === 'en' ? 'Principles' : 'اصولِ تفسیر', desc: lang === 'en' ? 'Rules scholars use to interpret Quran.' : 'قرآن کی تشریح کے لیے علماء کے اصول۔' },
                                        { title: lang === 'en' ? 'Historical Growth' : 'تاریخی ارتقاء', desc: lang === 'en' ? 'How Tafseer evolved through centuries.' : 'صدیوں میں تفسیر کا سفر۔' },
                                    ].map((item, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                            <Card className="h-full border-rose-500/10 hover:shadow-lg transition-transform hover:-translate-y-1">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Info className="h-5 w-5 text-rose-500" />
                                                        {item.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground">{item.desc}</p>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="sessions" className="mt-0">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">{t.sessions}</h2>
                                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && <MediaUpload category="Tafseer" />}
                                </div>

                                {tafseerVideos.length === 0 ? (
                                    <Card className="p-12 text-center border-dashed">
                                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                            <Video className="h-12 w-12 opacity-20" />
                                            <p>{lang === 'en' ? 'No Tafseer sessions available yet.' : 'ابھی تک کوئی تفسیر سیشن دستیاب نہیں ہے۔'}</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tafseerVideos.map((video) => (
                                            <Card key={video.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/40 hover:border-rose-500/30 flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-2xl">
                                                <div className="relative aspect-video bg-muted shrink-0 overflow-hidden cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                                    <LectureCover
                                                        title={video.title[lang]}
                                                        category="Tafseer"
                                                        imageUrl={video.thumbnail}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                                                    </div>
                                                    <Badge variant="secondary" className="absolute bottom-2 right-2 gap-1 bg-black/60 text-white border-none backdrop-blur-md">
                                                        <Clock className="h-3 w-3" />
                                                        {video.duration}
                                                    </Badge>
                                                </div>

                                                <CardHeader className="p-5 pb-2">
                                                    <h3 className="font-bold text-lg leading-tight line-clamp-2 h-12">
                                                        {video.title[lang]}
                                                    </h3>
                                                </CardHeader>

                                                <CardFooter className="p-5 pt-0 flex gap-2">
                                                    <Button className="flex-1 rounded-xl h-11 gap-2 font-bold shadow-lg bg-rose-600 hover:bg-rose-700" onClick={() => setPlayingVideo(video)}>
                                                        <PlayCircle className="h-4 w-4" />
                                                        {t.watch}
                                                    </Button>
                                                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="shrink-0 rounded-xl h-11 w-11 shadow-lg"
                                                            onClick={() => setVideoToDelete(video.id)}
                                                            disabled={deleteVideoMutation.isPending}
                                                        >
                                                            {deleteVideoMutation.isPending && videoToDelete === video.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="notes" className="mt-0">
                                <CourseNotesSection courseId="tafseer" />
                            </TabsContent>

                            <TabsContent value="tests" className="mt-0">
                                <CourseTestSection courseId="tafseer" />
                            </TabsContent>

                            <TabsContent value="groups" className="mt-0">
                                <h2 className="text-2xl font-bold mb-6">{lang === 'en' ? 'Tafseer Groups' : 'تفسیر گروپس'}</h2>
                                <CourseGroupsSection category="Tafseer" />
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black tracking-tight">{lang === 'en' ? 'Latest Updates' : 'تازہ ترین اپ ڈیٹس'}</h2>
                                        <AnnouncementUpload category="Tafseer" />
                                    </div>
                                    {!announcements?.length ? (
                                        <Card className="p-12 text-center border-dashed">
                                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                                <Sparkles className="h-12 w-12 opacity-20" />
                                                <p>{lang === 'en' ? 'No new updates for this course.' : 'اس کورس کے لیے کوئی نئی اپ ڈیٹ نہیں ہے۔'}</p>
                                            </div>
                                        </Card>
                                    ) : (
                                        announcements.map((ann: any, idx: number) => (
                                            <motion.div key={ann.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                                                <Card className="overflow-hidden border-none shadow-lg bg-white rounded-[2rem]">
                                                    <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 flex items-center justify-between text-white">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                <Sparkles className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-xl tracking-tight">{ann.title}</h3>
                                                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{format(new Date(ann.createdAt), "PPP")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-8 space-y-4">
                                                        {ann.content && ann.content !== "Voice Message" && (
                                                            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                                                                {ann.content}
                                                            </div>
                                                        )}
                                                        {ann.fileType === 'voice' && ann.fileUrl && (
                                                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 max-w-md">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Mic className="h-4 w-4 text-rose-600" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600/60">Voice Message</span>
                                                                </div>
                                                                <audio src={ann.fileUrl} controls className="w-full h-10" />
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            {playingVideo && (
                                <MediaPlayer url={playingVideo.url} title={playingVideo.title[lang]} onClose={() => setPlayingVideo(null)} />
                            )}
                        </Tabs>
                    </div>

                    {/* Sticky Right Sidebar */}
                    <aside className="lg:w-[30%] xl:w-[25%] order-1 lg:order-2">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-rose-950 text-white overflow-hidden relative group">
                                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/tajweed_sidebar_bg.png')" }} />
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-rose-950 to-transparent" />
                                <CardHeader className="p-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">{lang === 'en' ? 'Quick Tools' : 'فوری ٹولز'}</CardTitle>
                                            <p className="text-rose-200/60 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Quranic Insight</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 grid grid-cols-1 gap-4 relative z-10">
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('foundations')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Foundations' : 'بنیادی باتیں'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('sessions')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <Video className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Video Library</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('notes')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Course Notes</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('tests')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <ClipboardList className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Take a Test</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('groups')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Course Groups' : 'کورس گروپس'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-rose-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('updates')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Latest Updates' : 'تازہ ترین خبریں'}</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-24 w-24 text-rose-900" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-xl font-black text-rose-950 leading-tight">Master Quranic Exegesis</h3>
                                    <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                                        Unlock the timeless wisdom and historical context behind every verse of the Holy Quran.
                                    </p>
                                    <Badge className="bg-rose-100 text-rose-600 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">
                                        Advanced Studies
                                    </Badge>
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>

                <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
                    <AlertDialogContent className="rounded-3xl border-primary/10">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                {t.confirmDelete}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t.deleteDesc}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteVideo}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                            >
                                {t.delete}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CourseGuard>
    );
}
