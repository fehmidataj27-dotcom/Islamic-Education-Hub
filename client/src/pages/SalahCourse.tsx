import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import MediaPlayer from "@/components/MediaPlayer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    BookOpen,
    Clock,
    PlayCircle,
    Info,
    Check,
    Video,
    Trash2,
    Loader2,
    ClipboardList,
    AlertTriangle,
    Users, Mic, Sparkles, Megaphone
} from "lucide-react";
import { motion } from "framer-motion";
import { useVideos, useDeleteVideo, useSalahProgress, useUpdateSalahProgress, useCheckAchievements, useUserGroups, useCategoryAnnouncements } from "@/hooks/use-resources";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import MediaUpload from "@/components/MediaUpload";
import CourseTestSection from "@/components/CourseTestSection";
import CourseNotesSection from "@/components/CourseNotesSection";
import CourseGroupsSection from "@/components/CourseGroupsSection";
import LectureCover from "@/components/LectureCover";
import CourseHero from "@/components/CourseHero";
import CourseGuard from "@/components/CourseGuard";
import namazHero from "file:///C:/Users/Fehmida%20Taj/.gemini/antigravity/brain/4ba9dfa2-40dd-4da3-86ca-15ecb75f168c/salah_course_banner_1772547230333.png";
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

export default function SalahCourse() {
    const { lang } = useTheme();
    const [activeTab, setActiveTab] = useState("guide");
    const [salahVideos, setSalahVideos] = useState<any[]>([]);
    const [playingVideo, setPlayingVideo] = useState<any | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();
    const { data: videosData } = useVideos();
    const { data: userGroups } = useUserGroups();
    const { data: progressData } = useSalahProgress();
    const updateProgressMutation = useUpdateSalahProgress();
    const deleteVideoMutation = useDeleteVideo();
    const { mutate: checkAchievements } = useCheckAchievements();

    const { data: announcements } = useCategoryAnnouncements("Namaz");


    useEffect(() => {
        // Award Namaz badge
        checkAchievements({ visitedNamaz: true });
    }, []);

    useEffect(() => {
        if (videosData) {
            // Also include Fiqh for Salah
            setSalahVideos(videosData.filter((v: any) => v.category === 'Namaz' || v.category === 'Fiqh'));
        }
    }, [videosData]);

    const t = {
        title: lang === 'en' ? 'Authentic Salat Guide' : 'صحیح نماز گائیڈ',
        subtitle: lang === 'en' ? 'Learn the correct way to perform Salah according to Sunnah' : 'سنت کے مطابق نماز ادا کرنے کا درست طریقہ سیکھیں',
        guide: lang === 'en' ? 'Foundations' : 'بنیادی باتیں',
        sessions: lang === 'en' ? 'Video Library' : 'ویڈیو لائبریری',
        watch: lang === 'en' ? 'Watch Now' : 'اب دیکھیں',
        confirmDelete: lang === 'en' ? "Are you sure?" : "کیا آپ کو یقین ہے؟",
        deleteDesc: lang === 'en' ? "This will permanently remove this Salah lecture." : "یہ مستقل طور پر اس نماز کے لیکچر کو ہٹا دے گا۔",
        cancel: lang === 'en' ? "Cancel" : "منسوخ کریں",
        delete: lang === 'en' ? "Delete" : "حذف کریں",
    };

    const steps = [
        { id: 's1', title: lang === 'en' ? 'Wudu (Ablution)' : 'وضو کا طریقہ', desc: lang === 'en' ? 'Purifying oneself before prayer.' : 'نماز سے پہلے پاکیزگی حاصل کرنا۔' },
        { id: 's2', title: lang === 'en' ? 'Niyyah & Takbir' : 'نیت اور تکبیر', desc: lang === 'en' ? 'Starting the prayer with intention.' : 'نیت کے ساتھ نماز کا آغاز کرنا۔' },
        { id: 's3', title: lang === 'en' ? 'Qiyam & Recitation' : 'قیام اور قراءت', desc: lang === 'en' ? 'Standing and reciting the Holy Quran.' : 'کھڑے ہونا اور قرآن مجید کی تلاوت کرنا۔' },
        { id: 's4', title: lang === 'en' ? 'Ruku & Sujud' : 'رکوع اور سجود', desc: lang === 'en' ? 'Bowing and prostration positions.' : 'رکوع اور سجدے کی کیفیات۔' },
    ];

    const completedSteps = progressData?.filter((p: any) => p.completed).length || 0;
    const progressPercentage = (completedSteps / steps.length) * 100;

    const handleStepToggle = async (stepId: string, currentStatus: boolean) => {
        if (!user) return;
        try {
            await updateProgressMutation.mutateAsync({ stepId, completed: !currentStatus });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        }
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
        <CourseGuard courseName="Namaz">
            <div className="space-y-8 pb-20">
                <CourseHero
                    title={t.title}
                    subtitle={t.subtitle}
                    badgeText={lang === 'en' ? 'Foundation of Deen' : 'دین کی بنیاد'}
                    color="blue"
                    illustration={namazHero}
                >
                    {user && (
                        <Card className="w-full md:w-80 bg-background/60 backdrop-blur-md border-blue-500/20 p-6 rounded-2xl shadow-xl">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center font-bold">
                                    <span>{lang === 'en' ? 'Your Progress' : 'آپ کی پیش رفت'}</span>
                                    <span className="text-blue-500">{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} className="h-2 bg-blue-100" />
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                    {completedSteps} / {steps.length} {lang === 'en' ? 'Steps Completed' : 'مراحل مکمل'}
                                </p>
                            </div>
                        </Card>
                    )}
                </CourseHero>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="lg:w-[70%] xl:w-[75%] space-y-6 order-2 lg:order-1">
                        <Tabs value={activeTab} defaultValue="guide" className="w-full" onValueChange={setActiveTab}>
                            <div className="flex justify-start mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-border/50 flex w-max">
                                    <TabsTrigger value="guide" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Foundations' : 'بنیادی باتیں'}
                                    </TabsTrigger>
                                    <TabsTrigger value="sessions" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <Video className="h-4 w-4 mr-2" /> {t.sessions}
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <BookOpen className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Notes' : 'کورس نوٹس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="tests" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <ClipboardList className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Take a Test' : 'ٹیسٹ لیں'}
                                    </TabsTrigger>
                                    <TabsTrigger value="groups" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <Users className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Course Groups' : 'گروپس'}
                                    </TabsTrigger>
                                    <TabsTrigger value="updates" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
                                        <Megaphone className="h-4 w-4 mr-2" /> {lang === 'en' ? 'Latest Updates' : 'تازہ ترین اپ ڈیٹس'}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="guide" className="mt-0">
                                <Accordion type="single" collapsible className="space-y-4">
                                    {steps.map((step) => {
                                        const isCompleted = progressData?.some((p: any) => p.stepId === step.id && p.completed) || false;
                                        return (
                                            <AccordionItem key={step.id} value={step.id} className="border border-blue-500/10 rounded-2xl px-4 bg-card overflow-hidden">
                                                <AccordionTrigger className="hover:no-underline py-6">
                                                    <div className="flex items-center gap-4 text-left">
                                                        <Button
                                                            variant={isCompleted ? "default" : "outline"}
                                                            size="icon"
                                                            className={`rounded-full shrink-0 h-10 w-10 ${isCompleted ? 'bg-blue-600' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStepToggle(step.id, isCompleted);
                                                            }}
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </Button>
                                                        <div>
                                                            <p className="font-bold text-lg">{step.title}</p>
                                                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-6 pt-2">
                                                    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border-dashed border-2">
                                                        <div className="text-center space-y-2">
                                                            <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">Detailed video guide for this step is coming soon.</p>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </TabsContent>

                            <TabsContent value="sessions" className="mt-0">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">{t.sessions}</h2>
                                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && <MediaUpload category="Namaz" />}
                                </div>

                                {salahVideos.length === 0 ? (
                                    <Card className="p-12 text-center border-dashed">
                                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                            <Video className="h-12 w-12 opacity-20" />
                                            <p>{lang === 'en' ? 'No Salah sessions available yet.' : 'ابھی تک کوئی نماز سیشن دستیاب نہیں ہے۔'}</p>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {salahVideos.map((video) => (
                                            <Card key={video.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/40 hover:border-blue-500/30 flex flex-col h-full bg-card/40 backdrop-blur-sm rounded-2xl">
                                                <div className="relative aspect-video bg-muted shrink-0 overflow-hidden cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                                    <LectureCover
                                                        title={video.title[lang]}
                                                        category="Namaz"
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
                                                    <Button className="flex-1 rounded-xl h-11 gap-2 font-bold shadow-lg bg-blue-600 hover:bg-blue-700" onClick={() => setPlayingVideo(video)}>
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
                                <CourseNotesSection courseId="namaz" />
                            </TabsContent>

                            <TabsContent value="tests" className="mt-0">
                                <CourseTestSection courseId="namaz" />
                            </TabsContent>

                            <TabsContent value="groups" className="mt-0">
                                <h2 className="text-2xl font-bold mb-6">{lang === 'en' ? 'Namaz Groups' : 'نماز گروپس'}</h2>
                                <CourseGroupsSection category="Namaz" />
                            </TabsContent>

                            <TabsContent value="updates" className="mt-0">
                                <div className="space-y-6">
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
                                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between text-white">
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
                                                                    <Mic className="h-4 w-4 text-blue-600" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Voice Message</span>
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
                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-blue-950 text-white overflow-hidden relative group">
                                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/tajweed_sidebar_bg.png')" }} />
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-950 to-transparent" />
                                <CardHeader className="p-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight">{lang === 'en' ? 'Quick Tools' : 'فوری ٹولز'}</CardTitle>
                                            <p className="text-blue-200/60 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Spiritual Growth</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 grid grid-cols-1 gap-4 relative z-10">
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('guide')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Foundations' : 'بنیادی باتیں'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('sessions')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Video className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Video Library</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('notes')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Course Notes</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('tests')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <ClipboardList className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">Take a Test</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('groups')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Course Groups' : 'کورس گروپس'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 justify-start gap-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 text-white px-6 transition-all"
                                        onClick={() => setActiveTab('updates')}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{lang === 'en' ? 'Latest Updates' : 'تازہ ترین خبریں'}</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Check className="h-24 w-24 text-blue-900" />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-xl font-black text-blue-950 leading-tight">Perfect Your Prayer</h3>
                                    <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                                        Follow along with our step-by-step guides to ensure your Salah is performed according to the Sunnah.
                                    </p>
                                    <Badge className="bg-blue-100 text-blue-600 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">
                                        Beginner Friendly
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
