import { useState, useMemo, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    Download,
    TrendingUp,
    BookOpen,
    BrainCircuit,
    Loader2,
    User,
    Calendar,
    Award,
    Star,
    Sparkles,
    ChevronRight,
    Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { CourseTestResult, QuranProgress, DailyStats } from "@shared/schema";
import { cn } from "@/lib/utils";
import CourseHero from "@/components/CourseHero";
import islamicPattern from "@/assets/images/islamic_pattern_hero.png";
import mosqueSilhouette from "@/assets/images/mosque_silhouette.png";
import { toJpeg } from 'html-to-image';
import { jsPDF } from "jspdf";
import JSZip from "jszip";

export default function ProgressReports() {
    const { lang } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();
    const [downloading, setDownloading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [studentSearch, setStudentSearch] = useState("");
    const [isBatchExporting, setIsBatchExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "teacher";
    const currentViewUserId = selectedUserId || user?.id;

    // Fetch All Students (for Admin)
    const { data: students = [] } = useQuery<any[]>({
        queryKey: ["/api/admin/users"],
        enabled: isAdmin,
    });

    const activeStudents = useMemo(() => {
        const filtered = students.filter(s => s.role?.toLowerCase() === "student");
        if (!studentSearch) return filtered;
        return filtered.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.username?.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [students, studentSearch]);

    // Fetch Quiz Scores
    const { data: testResults = [], isLoading: isLoadingResults } = useQuery<CourseTestResult[]>({
        queryKey: [isAdmin && selectedUserId ? `/api/admin/reports/${selectedUserId}/test-results` : api.courseTests.results.path],
    });

    // Fetch Quran Progress
    const { data: quranProgress = [], isLoading: isLoadingQuran } = useQuery<QuranProgress[]>({
        queryKey: [isAdmin && selectedUserId ? `/api/admin/reports/${selectedUserId}/quran-progress` : api.quran.progress.path],
    });

    // Fetch Daily Stats
    const { data: dailyStats, isLoading: isLoadingStats } = useQuery<DailyStats>({
        queryKey: [isAdmin && selectedUserId ? `/api/admin/reports/${selectedUserId}/daily-stats` : api.dailyStats.get.path],
    });

    const { data: statsHistory = [] } = useQuery<DailyStats[]>({
        queryKey: [isAdmin && selectedUserId ? `/api/admin/reports/${selectedUserId}/daily-stats/history` : api.dailyStats.history.path],
    });

    const selectedUser = useMemo(() => {
        if (!isAdmin || !selectedUserId) return user;
        return activeStudents.find(s => s.id === selectedUserId) || user;
    }, [isAdmin, selectedUserId, activeStudents, user]);

    const isLoading = isLoadingResults || isLoadingQuran || isLoadingStats;

    const quizScores = useMemo(() => testResults.map(r => Math.round((r.score || 0) / (r.total || 1) * 100)), [testResults]);
    const avgScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    const bestScore = quizScores.length > 0 ? Math.max(...quizScores) : 0;
    const latestQuran = quranProgress[quranProgress.length - 1];

    const attendanceStats = useMemo(() => {
        if (statsHistory.length === 0) return { percent: 0, present: 0, absent: 0 };
        const present = statsHistory.filter(s => s.attendance).length;
        return {
            percent: Math.round((present / statsHistory.length) * 100),
            present,
            absent: statsHistory.length - present
        };
    }, [statsHistory]);

    const d = {
        studentName: `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`.trim() || "Student",
        studentClass: lang === 'en' ? "Darse Nizami - Class A" : "درسِ نظامی - کلاس اے",
        initials: `${selectedUser?.firstName?.[0] || 'U'}${selectedUser?.lastName?.[0] || ''}`,
        attendance: {
            percent: attendanceStats.percent,
            present: attendanceStats.present,
            absent: attendanceStats.absent,
            late: 0,
            status: dailyStats?.attendance ? (lang === 'en' ? "Active Today" : "آج حاضر") : (lang === 'en' ? "Inactive Today" : "آج غیر حاضر")
        },
        hifz: {
            percent: latestQuran ? Math.min(100, (latestQuran.ayah / 50) * 100) : 0,
            juz: latestQuran ? `${lang === 'en' ? 'Surah' : 'سورہ'} ${latestQuran.surah}` : "N/A",
            remaining: lang === 'en' ? "Target: 50 Ayahs/Day" : "ہدف: 50 آیات روزانہ",
            note: lang === 'en' ? "Consistently improving Masha Allah." : "ماشاء اللہ، مسلسل بہتری آ رہی ہے۔"
        },
        quizScores: quizScores.slice(-6).length > 0 ? quizScores.slice(-6) : [0],
    };

    const getGrade = (score: number) => {
        if (score >= 90) return { label: "A+", color: "text-emerald-600", bg: "bg-emerald-50" };
        if (score >= 80) return { label: "A", color: "text-emerald-500", bg: "bg-emerald-50" };
        if (score >= 70) return { label: "B", color: "text-indigo-500", bg: "bg-indigo-50" };
        if (score >= 60) return { label: "C", color: "text-amber-500", bg: "bg-amber-50" };
        return { label: "D", color: "text-rose-500", bg: "bg-rose-50" };
    };

    const currentGrade = getGrade(avgScore);

    const handleDownload = async (customUserId?: string) => {
        // If a specific student is requested from the list, select them first
        if (customUserId && customUserId !== selectedUserId) {
            setSelectedUserId(customUserId);
            // Wait for data fetching and re-render
            setDownloading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (!reportRef.current) return;
        setDownloading(true);
        try {
            const element = reportRef.current;

            // Standardize capture environment for a perfect single-page layout
            const originalStyle = element.style.cssText;
            element.classList.add('exporting');
            element.style.padding = '40px';
            element.style.width = '1000px';
            element.style.background = '#ffffff';

            // Wait for any renders/transitions
            await new Promise(resolve => setTimeout(resolve, 800));

            const options = {
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: 1000,
                quality: 0.98,
                pixelRatio: 2, // Higher quality for professional reports
            };

            const { toJpeg: internalToJpeg } = await import('html-to-image');
            const dataUrl = await internalToJpeg(element, options);

            // Restore original style immediately
            element.style.cssText = originalStyle;
            element.classList.remove('exporting');

            // Initialize PDF - A4 size
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeightInMm = (imgProps.height * pageWidth) / imgProps.width;

            // Professional "One-Page" Force Scaling: 
            // We force everything onto exactly one page as requested by the user.
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

            const fileName = `Report_${(selectedUser?.firstName || "Student")}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
            pdf.save(fileName);

            toast({
                title: lang === 'en' ? "✅ Report Exported" : "✅ رپورٹ محفوظ کر لی گئی",
                description: lang === 'en' ? "High-quality PDF is ready." : "تعلیمی رپورٹ ڈاؤن لوڈ کے لیے تیار ہے۔",
            });
        } catch (err) {
            console.error('Export error:', err);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "There was an issue generating the file. Please try again."
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleBatchExport = async () => {
        if (!activeStudents.length) return;
        setIsBatchExporting(true);
        setExportProgress(1);

        try {
            const zip = new JSZip();
            const folder = zip.folder("Student_Reports");

            // Loop through students
            for (let i = 0; i < activeStudents.length; i++) {
                const s = activeStudents[i];
                setSelectedUserId(s.id);
                setExportProgress(Math.round(((i + 0.5) / activeStudents.length) * 100));

                // Wait for state update and render - slightly longer to ensure full layout stability
                await new Promise(resolve => setTimeout(resolve, 1200));

                if (reportRef.current) {
                    const options = {
                        cacheBust: true,
                        backgroundColor: '#ffffff',
                        width: 1000,
                        quality: 0.9,
                        pixelRatio: 1.2,
                    };

                    const dataUrl = await toJpeg(reportRef.current, options);
                    const fileName = `${s.firstName}_${s.lastName}_Report.pdf`;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

                    const pdfData = pdf.output('blob');
                    folder?.file(fileName, pdfData);
                }

                setExportProgress(Math.round(((i + 1) / activeStudents.length) * 100));
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Batch_Reports_${new Date().toLocaleDateString()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: lang === 'en' ? "✅ Batch Export Complete" : "✅ بیچ ایکسپورٹ مکمل",
                description: lang === 'en' ? `Generated ${activeStudents.length} separate reports successfully.` : `تمام طلباء کی ${activeStudents.length} الگ رپورٹس کامیابی سے تیار کر لی گئی ہیں۔`,
            });
        } catch (err) {
            console.error('Batch export error:', err);
            toast({ variant: "destructive", title: "Batch Export Failed", description: "Internal error during processing." });
        } finally {
            setIsBatchExporting(false);
        }
    };

    const t = {
        title: lang === 'en' ? 'Academic Insights' : 'تعلیمی جائزہ',
        subtitle: lang === 'en' ? 'Personal Progress Dashboard' : 'ذاتی پیشرفت ڈیش بورڈ',
        download: lang === 'en' ? 'Export Profile' : 'پروفائل محفوظ کریں',
        batchExport: lang === 'en' ? 'Batch Export All' : 'تمام رورٹس محفوظ کریں',
        attendance: lang === 'en' ? 'Attendance' : 'حاضری',
        hifz: lang === 'en' ? 'Quranic Journey' : 'قرآنی سفر',
        quiz: lang === 'en' ? 'Assessment Analytics' : 'تشخیصی تجزیہ',
        performance: lang === 'en' ? 'Knowledge Mastery' : 'علمی مہارت',
        teacherNote: lang === 'en' ? "Educator's Feedback" : "استاد کا تاثر",
        today: lang === 'en' ? "Today's Status" : "آج کی صورتحال",
        quizzesTaken: lang === 'en' ? "Evaluations Completed" : "مکمل کردہ ٹیسٹ",
        avgMastery: lang === 'en' ? "Avg. Mastery Score" : "اوسط علمی درجہ",
        studentList: lang === 'en' ? "Student Directory" : "طلباء کی فہرست",
        viewingReport: lang === 'en' ? "Viewing Report For" : "رپورٹ دیکھی جا رہی ہے",
    };

    if (isLoading && !isBatchExporting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative w-20 h-20">
                    <Loader2 className="absolute inset-0 h-20 w-20 animate-spin text-emerald-600 opacity-20" />
                    <BarChart3 className="absolute inset-0 m-auto h-10 w-10 text-emerald-600 animate-pulse" />
                </div>
                <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs animate-pulse">
                    Synthesizing academic records...
                </p>
            </div>
        );
    }

    return (
        <div className="relative space-y-12 pb-32 overflow-hidden min-h-screen">
            <div className="absolute inset-x-0 -top-40 h-[600px] z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />

            {/* Premium Header Section */}
            <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50/50 mb-4">
                            Academic Excellence
                        </Badge>
                        <h1 className="text-5xl font-black tracking-tighter text-emerald-950">
                            {t.title}
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">{t.subtitle}</p>
                    </motion.div>

                    <div className="flex flex-wrap items-center gap-4">
                        {isAdmin && (
                            <Button
                                variant="outline"
                                className="h-14 px-8 rounded-2xl bg-indigo-600 border-none text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100/20 font-black text-sm gap-3 transition-all active:scale-95"
                                onClick={handleBatchExport}
                                disabled={isBatchExporting}
                            >
                                <Sparkles className="h-5 w-5" />
                                {t.batchExport}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className={cn(
                                "h-14 px-8 rounded-2xl font-black text-sm gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-100/20",
                                showPreview ? "bg-indigo-600 text-white border-none" : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            )}
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <Sparkles className="h-5 w-5" />
                            {lang === 'en' ? 'Report Preview' : 'رپورٹ کا نمونہ'}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 px-8 rounded-2xl bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-xl shadow-emerald-100/20 font-black text-sm gap-3 transition-all active:scale-95"
                            onClick={() => handleDownload()}
                            disabled={downloading}
                        >
                            {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                            {t.download}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isBatchExporting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-emerald-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
                        >
                            <div className="relative w-40 h-40 mb-10">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent" className="text-emerald-900/40"
                                    />
                                    <motion.circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent" className="text-emerald-400"
                                        strokeDasharray={440}
                                        initial={{ strokeDashoffset: 440 }}
                                        animate={{ strokeDashoffset: 440 - (440 * exportProgress) / 100 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-black text-white">{exportProgress}%</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Generating Individual Reports</h2>
                            <p className="text-emerald-300 font-bold uppercase tracking-widest text-xs">
                                Processing {activeStudents.length} students... Please do not close this window.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Wrap the entire report body for full high-quality PDF capture */}
                <div
                    ref={reportRef}
                    className={cn(
                        "report-capture-area transition-all duration-500",
                        (showPreview || downloading) ? "exporting space-y-4 pb-4" : "space-y-12 pb-12 bg-[#f9fafb]"
                    )}
                >
                    <div className="max-w-7xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group cursor-default p-4 bg-gray-50/50 rounded-[3rem]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-indigo-700 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-15 transition-opacity" />
                            <Card className="rounded-[3rem] border-none bg-white shadow-2xl shadow-emerald-900/5 overflow-hidden">
                                {/* Official Header for PDF - Hidden on Web */}
                                <div className="hidden print-only bg-emerald-950 p-8 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white p-2 rounded-xl">
                                            <img src="/src/assets/images/wajiha-logo.png" alt="Hafiza Wajiha" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black tracking-tight">HAFIZA WAJIHA</h1>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Online Quran Academy</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black uppercase tracking-widest text-amber-400">Official Progress Report</p>
                                        <p className="text-[10px] opacity-70">Academic ID: SQ-{selectedUser?.id?.substring(0, 8).toUpperCase() || "NEW-USR"}</p>
                                        <p className="text-[10px] opacity-70">Enrollment: {new Date(selectedUser?.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className={cn("flex flex-col md:flex-row items-center gap-8", (showPreview || downloading) ? "p-6" : "p-10")}>
                                    <div className="relative">
                                        <Avatar className={cn("border-[6px] border-emerald-50 shadow-2xl", (showPreview || downloading) ? "h-20 w-20" : "h-32 w-32")}>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${d.studentName}&backgroundColor=059669`} />
                                            <AvatarFallback className={cn("bg-emerald-600 font-black text-white", (showPreview || downloading) ? "text-xl" : "text-4xl")}>{d.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                            <Star className="h-5 w-5 text-white fill-white" />
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left space-y-2 flex-1">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                                            {isAdmin && selectedUserId ? t.viewingReport : "Personal Dashboard"}
                                        </p>
                                        <h2 className="text-4xl font-black text-emerald-950 tracking-tight">{d.studentName}</h2>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                                                {d.studentClass}
                                            </Badge>
                                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                                                {selectedUser?.role || "Active Student"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <div className="text-center">
                                            <div className={cn("rounded-full flex items-center justify-center font-black mb-1", currentGrade.bg, currentGrade.color, (showPreview || downloading) ? "w-10 h-10 text-xl" : "w-16 h-16 text-2xl")}>
                                                {currentGrade.label}
                                            </div>
                                            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Grade</div>
                                        </div>
                                        <div className="h-8 w-[1px] bg-gray-100 mx-1" />
                                        <div className="text-center">
                                            <div className={cn("font-black text-emerald-600", (showPreview || downloading) ? "text-xl" : "text-3xl")}>{testResults.length}</div>
                                            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Quizzes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={cn("font-black text-indigo-600", (showPreview || downloading) ? "text-xl" : "text-3xl")}>{avgScore}%</div>
                                            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mastery</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        {/* Visual Analytics Grid */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Attendance Tracker */}
                                <motion.div
                                    initial={isBatchExporting ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Card className={cn("border-emerald-500/5 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group", (showPreview || downloading) ? "p-6 rounded-3xl" : "p-10 rounded-[3rem]")}>
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                                <TrendingUp className="h-7 w-7" />
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold uppercase tracking-widest text-[9px] px-3">Reliability</Badge>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-emerald-950 uppercase tracking-wider">{t.attendance}</h3>
                                                    <p className="text-xs text-muted-foreground font-bold">{t.today}: <span className="text-emerald-600">{d.attendance.status}</span></p>
                                                </div>
                                                <span className="text-5xl font-black text-emerald-600 tracking-tighter">{d.attendance.percent}%</span>
                                            </div>
                                            <div className="bg-emerald-50 h-5 rounded-3xl overflow-hidden shadow-inner border border-emerald-50">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${d.attendance.percent}%` }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 relative"
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent 75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 pt-4">
                                                <div className="bg-emerald-50/50 p-4 rounded-3xl text-center">
                                                    <div className="text-xl font-black text-emerald-700">{d.attendance.present}</div>
                                                    <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-tighter">Sessions</div>
                                                </div>
                                                <div className="bg-indigo-50/50 p-4 rounded-3xl text-center">
                                                    <div className="text-xl font-black text-indigo-700">0</div>
                                                    <div className="text-[10px] font-black text-indigo-500/60 uppercase tracking-tighter">Late</div>
                                                </div>
                                                <div className="bg-rose-50/30 p-4 rounded-3xl text-center">
                                                    <div className="text-xl font-black text-rose-700">{d.attendance.absent}</div>
                                                    <div className="text-[10px] font-black text-rose-500/60 uppercase tracking-tighter">Missed</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Hifz Journey Tracker */}
                                <motion.div
                                    initial={isBatchExporting ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className={cn("border-indigo-500/5 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group", (showPreview || downloading) ? "p-6 rounded-3xl" : "p-10 rounded-[3rem]")}>
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <BookOpen className="h-7 w-7" />
                                            </div>
                                            <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-bold uppercase tracking-widest text-[9px] px-3">Retention</Badge>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-indigo-950 uppercase tracking-wider">{t.hifz}</h3>
                                                    <p className="text-xs text-muted-foreground font-bold">{d.hifz.juz}</p>
                                                </div>
                                                <span className="text-5xl font-black text-indigo-600 tracking-tighter">{Math.round(d.hifz.percent)}%</span>
                                            </div>
                                            <div className="bg-indigo-50 h-5 rounded-3xl overflow-hidden shadow-inner border border-indigo-50">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${d.hifz.percent}%` }}
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 relative"
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent 75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                                                </motion.div>
                                            </div>
                                            <div className="bg-indigo-50/50 rounded-[2rem] p-6 text-center">
                                                <p className="text-sm font-bold text-indigo-900/40 uppercase tracking-widest mb-1">{t.teacherNote}</p>
                                                <p className={cn(
                                                    "text-lg font-black text-indigo-950 leading-tight",
                                                    lang === 'ur' && "font-urdu"
                                                )}>{d.hifz.note}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Performance Analytics Chart (Enhanced CSS Bar Chart) */}
                            <motion.div
                                initial={isBatchExporting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className={cn("border-none bg-white shadow-2xl overflow-hidden relative group", (showPreview || downloading) ? "p-6 rounded-3xl" : "p-12 rounded-[4rem]")}>
                                    <div className="absolute inset-x-0 -bottom-20 h-40 bg-gradient-to-t from-emerald-50 to-transparent opacity-40 pointer-events-none" />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                                                <BrainCircuit className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-emerald-950 tracking-tight">{t.quiz}</h3>
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent Knowledge Checkpoints</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-emerald-600">{avgScore}%</div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Average Mastery</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-amber-500">{bestScore}%</div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Peak Excellence</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[300px] flex items-end justify-between gap-4 md:gap-8 px-6 relative">
                                        {/* Chart Horizontal lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                                            {[1, 2, 3, 4].map(l => <div key={l} className="w-full border-t border-emerald-50 border-dashed" />)}
                                        </div>

                                        {d.quizScores.map((val, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center group/bar relative z-10">
                                                <div className="w-full max-w-[80px] relative">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${val || 1}%` }}
                                                        transition={{ delay: 0.4 + (i * 0.1), type: "spring", stiffness: 40 }}
                                                        className={cn(
                                                            "w-full rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-end pb-3",
                                                            val >= 80 ? "bg-emerald-600" : val >= 60 ? "bg-amber-500" : "bg-indigo-600"
                                                        )}
                                                    >
                                                        {/* Bar Shimmer */}
                                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.2),transparent)] opacity-40" />
                                                        <span className="text-white font-black text-xs relative z-10">{val}%</span>
                                                    </motion.div>

                                                    {/* Tooltip */}
                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-xl text-xs font-black opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 whitespace-nowrap shadow-xl">
                                                        Quiz Assessment {i + 1}: {val}%
                                                    </div>
                                                </div>
                                                <div className="mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">W{i + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Assessment Breakdown Section */}
                            <motion.div
                                initial={isBatchExporting ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="rounded-[4rem] p-12 border-none bg-white shadow-2xl overflow-hidden relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                            <Star className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Assessment Breakdown</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {testResults.length > 0 ? (
                                            testResults.map((r, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-gray-100/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm text-xs font-black text-emerald-600">
                                                            {i + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-emerald-950 uppercase tracking-wide text-xs">
                                                                {r.submissionName || `Assessment Segment ${i + 1}`}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                {new Date(r.completedAt || Date.now()).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-emerald-600 tracking-tighter">{Math.round(((r.score || 0) / (r.total || 1)) * 100)}%</p>
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Score Mastery</p>
                                                        </div>
                                                        <Badge className={cn("px-3 py-1 rounded-full font-black text-[10px]", getGrade(((r.score || 0) / (r.total || 1)) * 100).bg, getGrade(((r.score || 0) / (r.total || 1)) * 100).color)}>
                                                            {getGrade(((r.score || 0) / (r.total || 1)) * 100).label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center bg-gray-50/30 rounded-[3rem] border border-dashed border-gray-200">
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">No official assessments recorded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Sidebar Info & Motivation */}
                        <div className="space-y-8">
                            {/* Admin: Student Selector */}
                            {isAdmin && (
                                <Card className="hidden-on-export rounded-[3rem] p-8 border-none bg-white shadow-2xl overflow-hidden relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-indigo-950 tracking-tight">{t.studentList}</h3>
                                    </div>

                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Find student..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="w-full h-11 pl-10 pr-4 rounded-xl border-emerald-100 bg-emerald-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedUserId(null)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                                                !selectedUserId ? "bg-emerald-600 text-white shadow-lg" : "hover:bg-emerald-50 text-emerald-950"
                                            )}
                                        >
                                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                                <AvatarFallback className={cn("text-xs font-black", !selectedUserId ? "text-emerald-600" : "bg-emerald-600 text-white")}>ME</AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <p className="font-black text-sm">My Own Report</p>
                                                <p className={cn("text-[10px] font-bold uppercase tracking-widest", !selectedUserId ? "text-emerald-100" : "text-emerald-600")}>Personal View</p>
                                            </div>
                                        </button>

                                        {activeStudents.map((s: any) => (
                                            <div key={s.id} className="group relative">
                                                <button
                                                    onClick={() => setSelectedUserId(s.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 pr-12",
                                                        selectedUserId === s.id ? "bg-indigo-600 text-white shadow-xl" : "hover:bg-indigo-50 text-emerald-950"
                                                    )}
                                                >
                                                    <Avatar className="h-10 w-10 border-2 border-white/20">
                                                        <AvatarFallback className={cn("text-xs font-black", selectedUserId === s.id ? "text-indigo-600" : "bg-indigo-600 text-white")}>
                                                            {s.firstName?.[0]}{s.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-left">
                                                        <p className="font-black text-sm">{s.firstName} {s.lastName}</p>
                                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedUserId === s.id ? "text-indigo-100" : "text-muted-foreground")}>Class A</p>
                                                    </div>
                                                </button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={downloading}
                                                    className={cn(
                                                        "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all",
                                                        selectedUserId === s.id ? "text-white hover:bg-white/20" : "text-emerald-600 hover:bg-emerald-100"
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(s.id);
                                                    }}
                                                >
                                                    {downloading && selectedUserId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                                <Card className="rounded-[3rem] border-none shadow-2xl bg-indigo-900 text-white overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-indigo-200 uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            Spiritual Milestones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-6">
                                        <p className="text-2xl font-black leading-tight italic">
                                            "Every effort in seeking knowledge is a step closer to Paradise."
                                        </p>
                                        <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Sparkles className="h-6 w-6 text-amber-400" />
                                            </div>
                                            <p className="text-xs font-bold text-indigo-100/60 leading-relaxed uppercase tracking-widest">
                                                Your consistency in prayer and study is reaching new peaks.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <Card className="rounded-[3rem] border-emerald-500/5 bg-emerald-50/30 backdrop-blur-sm p-10 text-center space-y-6">
                                <div className="mx-auto w-24 h-24 relative">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-25" />
                                    <div className="relative w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                                        <Award className="h-12 w-12" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Top Ranker</h3>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Class A - Leaderboard</p>
                                </div>
                                <Button variant="ghost" className="hidden-on-export w-full h-14 rounded-2xl border-emerald-100 bg-white text-emerald-700 font-black text-xs gap-3 uppercase tracking-widest">
                                    View Leaderboard <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Card>

                            {/* Official Footer for PDF - Hidden on Web */}
                            <div className="hidden print-only mt-20 pt-10 border-t-2 border-dashed border-emerald-100">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-6">
                                        <div className="w-32 h-1 bg-emerald-950" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Registrar Signature</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <p className="text-xs font-bold text-emerald-950">Issued on: {new Date().toLocaleDateString()}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Verify at: www.saut-ul-quran.com</p>
                                    </div>
                                </div>
                                <div className="mt-10 text-center">
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-[0.5em] font-medium italic">
                                        End of Official Academic Progress Report
                                    </p>
                                </div>
                            </div>

                            <div className="relative h-64 opacity-10 pointer-events-none mt-10">
                                <div className="absolute bottom-0 left-0 right-0 h-full bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url(${mosqueSilhouette})` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
