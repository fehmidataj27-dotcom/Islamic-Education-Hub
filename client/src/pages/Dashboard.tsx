import { useAuth } from "@/hooks/use-auth";
import { useDailyStats, useLiveClasses, useUpdateDailyStats } from "@/hooks/use-resources";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, BookOpen, Clock, PlayCircle, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { lang } = useTheme();
  const { data: stats } = useDailyStats();
  const { data: classes } = useLiveClasses();
  const updateStats = useUpdateDailyStats();

  const handleAttendance = () => {
    updateStats.mutate({ attendance: true });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {lang === 'en' ? `Welcome back, ${user?.firstName}!` : `خوش آمدید، ${user?.firstName}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === 'en' ? "Let's continue your learning journey." : "آئیے اپنا سیکھنے کا سفر جاری رکھیں۔"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-full border border-secondary/20">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), "EEEE, MMMM do, yyyy")}</span>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Streak Card */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {lang === 'en' ? 'Salaah Streak' : 'نماز کا تسلسل'}
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.salaahStreak || 0} Days</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'en' ? 'Keep it up!' : 'جاری رکھیں!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hifz Progress */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {lang === 'en' ? 'Hifz Progress' : 'حفظ کی پیشرفت'}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.hifzProgress || 0} Ayahs</div>
              <Progress value={(stats?.hifzProgress || 0) % 100} className="h-1.5 mt-3 bg-emerald-200 dark:bg-emerald-900" indicatorClassName="bg-emerald-500" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Score */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {lang === 'en' ? 'Quiz Score' : 'کوئز اسکور'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.quizScore || 0} Points</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'en' ? 'Top 10% of students' : 'طلباء کے ٹاپ 10٪ میں'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance */}
        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {lang === 'en' ? 'Attendance' : 'حاضری'}
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {stats?.attendance ? (
                <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
                  <CheckCircle className="w-5 h-5" />
                  {lang === 'en' ? 'Marked Present' : 'حاضری لگ گئی'}
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleAttendance}
                  disabled={updateStats.isPending}
                  className="w-full mt-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
                >
                  {updateStats.isPending ? 'Marking...' : (lang === 'en' ? 'Mark Present' : 'حاضری لگائیں')}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Classes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{lang === 'en' ? 'Upcoming Live Classes' : 'آنے والی لائیو کلاسز'}</h2>
            <Button variant="link" className="text-primary">{lang === 'en' ? 'View Schedule' : 'شیڈول دیکھیں'}</Button>
          </div>

          <div className="space-y-4">
            {classes?.length ? classes.map((cls) => (
              <div key={cls.id} className="group relative bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cls.title}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <span>{format(new Date(cls.startTime), "h:mm a")}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span>{cls.instructor}</span>
                  </p>
                </div>
                {cls.isLive && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <Button variant={cls.isLive ? "default" : "secondary"} className={cls.isLive ? "bg-red-500 hover:bg-red-600" : ""}>
                  {cls.isLive ? (lang === 'en' ? 'Join Now' : 'شامل ہوں') : (lang === 'en' ? 'Remind Me' : 'یاد دلائیں')}
                </Button>
              </div>
            )) : (
              <div className="text-center py-12 bg-muted/50 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">{lang === 'en' ? 'No upcoming classes scheduled.' : 'کوئی کلاس شیڈول نہیں ہے۔'}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions / Featured */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-bold">{lang === 'en' ? 'Continue Learning' : 'سیکھنا جاری رکھیں'}</h2>
          
          <Card className="overflow-hidden border-none shadow-xl relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&auto=format&fit=crop" 
              alt="Quran" 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <h3 className="font-bold text-lg mb-1">{lang === 'en' ? 'Tajweed Course' : 'تجوید کورس'}</h3>
              <p className="text-sm text-white/80 mb-3">{lang === 'en' ? 'Continue from Lesson 4' : 'سبق 4 سے جاری رکھیں'}</p>
              <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 border-none">
                {lang === 'en' ? 'Resume' : 'شروع کریں'}
              </Button>
            </div>
          </Card>

          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2 text-secondary-foreground">
                {lang === 'en' ? 'Daily Hadith' : 'آج کی حدیث'}
              </h3>
              <p className="text-sm text-muted-foreground italic mb-4">
                "The best among you is the one who learns the Quran and teaches it."
              </p>
              <div className="text-xs font-medium text-secondary-foreground/80 text-right">
                - Sahih Al-Bukhari
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
