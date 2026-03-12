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
    Users, Mic, Megaphone, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useVideos, useDeleteVideo, useCheckAchievements, useUserGroups, useCategoryAnnouncements } from "@/hooks/use-resources";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import MediaUpload from "@/components/MediaUpload";
import CourseTestSection from "@/components/CourseTestSection";
import CourseNotesSection from "@/components/CourseNotesSection";
import LectureCover from "@/components/LectureCover";
import CourseHero from "@/components/CourseHero";
import CourseGuard from "@/components/CourseGuard";
import CourseGroupsSection from "@/components/CourseGroupsSection";
import { TajweedText } from "@/components/TajweedText";
import { TAJWEED_RULES } from "@/data/tajweed-data";
import tajweedHero from "@/assets/images/tajweed_hero.png";
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
import { cn } from "@/lib/utils";

export default function TajweedCourse() {
    const { lang } = useTheme();
    const [activeTab, setActiveTab] = useState("sessions");
    const [tajweedVideos, setTajweedVideos] = useState<any[]>([]);
    const [playingVideo, setPlayingVideo] = useState<any | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();
    const { data: videosData } = useVideos();
    const deleteVideoMutation = useDeleteVideo();
    const { mutate: checkAchievements } = useCheckAchievements();

    const { data: announcements } = useCategoryAnnouncements("Tajweed");

    useEffect(() => {
        // Award Tajweed badge
        checkAchievements({ visitedTajweed: true });
    }, []);

    useEffect(() => {
        if (videosData) {
            setTajweedVideos(videosData.filter((v: any) => v.category === 'Tajweed'));
        }
    }, [videosData]);

    const t = {
        title: lang === 'en' ? 'Tajweed Mastery' : 'تجوید القرآن کورس',
        subtitle: lang === 'en' ? 'Perfect your Quranic recitation with expert-led video sessions' : 'ماہرین کے زیرِ نگرانی ویڈیو سیشنز کے ذریعے اپنی تلاوت کو بہتر بنائیں',
        rules: lang === 'en' ? 'Tajweed Rules' : 'تجوید کے قواعد',
        sessions: lang === 'en' ? 'Video Library' : 'ویڈیو لائبریری',
        watch: lang === 'en' ? 'Watch Now' : 'اب دیکھیں',
        confirmDelete: lang === 'en' ? "Are you sure?" : "کیا آپ کو یقین ہے؟",
        deleteDesc: lang === 'en' ? "This will permanently remove this lecture from the library." : "یہ مستقل طور پر اس لیکچر کو لائبریری سے ہٹا دے گا۔",
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

    const rules = [
        {
            title: lang === 'en' ? 'Makharij' : 'مخارج',
            desc: lang === 'en' ? 'Points of articulation for Arabic letters.' : 'عربی حروف کی ادائیگی کے مقامات۔',
            icon: <Info className="h-5 w-5 text-emerald-500" />,
            color: "bg-emerald-50 border-emerald-100"
        },
        {
            title: lang === 'en' ? 'Sifaat' : 'صفات',
            desc: lang === 'en' ? 'Characteristics and qualities of letters.' : 'حروف کی خصوصیات اور ان کی کیفیات۔',
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            color: "bg-amber-50 border-amber-100"
        },
        {
            title: lang === 'en' ? 'Noon Sakin' : 'نون ساکن',
            desc: lang === 'en' ? 'Izhar, Idgham, Iqlab, and Ikhfa rules.' : 'اظہار، ادغام، اقلاب اور اخفاء کے قواعد۔',
            icon: <BookOpen className="h-5 w-5 text-blue-500" />,
            color: "bg-blue-50 border-blue-100"
        },
        {
            title: lang === 'en' ? 'Meem Sakin' : 'میم ساکن',
            desc: lang === 'en' ? 'Ikhfa-e-Shafawi, Idgham-e-Shafawi, Izhar-e-Shafawi.' : 'اخفاء شفوی، ادغام شفوی، اظہار شفوی کے قواعد۔',
            icon: <Info className="h-5 w-5 text-rose-500" />,
            color: "bg-rose-50 border-rose-100"
        },
        {
            title: lang === 'en' ? 'Ghunnah' : 'غنہ',
            desc: lang === 'en' ? 'Nasalization in Noon and Meem Mushaddad.' : 'نون اور میم مشدد پر ناک میں آواز لے جانے کا قاعدہ۔',
            icon: <Mic className="h-5 w-5 text-purple-500" />,
            color: "bg-purple-50 border-purple-100"
        },
    ];

    return (
        <CourseGuard courseName="Tajweed">
            <div className="space-y-8 pb-20 px-4 md:px-0">
                <CourseHero
                    title={t.title}
                    subtitle={t.subtitle}
                    badgeText={lang === 'en' ? 'Step-by-Step Learning' : 'مرحلہ وار تعلیم'}
                    color="gold"
                    illustration={tajweedHero}
                >
                    <div className="hidden md:block">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 backdrop-blur-sm animate-pulse">
                            <BookOpen className="h-10 w-10 text-emerald-600" />
                        </div>
                    </div>
                </CourseHero>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="lg:w-[70%] xl:w-[75%] space-y-6 order-2 lg:order-1">
                        <Tabs value={activeTab} defaultValue="sessions" className="w-full" onValueChange={setActiveTab}>
                            <div className="flex justify-start mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-border/50 flex w-max">
                                    <TabsTrigger value="foundations" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Foundations' : 'بنیادی باتیں'}
                                    </TabsTrigger>
                                    <TabsTrigger value="sessions" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <Video className="h-4 w-4 mr-2" /> {t.sessions}
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Notes' : 'کورس نوٹس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="tests" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <ClipboardList className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Take a Test' : 'ٹیسٹ لیں'}
                                    </TabsTrigger>
                                    <TabsTrigger value="groups" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <Users className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Groups' : 'گروپس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="rounded-xl px-6 data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-300">
                                        <Megaphone className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Latest Updates' : 'تازہ ترین اپ ڈیٹس'}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="foundations" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { title: lang === 'en' ? 'Intro to Tajweed' : 'تجوید کا تعارف', desc: lang === 'en' ? 'Learn the importance and history of Tajweed.' : 'تجوید کی اہمیت اور تاریخ کے بارے میں جانیں۔' },
                                        { title: lang === 'en' ? 'Articulation' : 'ادائیگی کے اصول', desc: lang === 'en' ? 'Basic principles of letter pronunciation.' : 'حروف کی ادائیگی کے بنیادی اصول۔' },
                                        { title: lang === 'en' ? 'Reading Guide' : 'پڑھنے کی رہنمائی', desc: lang === 'en' ? 'How to start reading with correct rules.' : 'درست قواعد کے ساتھ پڑھنے کا طریقہ۔' },
                                    ].map((item, idx) => (
                                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                            <Card className="h-full border-emerald-500/10 hover:shadow-lg transition-transform hover:-translate-y-1">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Info className="h-5 w-5 text-emerald-500" />
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
                                    <h2 className="text-2xl font-bold tracking-tight">{t.sessions}</h2>
                                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && <MediaUpload category="Tajweed" />}
                                </div>

                                {tajweedVideos.length === 0 ? (
                                    <Card className="p-12 text-center border-dashed rounded-3xl">
                                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                            <Video className="h-12 w-12 opacity-20" />
                                            <p>{lang === 'en' ? 'No practice sessions available yet.' : 'ابھی تک کوئی مشق سیشن دستیاب نہیں ہے۔'}</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {tajweedVideos.map((video) => (
                                            <Card key={video.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/40 hover:border-emerald-500/30 flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-3xl">
                                                <div className="relative aspect-video bg-muted shrink-0 overflow-hidden cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                                    <LectureCover
                                                        title={video.title[lang]}
                                                        category="Tajweed"
                                                        imageUrl={video.thumbnail}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                                                    </div>
                                                    <Badge variant="secondary" className="absolute bottom-3 right-3 gap-1 bg-black/60 text-white border-none backdrop-blur-md px-3 py-1 font-bold">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {video.duration}
                                                    </Badge>
                                                </div>

                                                <CardHeader className="p-6 pb-2">
                                                    <h3 className="font-bold text-xl leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors">
                                                        {video.title[lang]}
                                                    </h3>
                                                </CardHeader>

                                                <CardFooter className="p-6 pt-0 flex gap-3">
                                                    <Button className="flex-1 rounded-2xl h-12 gap-2 font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95" onClick={() => setPlayingVideo(video)}>
                                                        <PlayCircle className="h-5 w-5" />
                                                        {t.watch}
                                                    </Button>
                                                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0 rounded-2xl h-12 w-12 border-red-100 text-red-600 hover:bg-red-50"
                                                            onClick={() => setVideoToDelete(video.id)}
                                                            disabled={deleteVideoMutation.isPending}
                                                        >
                                                            {deleteVideoMutation.isPending && videoToDelete === video.id ? (
                                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-5 w-5" />
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
                                <CourseNotesSection courseId="tajweed" />
                            </TabsContent>

                            <TabsContent value="tests" className="mt-0">
                                <CourseTestSection courseId="tajweed" />
                            </TabsContent>

                            <TabsContent value="groups" className="mt-0">
                                <h2 className="text-2xl font-bold mb-6 tracking-tight">{lang === 'en' ? 'Tajweed Groups' : 'تجوید گروپس'}</h2>
                                <CourseGroupsSection category="Tajweed" />
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <div className="space-y-6">
                                    {!announcements?.length ? (
                                        <Card className="p-12 text-center border-dashed rounded-3xl">
                                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                                <Sparkles className="h-12 w-12 opacity-20" />
                                                <p>{lang === 'en' ? 'No new updates for this course.' : 'اس کورس کے لیے کوئی نئی اپ ڈیٹ نہیں ہے۔'}</p>
                                            </div>
                                        </Card>
                                    ) : (
                                        announcements.map((ann: any, idx: number) => (
                                            <motion.div key={ann.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                                                <Card className="overflow-hidden border-none shadow-xl bg-white rounded-[2.5rem]">
                                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 flex items-center justify-between text-white">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                                                <Sparkles className="h-7 w-7 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-2xl tracking-tighter">{ann.title}</h3>
                                                                <p className="text-white/80 text-sm font-bold uppercase tracking-[0.2em] mt-1">{format(new Date(ann.createdAt), "PPP")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-10 space-y-6">
                                                        {ann.content && ann.content !== "Voice Message" && (
                                                            <div className="prose prose-slate max-w-none text-slate-700 font-bold leading-relaxed text-lg">
                                                                {ann.content}
                                                            </div>
                                                        )}
                                                        {ann.fileType === 'voice' && ann.fileUrl && (
                                                            <div className="p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100/50 max-w-md shadow-sm">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                        <Mic className="h-4 w-4 text-emerald-600" />
                                                                    </div>
                                                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Audio Lecture</span>
                                                                </div>
                                                                <audio src={ann.fileUrl} controls className="w-full h-12 rounded-full" />
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

                    {/* Tajweed Rules Sidebar */}
                    <aside className="lg:w-[35%] xl:w-[30%] order-1 lg:order-2">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden">
                                <CardHeader className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/tajweed_sidebar_bg.png')" }} />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black tracking-tight">{t.rules}</CardTitle>
                                            <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mt-1">Reference Guide</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {TAJWEED_RULES.map((rule, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className={cn("p-5 rounded-3xl border transition-all hover:shadow-lg bg-card/50", "border-emerald-100 hover:border-emerald-300")}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={cn("font-black tracking-tight uppercase text-xs uppercase tracking-widest", rule.color)}>{rule.name}</h4>
                                                    <div className={cn("w-2 h-2 rounded-full", rule.color.replace('text-', 'bg-'))} />
                                                </div>
                                                <p className="text-sm text-muted-foreground font-bold leading-relaxed mb-4">
                                                    {rule.description}
                                                </p>
                                                <p className="text-xl font-urdu text-right border-r-4 border-emerald-200 pr-4 leading-loose mb-4" dir="rtl">
                                                    {rule.descriptionUrdu}
                                                </p>
                                                {rule.letters && (
                                                    <div className="flex flex-wrap gap-2 justify-end">
                                                        {rule.letters.map(l => (
                                                            <span key={l} className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-quran text-xl shadow-sm border border-emerald-50">
                                                                {l}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-950 text-white overflow-hidden relative group">
                                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/tajweed_sidebar_bg.png')" }} />
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-indigo-950 to-transparent" />
                                <CardHeader className="p-8 relative z-10">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        {lang === 'en' ? 'Quick Tools' : 'فوری ٹولز'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 grid grid-cols-1 gap-4 relative z-10">
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('foundations')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Foundations</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('sessions')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Video className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Video Library</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('notes')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Course Notes</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('tests')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <ClipboardList className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Take a Test</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('groups')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Course Groups' : 'کورس گروپس'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('updates')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Latest Updates' : 'تازہ ترین اپ ڈیٹس'}</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-emerald-900 text-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-24 w-24" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-xl font-black leading-tight">Professional Recitation</h3>
                                    <p className="text-emerald-100/70 text-sm font-bold leading-relaxed">
                                        Our teachers are certified from renowned Islamic institutions. Focus on your Makharij daily for the best results.
                                    </p>
                                    <div className="pt-2">
                                        <Badge className="bg-emerald-500 hover:bg-emerald-400 text-white border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest">
                                            Ijazah Certified
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>

                <AlertDialog open={!!videoToDelete} onOpenChange={() => setVideoToDelete(null)}>
                    <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-3 text-red-600 text-2xl font-black tracking-tight">
                                <AlertTriangle className="h-8 w-8" />
                                {t.confirmDelete}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-lg font-bold text-slate-600 mt-2">
                                {t.deleteDesc}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3 mt-8">
                            <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-slate-200">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteVideo}
                                className="bg-red-600 text-white hover:bg-red-700 rounded-2xl h-14 px-8 font-black shadow-lg shadow-red-200"
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
