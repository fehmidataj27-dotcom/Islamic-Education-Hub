import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Activity,
    CheckCircle2,
    Trophy,
    Flame,
    Loader2,
    Calendar,
    Star,
    Moon,
    Sun,
    Clock,
    Check
} from "lucide-react";
import { useDailyStats, useUpdateDailyStats } from "@/hooks/use-resources";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CourseHero from "@/components/CourseHero";
import namazHero from "@/assets/images/namaz_hero.png";
import islamicPattern from "@/assets/images/islamic_pattern_hero.png";
import mosqueSilhouette from "@/assets/images/mosque_silhouette.png";

const PRAYERS = [
    { id: "fajr", name: { en: "Fajr", ur: "فجر" }, time: "5:00 AM", icon: <Sun className="h-4 w-4" />, color: "from-blue-400 to-indigo-500" },
    { id: "dhuhr", name: { en: "Dhuhr", ur: "ظہر" }, time: "1:30 PM", icon: <Sun className="h-4 w-4" />, color: "from-amber-400 to-orange-500" },
    { id: "asr", name: { en: "Asr", ur: "عصر" }, time: "5:00 PM", icon: <Sun className="h-4 w-4" />, color: "from-orange-400 to-rose-500" },
    { id: "maghrib", name: { en: "Maghrib", ur: "مغرب" }, time: "7:15 PM", icon: <Moon className="h-4 w-4" />, color: "from-indigo-400 to-purple-600" },
    { id: "isha", name: { en: "Isha", ur: "عشاء" }, time: "8:45 PM", icon: <Moon className="h-4 w-4" />, color: "from-purple-500 to-slate-800" },
];

export default function SalaahTracker() {
    const { lang } = useTheme();
    const { data: stats, isLoading } = useDailyStats();
    const updateStats = useUpdateDailyStats();

    const completed = (stats?.salaah as Record<string, boolean>) || {};

    const t = {
        title: lang === 'en' ? 'Salaah Journal' : 'نماز ڈائری',
        subtitle: lang === 'en' ? 'Cultivate consistency in your daily communion' : 'اپنی روزانہ کی نمازوں میں مستقل مزاجی پیدا کریں',
        streak: lang === 'en' ? 'Spirituality Streak' : 'روحانی اسٹرک',
        motivation: lang === 'en' ? 'The most beloved deeds to Allah are the most consistent ones.' : 'اللہ کو سب سے زیادہ وہ عمل پسند ہیں جو مستقل ہوں۔',
        todayProgress: lang === 'en' ? 'Daily Goal Progress' : 'آج کی پیشرفت',
        wisdomTitle: lang === 'en' ? 'Prophetic Wisdom' : 'حکمتِ نبوی',
        days: lang === 'en' ? 'Days' : 'دن',
        completedAll: lang === 'en' ? 'All prayers completed! Masha Allah!' : 'تمام نمازیں مکمل! ماشاء اللہ!',
    };

    const handleToggle = (id: string) => {
        const newSalaah = {
            ...completed,
            [id]: !completed[id]
        };
        updateStats.mutate({ salaah: newSalaah });
    };

    const completedCount = useMemo(() => PRAYERS.filter(p => completed[p.id]).length, [completed]);
    const progress = (completedCount / 5) * 100;
    const streak = stats?.salaahStreak || 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-6">
                <div className="relative w-16 h-16">
                    <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-emerald-600 opacity-20" />
                    <Activity className="absolute inset-0 m-auto h-8 w-8 text-emerald-600 animate-pulse" />
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Gathering your spiritual records...</p>
            </div>
        );
    }

    const todayDateStr = new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="relative space-y-8 pb-20 overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-x-0 -top-40 h-[600px] z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />

            <CourseHero
                title={t.title}
                subtitle={t.subtitle}
                badgeText={lang === 'en' ? 'Daily Worship' : 'روزانہ عبادت'}
                color="emerald"
                illustration={namazHero}
            >
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Card className="bg-white/80 backdrop-blur-md border-emerald-500/20 shadow-xl rounded-[2rem] p-6 flex flex-col items-center justify-center min-w-[200px]">
                        <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-emerald-100"
                                />
                                <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={251.2}
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                                    className="text-emerald-600"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-emerald-900">{completedCount}/5</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t.todayProgress}</span>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-md border-emerald-500/20 shadow-xl rounded-[2rem] p-6 flex flex-col items-center justify-center min-w-[180px]">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 mb-3">
                            <Flame className="h-8 w-8 text-white animate-pulse" />
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-orange-600">{streak} {t.days}</div>
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{t.streak}</span>
                        </div>
                    </Card>
                </div>
            </CourseHero>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto relative z-10">
                {/* Main Prayer List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-xl font-bold text-emerald-950">{todayDateStr}</h2>
                        </div>
                        {progress === 100 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {t.completedAll}
                            </motion.div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {PRAYERS.map((prayer, idx) => (
                                <motion.div
                                    key={prayer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div
                                        onClick={() => handleToggle(prayer.id)}
                                        className={cn(
                                            "group relative flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                                            completed[prayer.id]
                                                ? "bg-white border-emerald-500 shadow-xl shadow-emerald-100/50"
                                                : "bg-white/50 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-white shadow-sm"
                                        )}
                                    >
                                        {/* Background Glow */}
                                        {completed[prayer.id] && (
                                            <div className={cn("absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-20 bg-gradient-to-br", prayer.color)} />
                                        )}

                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                completed[prayer.id]
                                                    ? `bg-gradient-to-br ${prayer.color} text-white shadow-lg`
                                                    : "bg-emerald-50 text-emerald-400 group-hover:bg-emerald-100 group-hover:scale-110"
                                            )}>
                                                {completed[prayer.id] ? <Check className="h-6 w-6 stroke-[3px]" /> : prayer.icon}
                                            </div>

                                            <div>
                                                <h3 className={cn(
                                                    "text-2xl font-black tracking-tight transition-colors",
                                                    completed[prayer.id] ? "text-emerald-900" : "text-emerald-700/60",
                                                    lang === 'ur' && "font-urdu pr-2"
                                                )}>
                                                    {prayer.name[lang]}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/60">
                                                    <Clock className="h-3 w-3" />
                                                    {prayer.time}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <Checkbox
                                                id={prayer.id}
                                                checked={!!completed[prayer.id]}
                                                onCheckedChange={() => handleToggle(prayer.id)}
                                                className={cn(
                                                    "h-8 w-8 rounded-xl border-2 transition-all duration-500",
                                                    completed[prayer.id]
                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                        : "border-emerald-200"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-100 overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-3 text-indigo-200 uppercase tracking-widest text-xs font-black">
                                    <Star className="h-4 w-4 fill-indigo-400 text-indigo-400" />
                                    {t.wisdomTitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className={cn(
                                    "text-xl font-medium leading-relaxed italic opacity-90",
                                    lang === 'ur' && "font-urdu text-right"
                                )}>
                                    "{t.motivation}"
                                </p>
                                <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                        <Trophy className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <p className="text-sm font-bold text-indigo-100/70">
                                        Consistency is the bridge to mastery.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <Card className="rounded-[2.5rem] border-emerald-500/10 bg-emerald-50/50 backdrop-blur-sm p-8 text-center space-y-4">
                        <div className="mx-auto w-20 h-20 relative">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-25" />
                            <div className="relative w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <Activity className="h-10 w-10" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-emerald-900">Spiritual Growth</h3>
                            <p className="text-sm text-muted-foreground">Every marked prayer is a step towards spiritual excellence.</p>
                        </div>
                    </Card>

                    <div className="relative h-64 opacity-10 pointer-events-none mt-10">
                        <div className="absolute bottom-0 left-0 right-0 h-full bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url(${mosqueSilhouette})` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
