import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Flame, Target, BookOpen, CheckCircle2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const BADGES = [
  { id: 1, title: 'First Step', desc: 'Completed first lesson', points: 10, icon: Star, unlocked: true },
  { id: 2, title: 'Hafiz Junior', desc: 'Memorized 10 Surahs', points: 50, icon: BookOpen, unlocked: true },
  { id: 3, title: 'Salah Pro', desc: '30 day Salah streak', points: 100, icon: Flame, unlocked: false },
  { id: 4, title: 'Quiz Master', desc: 'Score 100% in 5 quizzes', points: 75, icon: Target, unlocked: false },
];

export default function Achievements() {
  const { lang } = useTheme();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{lang === 'en' ? 'Achievements' : 'کامیابیاں'}</h1>
          <p className="text-muted-foreground">{lang === 'en' ? 'Track your spiritual and academic milestones.' : 'اپنی روحانی اور تعلیمی کامیابیوں کو ٹریک کریں۔'}</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">{lang === 'en' ? 'Total Points' : 'کل پوائنٹس'}</p>
            <p className="text-2xl font-black">650</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BADGES.map((badge, idx) => (
          <motion.div 
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`h-full border-2 transition-all ${badge.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border grayscale opacity-60'}`}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center relative ${badge.unlocked ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  <badge.icon className="h-10 w-10" />
                  {!badge.unlocked && <Lock className="h-4 w-4 absolute -top-1 -right-1 bg-background rounded-full p-0.5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{badge.desc}</p>
                </div>
                <div className="pt-2 mt-auto w-full">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                    <span>{badge.points} pts</span>
                  </div>
                  <Progress value={badge.unlocked ? 100 : 0} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Recent Milestones' : 'حالیہ سنگ میل'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Completed Surah Al-Baqarah Lesson 12</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm font-bold text-primary">+20 pts</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Award className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{lang === 'en' ? 'Level 5 reached!' : 'لیول 5 مکمل!'}</h3>
              <p className="text-white/80 mt-2">You are in the top 5% of students this month. Keep it up!</p>
            </div>
            <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-white/90">
              {lang === 'en' ? 'Share Progress' : 'شیئر کریں'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
