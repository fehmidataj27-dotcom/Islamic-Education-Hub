import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievements, useUserAchievements, useLeaderboard, useDailyStats, useCheckAchievements } from "@/hooks/use-resources";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  Trophy, Star, BookOpen, Flame, Target, Award,
  Lock, CheckCircle2, Crown, Medal, Zap, TrendingUp,
  Users, Calendar
} from "lucide-react";

// Badge icon map
const ICON_MAP: Record<string, any> = {
  'star': Star,
  'book-open': BookOpen,
  'flame': Flame,
  'target': Target,
};

// Color themes per badge type
const BADGE_THEME: Record<string, { bg: string; glow: string; text: string; border: string }> = {
  'star': { bg: 'from-amber-400 to-yellow-600', glow: 'shadow-amber-400/40', text: 'text-amber-600', border: 'border-amber-300' },
  'book-open': { bg: 'from-emerald-400 to-green-600', glow: 'shadow-emerald-400/40', text: 'text-emerald-600', border: 'border-emerald-300' },
  'flame': { bg: 'from-orange-400 to-red-500', glow: 'shadow-orange-400/40', text: 'text-orange-600', border: 'border-orange-300' },
  'target': { bg: 'from-blue-400 to-indigo-600', glow: 'shadow-blue-400/40', text: 'text-blue-600', border: 'border-blue-300' },
};

const RANK_COLORS = [
  'from-yellow-400 to-amber-500',   // 1st
  'from-slate-300 to-slate-400',    // 2nd
  'from-amber-600 to-amber-700',    // 3rd
];

const RANK_ICONS = [Crown, Medal, Award];

export default function Achievements() {
  const { lang } = useTheme();
  const { data: allAchievements, isLoading: loadingAll } = useAchievements();
  const { data: userAchievements, isLoading: loadingUser } = useUserAchievements();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard();
  const { data: stats } = useDailyStats();
  const { mutate: checkAchievements } = useCheckAchievements();

  useEffect(() => {
    // Check achievements on page load
    // We can also pass flags here if we have them in local state/storage
    const duasListened = Number(localStorage.getItem("duas_listened_count") || "0");
    checkAchievements({ duasListened });
  }, []);

  const isLoading = loadingAll || loadingUser;

  const getIsUnlocked = (id: number) =>
    userAchievements?.some(ua => ua.achievementId === id) ?? false;

  const getUnlockedAt = (id: number) => {
    const ua = userAchievements?.find(ua => ua.achievementId === id);
    return ua?.unlockedAt ? new Date(ua.unlockedAt) : null;
  };

  const totalPoints = userAchievements?.reduce((sum, ua) => {
    const achievement = allAchievements?.find(a => a.id === ua.achievementId);
    return sum + (achievement?.points ?? 0);
  }, 0) ?? 0;

  const unlockedCount = userAchievements?.length ?? 0;
  const totalCount = allAchievements?.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Recent milestones sorted
  const recentMilestones = userAchievements
    ? [...userAchievements]
      .sort((a, b) => new Date(b.unlockedAt ?? 0).getTime() - new Date(a.unlockedAt ?? 0).getTime())
      .slice(0, 5)
    : [];

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'en' ? 'Achievements' : 'کامیابیاں'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === 'en'
              ? 'Earn badges by learning, reciting, and growing.'
              : 'سیکھ کر، پڑھ کر اور ترقی کر کے بیجز حاصل کریں۔'}
          </p>
        </div>

        {/* Points card */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                {lang === 'en' ? 'Total Points' : 'کل پوائنٹس'}
              </p>
              <p className="text-3xl font-black text-primary">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overall progress bar ──────────────────────────── */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">
                {lang === 'en' ? 'Achievement Progress' : 'کامیابی کی پیشرفت'}
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {unlockedCount} / {totalCount} {lang === 'en' ? 'Unlocked' : 'حاصل کیے'}
            </span>
          </div>
          <Progress value={progressPct} className="h-3 rounded-full" />
          <p className="text-xs text-muted-foreground mt-2">
            {progressPct}% {lang === 'en' ? 'complete' : 'مکمل'}
          </p>
        </CardContent>
      </Card>

      {/* ── Achievement Badges Grid ───────────────────────── */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {lang === 'en' ? 'Badges' : 'بیجز'}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)
            : allAchievements?.map((achievement, idx) => {
              const unlocked = getIsUnlocked(achievement.id);
              const unlockedAt = getUnlockedAt(achievement.id);
              const Icon = ICON_MAP[achievement.badgeUrl ?? ''] || Award;
              const theme = BADGE_THEME[achievement.badgeUrl ?? ''] || BADGE_THEME['target'];

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                >
                  <Card className={`h-full border-2 transition-all duration-300 overflow-hidden rounded-2xl
                      ${unlocked
                      ? `${theme.border} bg-gradient-to-b from-background to-card hover:shadow-xl hover:${theme.glow}`
                      : 'border-border/30 bg-muted/20 opacity-60 grayscale'
                    }`}>
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                      {/* Badge icon */}
                      <div className={`relative h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg
                          ${unlocked
                          ? `bg-gradient-to-br ${theme.bg} text-white`
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        <Icon className="h-8 w-8" />
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                            <Lock className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                        {unlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shadow"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Title & description */}
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>

                      {/* Points & status */}
                      <div className="w-full mt-auto pt-2 border-t border-border/40">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${unlocked ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {unlocked
                              ? (lang === 'en' ? '✓ Unlocked' : '✓ حاصل کیا')
                              : (lang === 'en' ? 'Locked' : 'بند')}
                          </span>
                          <Badge variant={unlocked ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                        {unlocked && unlockedAt && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(unlockedAt, { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* ── Bottom two-column section ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Milestones */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {lang === 'en' ? 'Recent Milestones' : 'حالیہ سنگ میل'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMilestones.length > 0 ? (
              recentMilestones.map((ua, i) => {
                const achievement = allAchievements?.find(a => a.id === ua.achievementId);
                if (!achievement) return null;
                const Icon = ICON_MAP[achievement.badgeUrl ?? ''] || Award;
                const theme = BADGE_THEME[achievement.badgeUrl ?? ''] || BADGE_THEME['target'];
                return (
                  <motion.div
                    key={ua.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center shrink-0 shadow`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ua.unlockedAt ? formatDistanceToNow(new Date(ua.unlockedAt), { addSuffix: true }) : ''}
                      </p>
                    </div>
                    <Badge className="text-xs bg-primary/10 text-primary border-0 shrink-0">
                      +{achievement.points} pts
                    </Badge>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-muted mx-auto flex items-center justify-center">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {lang === 'en'
                    ? 'No achievements yet. Start learning to earn badges!'
                    : 'ابھی تک کوئی کامیابی نہیں۔ بیجز حاصل کرنے کے لیے پڑھنا شروع کریں!'}
                </p>
                <div className="text-xs text-muted-foreground/70 space-y-1">
                  <p>📖 {lang === 'en' ? 'Mark Quran progress' : 'قرآن کی پیشرفت نشان کریں'}</p>
                  <p>🏆 {lang === 'en' ? 'Complete quizzes' : 'کوئز مکمل کریں'}</p>
                  <p>🤲 {lang === 'en' ? 'Listen to Duas' : 'دعائیں سنیں'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {lang === 'en' ? 'Leaderboard' : 'لیڈر بورڈ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingLeaderboard ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 8).map((entry: any, i: number) => {
                const RankIcon = i < 3 ? RANK_ICONS[i] : null;
                const isTop3 = i < 3;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                      ${isTop3
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-border/40 bg-card/40 hover:bg-card/80'
                      }`}
                  >
                    {/* Rank */}
                    <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center font-black text-sm
                      ${isTop3
                        ? `bg-gradient-to-br ${RANK_COLORS[i]} text-white shadow`
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {RankIcon ? <RankIcon className="h-4 w-4" /> : `#${i + 1}`}
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {entry.avatar || entry.name?.charAt(0) || '?'}
                      </div>
                      <p className="font-semibold text-sm truncate">{entry.name}</p>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${isTop3 ? 'text-primary' : 'text-foreground'}`}>
                        {entry.points}
                      </p>
                      <p className="text-[10px] text-muted-foreground">pts</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {lang === 'en' ? 'No leaderboard data yet.' : 'ابھی کوئی ڈیٹا نہیں۔'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── How to earn points guide ──────────────────────── */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {lang === 'en' ? 'How to Earn Points' : 'پوائنٹس کیسے حاصل کریں'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: lang === 'en' ? 'Mark Quran Progress' : 'قرآن پیشرفت', pts: '+10 pts', color: 'text-emerald-600 bg-emerald-100' },
              { icon: Target, label: lang === 'en' ? 'Score 100% on Quiz' : '100% کوئز', pts: '+30 pts', color: 'text-blue-600 bg-blue-100' },
              { icon: Flame, label: lang === 'en' ? 'Complete 3 Quizzes' : '3 کوئز مکمل', pts: '+40 pts', color: 'text-orange-600 bg-orange-100' },
              { icon: Star, label: lang === 'en' ? 'Memorize 10 Surahs' : '10 سورتیں حفظ', pts: '+50 pts', color: 'text-amber-600 bg-amber-100' },
            ].map(({ icon: Icon, label, pts, color }, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 bg-background/60 rounded-xl border border-border/40">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium leading-tight">{label}</p>
                <p className="text-xs font-black text-primary mt-1">{pts}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
