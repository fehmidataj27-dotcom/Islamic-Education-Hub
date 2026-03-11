import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  useDailyStats,
  useLiveClasses,
  useUpdateDailyStats,
  useDailyStatsHistory,
  useFeesByUser,
  useUserGroups,
  useDailyWisdom,
  useCreateWisdom,
  useAllWisdom
} from "@/hooks/use-resources";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle,
  Calendar,
  Users,
  Plus,
  DollarSign,
  AlertCircle,
  TrendingUp,
  History,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Layers,
  Star,
  Activity,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import islamicHeroV2 from "@/assets/images/islamic_hero_v2.png";
import managementWidgetBg from "@/assets/images/management_widget_bg.png";
import arabesqueDivider from "@/assets/images/arabesque_divider.png";
import patternHero from "@/assets/images/islamic_pattern_hero.png";
import patternDark from "@/assets/images/islamic_pattern_dark.png";
import prayerRug from "@/assets/images/namaz/prayer_rug.png";
import logoImg from "@/assets/images/logo.jpg";
import { WisdomManager } from "@/components/WisdomManager";

export default function Dashboard() {
  const { user } = useAuth();
  const { lang } = useTheme();
  const { data: stats } = useDailyStats();
  const { data: history } = useDailyStatsHistory();
  const { data: userFees } = useFeesByUser(user?.id || "");
  const { data: classes } = useLiveClasses();
  const { data: userGroups } = useUserGroups();
  const { data: dailyWisdom } = useDailyWisdom();
  const createWisdom = useCreateWisdom();
  const updateStats = useUpdateDailyStats();

  const handleAttendance = () => {
    updateStats.mutate({ attendance: true });
  };

  const getGreeting = () => {
    return lang === 'en' ? 'Assalam o Alaikum' : 'Ø§Ø³Ù„Ø§Ù… Ø¹Ù„ÛŒÚ©Ù…';
  };

  const t = {
    welcome: lang === 'en' ? `${getGreeting()}, ${user?.firstName}` : `${getGreeting()}ØŒ ${user?.firstName}`,
    subtitle: lang === 'en' ? "Welcome to the Academic Management Portal. Your journey to excellence continues." : "Ø§Ú©ÛŒÚˆÙ…Ú© Ù…ÛŒÙ†Ø¬Ù…Ù†Ù¹ Ù¾ÙˆØ±Ù¹Ù„ Ù…ÛŒÚº Ø®ÙˆØ´ Ø¢Ù…Ø¯ÛŒØ¯Û” Ø¢Ù¾ Ú©Ø§ Ø³ÙØ± Ø¬Ø§Ø±ÛŒ ÛÛ’Û”",
    attendance: lang === 'en' ? 'Daily Attendance' : 'ÛŒÙˆÙ…ÛŒÛ Ø­Ø§Ø¶Ø±ÛŒ',
    markPresent: lang === 'en' ? 'Check In' : 'Ø­Ø§Ø¶Ø±ÛŒ Ù„Ú¯Ø§Ø¦ÛŒÚº',
    present: lang === 'en' ? 'Validated' : 'Ø­Ø§Ø¶Ø±',
    hifz: lang === 'en' ? 'Quranic Progress' : 'Ù‚Ø±Ø¢Ù†ÛŒ Ù¾ÛŒØ´Ø±ÙØª',
    quizScore: lang === 'en' ? 'Scholarly Points' : 'Ø¹Ù„Ù…ÛŒ Ù¾ÙˆØ§Ø¦Ù†Ù¹Ø³',
    liveClasses: lang === 'en' ? 'Live Operations' : 'Ù„Ø§Ø¦ÛŒÙˆ Ø¢Ù¾Ø±ÛŒØ´Ù†Ø²',
    joinNow: lang === 'en' ? 'Enter Session' : 'Ú©Ù„Ø§Ø³ Ù…ÛŒÚº Ø´Ø§Ù…Ù„ ÛÙˆÚº',
    continueLearning: lang === 'en' ? 'Management Portals' : 'Ø§Ù†ØªØ¸Ø§Ù…ÛŒ Ù¾ÙˆØ±Ù¹Ù„',
    progressHistory: lang === 'en' ? 'Academic Ledger' : 'ØªØ¹Ù„ÛŒÙ…ÛŒ Ø±ÛŒÚ©Ø§Ø±Úˆ',
    viewSchedule: lang === 'en' ? 'Live Schedule' : 'Ø´ÛŒÚˆÙˆÙ„ Ø¯ÛŒÚ©Ú¾ÛŒÚº',
    noClasses: lang === 'en' ? 'Institutional Peace - No active sessions.' : 'Ø§Ø³ ÙˆÙ‚Øª Ú©ÙˆØ¦ÛŒ Ú©Ù„Ø§Ø³ Ù†ÛÛŒÚº ÛÛ’Û”',
    feeStatus: lang === 'en' ? 'Fee Registry' : 'ÙÛŒØ³ Ú©Ø§Ø±Úˆ',
    points: lang === 'en' ? 'XP' : 'Ù¾ÙˆØ§Ø¦Ù†Ù¹Ø³',
    ayahs: lang === 'en' ? 'Verses' : 'Ø¢ÛŒØ§Øª',
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemProgress = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 pb-10 overflow-hidden min-h-screen">

      {/* Cinematic Islamic Hero Section */}
      <section className="relative px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] min-h-[420px] flex items-center shadow-3xl group border-2 border-emerald-500/10"
        >
          <img src={islamicHeroV2} alt="Academy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/40 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent z-10" />

          <div className="relative z-20 px-12 md:px-20 py-10 w-full max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-12">
            <div className="space-y-10 max-w-2xl text-center xl:text-left">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="flex items-center justify-center xl:justify-start gap-4 mb-2">
                  <div className="w-16 h-12 rounded-xl bg-white shadow-xl overflow-hidden shrink-0 border-2 border-amber-500/20">
                    <img src={logoImg} alt="Saut-ul-Quran" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-8 bg-amber-500" />
                      <span className="brand-text-premium text-[11px] uppercase tracking-[0.3em]">Saut-ul-Quran Online Academy</span>
                    </div>
                    <span className="text-emerald-300/60 font-medium uppercase tracking-[0.4em] text-[8px] block">The Path of Sacred Knowledge</span>
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-emerald-100/90 leading-[1]">
                  {getGreeting()}, <span className="brand-text-premium">{user?.firstName}</span>
                </h1>
                <p className="text-emerald-100/60 text-lg font-medium leading-relaxed max-w-xl">{t.subtitle}</p>
              </motion.div>
              <div className="flex flex-wrap gap-6 justify-center xl:justify-start">
                <Button className="h-16 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-lg gap-4 shadow-2xl shadow-amber-500/20 border-b-4 border-amber-700 transition-all hover:-translate-y-1">
                  <Sparkles className="h-6 w-6" />{lang === 'en' ? "My Journey" : "Ù…ÛŒØ±Ø§ Ø³ÙØ±"}
                </Button>
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 backdrop-blur-md font-black text-lg gap-4 transition-all hover:border-amber-400/50">
                  <Activity className="h-6 w-6" />{lang === 'en' ? "Statistics" : "Ø§Ø¹Ø¯Ø§Ø¯ Ùˆ Ø´Ù…Ø§Ø±"}
                </Button>
              </div>
            </div>

            {/* Mihrab Date Card */}
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} className="xl:block hidden mihrab-shape p-1 bg-gradient-to-br from-amber-400/60 via-amber-400/10 to-transparent shadow-2xl">
              <div className="mihrab-shape p-10 w-[340px] text-center space-y-8 border-none relative overflow-hidden group bg-emerald-950/95 backdrop-blur-3xl border-2 border-amber-500/40">
                <img src={patternDark} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-emerald-950/50" />
                <div className="relative z-10 space-y-3">
                  <p className="text-amber-500 font-black uppercase tracking-[0.5em] text-[10px] drop-shadow-sm">{format(new Date(), "EEEE")}</p>
                  <div className="relative inline-block">
                    <h2 className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] relative z-10">{format(new Date(), "dd")}</h2>
                    <div className="absolute -inset-4 bg-amber-500/10 blur-2xl rounded-full" />
                  </div>
                  <p className="text-2xl font-black text-emerald-100 tracking-tight uppercase">{format(new Date(), "MMMM")}</p>
                  <div className="h-0.5 w-12 bg-amber-500/30 mx-auto" />
                  <p className="text-xs font-bold text-amber-500/40 tracking-[0.4em] uppercase">{format(new Date(), "yyyy")}</p>
                </div>
                <div className="pt-6 relative z-10 space-y-6">
                  <div className="px-4 py-3 bg-white/5 rounded-2xl border-l-4 border-amber-500/50 backdrop-blur-sm min-h-[100px] flex flex-col justify-center">
                    <p className={cn("text-emerald-100/90 italic font-medium text-sm leading-relaxed text-left", lang === 'ur' && "text-right font-urdu text-base")}>
                      {dailyWisdom?.content ? `"${dailyWisdom.content}"` : (lang === 'en' ? "Knowledge is the light that illuminates the path to the Creator." : "Ø¹Ù„Ù… ÙˆÛ Ù†ÙˆØ± ÛÛ’ Ø¬Ùˆ Ø®Ø§Ù„Ù‚ ØªÚ© Ù¾ÛÙ†Ú†Ù†Û’ Ú©Ø§ Ø±Ø§Ø³ØªÛ Ø±ÙˆØ´Ù† Ú©Ø±ØªØ§ ÛÛ’Û”")}
                    </p>
                    {dailyWisdom?.author && (
                      <p className={cn("text-amber-500/60 text-[10px] mt-2 font-bold uppercase tracking-wider", lang === 'ur' && "text-right")}>â€” {dailyWisdom.author}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 py-4 px-6 bg-emerald-900/40 rounded-3xl border border-emerald-500/20 shadow-inner group-hover:border-amber-500/30 transition-all duration-500">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0 opacity-40" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500 relative shadow-lg shadow-emerald-500/50" />
                    </div>
                    <span className="font-black text-[11px] tracking-[0.2em] uppercase text-emerald-400 group-hover:text-amber-400 transition-colors">Academy Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Main Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemProgress} className="group">
          <Card className="h-full rounded-2xl border border-amber-100 bg-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><BookOpen className="h-5 w-5" /></div>
              <div className="text-amber-600 font-bold text-[9px] tracking-widest bg-amber-50 px-2 py-0.5 rounded-full uppercase">Al-Quran</div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.hifz}</p>
                <div className="text-2xl font-bold text-gray-900">{stats?.hifzProgress || 0} <span className="text-xs text-amber-500/50 font-medium">Ayahs</span></div>
              </div>
              <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(stats?.hifzProgress || 0) % 100}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 tracking-widest uppercase">Verified Progress</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemProgress} className="group">
          <Card className="h-full rounded-2xl border border-amber-100 bg-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Trophy className="h-5 w-5" /></div>
              <div className="text-amber-600 font-bold text-[9px] tracking-widest bg-amber-50 px-2 py-0.5 rounded-full uppercase">Mastery</div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.quizScore}</p>
                <div className="text-2xl font-bold text-gray-900">{stats?.quizScore || 0} <span className="text-xs text-indigo-400 font-medium">XP</span></div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-indigo-900">Ranked #1</span>
                <ChevronRight className="h-3.5 w-3.5 text-indigo-300 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemProgress} className="group">
          <Card className="h-full rounded-2xl border border-amber-100 bg-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shadow-sm"><Clock className="h-5 w-5" /></div>
              <div className="text-amber-600 font-bold text-[9px] tracking-widest bg-amber-50 px-2 py-0.5 rounded-full uppercase">Registry</div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t.attendance}</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{stats?.attendance ? "100%" : "Absent"}</div>
                  {stats?.attendance && <div className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full">ON TRACK</div>}
                </div>
              </div>
              {!stats?.attendance ? (
                user?.role?.toLowerCase() === 'student' ? (
                  <div className="h-9 w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-600 font-bold text-xs rounded-xl border border-amber-100"><Clock className="h-3.5 w-3.5" /> Not Marked</div>
                ) : (
                  <Button size="sm" onClick={handleAttendance} disabled={updateStats.isPending} className="h-9 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs">
                    {updateStats.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.markPresent}
                  </Button>
                )
              ) : (
                <div className="h-9 w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl border border-emerald-100"><CheckCircle className="h-3.5 w-3.5" /> {t.present}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemProgress} className="group">
          <Link href={user?.role?.toLowerCase() === 'student' ? "/fees" : "/user-management"}>
            <Card className="h-full rounded-2xl border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative min-h-[130px]">
              <img src={managementWidgetBg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-emerald-950/30 z-10" />
              <CardContent className="relative z-20 h-full p-5 flex flex-col justify-end gap-2 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    {user?.role?.toLowerCase() === 'student' ? <DollarSign className="h-3.5 w-3.5 text-amber-500" /> : <Users className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <p className="text-amber-400/80 font-bold text-[9px] tracking-widest uppercase">{user?.role?.toLowerCase() === 'student' ? 'Fee Registry' : 'Control Panel'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold tracking-tight uppercase">System Console</h3>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-emerald-950 transition-all"><ArrowRight className="h-4 w-4" /></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      {/* Live Classes + Quick Access */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-emerald-950 tracking-tight">{t.liveClasses}</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Academic Stream</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 px-4 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-xs">{t.viewSchedule}</Button>
          </div>
          <div className="space-y-3">
            {classes?.filter((cls: any) => {
              if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') return true;
              if (cls.category === 'General') return true;
              return userGroups?.some((g: any) => g.name.toLowerCase().includes(cls.category?.toLowerCase()));
            }).length ? classes.filter((cls: any) => {
              if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') return true;
              if (cls.category === 'General') return true;
              return userGroups?.some((g: any) => g.name.toLowerCase().includes(cls.category?.toLowerCase()));
            }).map((cls, idx) => (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}
                className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-row items-center gap-4 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex flex-col items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                  <div className="text-sm font-bold leading-none">{format(new Date(cls.startTime), "h:mm")}</div>
                  <div className="text-[8px] font-bold uppercase opacity-60">{format(new Date(cls.startTime), "a")}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{cls.title}</h3>
                    {cls.isLive && <span className="shrink-0 px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase rounded-full border border-amber-500/30 animate-pulse">Live</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-gray-400 text-[9px] font-bold uppercase"><UserIcon className="h-2.5 w-2.5 text-emerald-500" />{cls.instructor}</span>
                    <span className="text-emerald-500 text-[9px] font-bold">Â· {cls.category}</span>
                  </div>
                </div>
                <Button size="sm" className={cn("h-8 px-3 rounded-xl font-bold text-xs shrink-0", cls.isLive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100")}>
                  {cls.isLive ? <PlayCircle className="h-3.5 w-3.5 mr-1" /> : <Clock className="h-3.5 w-3.5 mr-1 opacity-40" />}
                  {cls.isLive ? t.joinNow : 'Remind'}
                </Button>
              </motion.div>
            )) : (
              <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-emerald-50">
                <Sparkles className="h-8 w-8 text-emerald-200 mx-auto mb-2" />
                <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs">{t.noClasses}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-4">
          <div className="px-1">
            <h2 className="text-lg font-bold text-emerald-950 tracking-tight">{t.continueLearning}</h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Quick Access</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(() => {
              const subjectThemes = {
                hadees: { href: "/hadees-course", Icon: BookOpen, defaultTitle: lang === 'en' ? 'Hadees Insights' : 'Ø­Ø¯ÛŒØ« Ú©ÙˆØ±Ø³', pattern: patternDark, gradient: "from-amber-600 to-transparent", imgClass: "hue-rotate-15", iconColor: "text-amber-200" },
                tajweed: { href: "/tajweed-course", Icon: Layers, defaultTitle: lang === 'en' ? 'Tajweed Mastery' : 'ØªØ¬ÙˆÛŒØ¯ Ú©Ø§ Ù…ÛØ§Ø±Øª', pattern: patternHero, gradient: "from-indigo-600 to-transparent", imgClass: "hue-rotate-180", iconColor: "text-indigo-200" },
                namaz: { href: "/salah-course", Icon: Activity, defaultTitle: lang === 'en' ? 'Namaz Learning' : 'Ù†Ù…Ø§Ø² Ø³ÛŒÚ©Ú¾Ù†Û’', pattern: prayerRug, gradient: "from-emerald-600 to-transparent", imgClass: "", iconColor: "text-emerald-200" },
                tafseer: { href: "/tafseer-course", Icon: Sparkles, defaultTitle: lang === 'en' ? 'Tafseer Journey' : 'ØªÙØ³ÛŒØ± Ú©ÙˆØ±Ø³', pattern: patternHero, gradient: "from-rose-600 to-transparent", imgClass: "hue-rotate-90", iconColor: "text-rose-200" }
              };
              const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';
              if (isAdmin) {
                return Object.entries(subjectThemes).map(([key, theme]) => (
                  <Link key={key} href={theme.href}>
                    <Card className="overflow-hidden border border-gray-100 shadow-sm relative group cursor-pointer rounded-xl h-16 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 p-4 z-20 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <theme.Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 tracking-tight">{theme.defaultTitle}</h3>
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[8px] uppercase tracking-widest opacity-60">Open <ArrowRight className="h-2.5 w-2.5" /></div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ));
              }
              if (userGroups && userGroups.length > 0) {
                return userGroups.map((group: any) => {
                  const name = group.name.toLowerCase();
                  let theme: any = null;
                  if (name.includes('hadees')) theme = subjectThemes.hadees;
                  else if (name.includes('tajweed')) theme = subjectThemes.tajweed;
                  else if (name.includes('namaz') || name.includes('salah')) theme = subjectThemes.namaz;
                  else if (name.includes('tafseer')) theme = subjectThemes.tafseer;
                  if (!theme) return null;
                  return (
                    <Link key={group.id} href={theme.href}>
                      <Card className="overflow-hidden border-none shadow-xl relative group cursor-pointer rounded-[2.5rem] h-32 hover:translate-x-2 transition-all duration-500">
                        <div className={cn("absolute inset-0 bg-gradient-to-r z-10", theme.gradient)} />
                        <img src={theme.pattern} alt="" className={cn("absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-20", theme.imgClass)} />
                        <div className="absolute inset-y-0 left-0 p-8 z-20 flex items-center gap-6 text-white">
                          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <theme.Icon className={cn("h-8 w-8", theme.iconColor)} />
                          </div>
                          <div>
                            <h3 className="font-black text-xl tracking-tight">{group.name}</h3>
                            <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">Continue Journey <ArrowRight className="h-4 w-4" /></div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                });
              }
              return <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-emerald-900/10"><p className="text-emerald-950/40 font-black uppercase tracking-widest text-xs">No active enrollments found</p></div>;
            })()}
            {user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher' ? (
              <WisdomManager />
            ) : (
              <Card className="rounded-3xl bg-emerald-950 border-none shadow-xl p-8 relative overflow-hidden group min-h-[200px] flex flex-col justify-center">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 w-10 bg-amber-500/30" />
                    <h3 className="font-bold text-[10px] text-amber-500 uppercase tracking-[0.4em]">{lang === 'en' ? 'Voice of Wisdom' : 'Ø¨ØµÛŒØ±Øª Ø§ÙØ±ÙˆØ² Ú©Ù„Ø§Ù…'}</h3>
                  </div>
                  <p className={cn("text-xl font-bold text-white leading-relaxed italic", lang === 'ur' && "font-urdu text-right")}>
                    {dailyWisdom?.content ? `"${dailyWisdom.content}"` : (lang === 'en' ? '"Knowledge is the light that illuminates the path to the Creator."' : '"Ø¹Ù„Ù… ÙˆÛ Ù†ÙˆØ± ÛÛ’ Ø¬Ùˆ Ø®Ø§Ù„Ù‚ ØªÚ© Ù¾ÛÙ†Ú†Ù†Û’ Ú©Ø§ Ø±Ø§Ø³ØªÛ Ø±ÙˆØ´Ù† Ú©Ø±ØªØ§ ÛÛ’Û”"')}
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-white/10">
                    <span className={cn("text-xs font-black text-amber-500/80 uppercase tracking-widest", lang === 'ur' && "font-urdu text-lg")}>
                      â€” {dailyWisdom?.author || (lang === 'en' ? "IMAM GHAZALI" : "Ø§Ù…Ø§Ù… ØºØ²Ø§Ù„ÛŒ")}
                    </span>
                    <div className="flex gap-2">{[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />)}</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      {/* Academic Ledger */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="max-w-7xl mx-auto px-4">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
          <CardHeader className="p-5 pb-4 border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl shadow-sm"><History className="h-4 w-4 text-white" /></div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{t.progressHistory}</h2>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Historical Record</p>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{history?.filter(h => h.attendance).length || 0}</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Attendance</div>
                </div>
                <div className="w-px h-6 bg-gray-100" />
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{history?.reduce((acc, curr) => acc + (curr.quizScore || 0), 0) || 0}</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">XP</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-100">
                    <th className="px-6 py-4">{lang === 'en' ? 'Session Timeline' : 'ØªØ§Ø±ÛŒØ®'}</th>
                    <th className="px-4 py-4 text-center">{lang === 'en' ? 'Engagement' : 'Ø­Ø§Ø¶Ø±ÛŒ'}</th>
                    <th className="px-4 py-4 text-center">{lang === 'en' ? 'Mastery' : 'Ú©ÙˆØ¦Ø² Ø§Ø³Ú©ÙˆØ±'}</th>
                    <th className="px-4 py-4 text-center">{lang === 'en' ? 'Quranic Flow' : 'Ø­ÙØ¸'}</th>
                    <th className="px-6 py-4 text-right">{lang === 'en' ? 'Devotional Track' : 'Ù†Ù…Ø§Ø²'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history?.length ? history.slice(0, 7).map((h, i) => (
                    <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + (i * 0.05) }} className="group hover:bg-emerald-50/20 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">{format(new Date(h.date), "dd")}</div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{format(new Date(h.date), "MMMM yyyy")}</span>
                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(h.date), "EEEE")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {h.attendance ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 text-[9px] font-bold uppercase"><CheckCircle className="h-3 w-3" /> Present</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 text-[9px] font-bold uppercase"><AlertCircle className="h-3 w-3" /> Absent</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                          <Trophy className="h-3 w-3 text-indigo-400" /><span className="font-bold text-indigo-700">{h.quizScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-gray-900 text-sm">{h.hifzProgress}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Ayahs</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {Object.entries((h.salaah as any) || {}).map(([key, value]) => (
                            <div key={key} className={cn("w-2.5 h-2.5 rounded-full", value ? "bg-emerald-500 shadow-sm" : "bg-gray-100")} />
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <History className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Awaiting Academic Contributions</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}

