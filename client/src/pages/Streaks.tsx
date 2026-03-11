import { useTheme } from "@/hooks/use-theme";
import { streakData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar as CalendarIcon, Lock } from "lucide-react";

export default function Streaks() {
    const { lang } = useTheme();

    const t = {
        title: lang === 'en' ? 'Daily Streaks' : 'روزانہ اسٹریکس',
        current: lang === 'en' ? 'Current Streak' : 'موجودہ اسٹریک',
        longest: lang === 'en' ? 'Longest Streak' : 'طویل ترین اسٹریک',
        activity: lang === 'en' ? 'Weekly Activity' : 'ہفتہ وار سرگرمی',
        rewards: lang === 'en' ? 'Unlock Rewards' : 'انعامات کھولیں',
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Flame className="h-10 w-10 text-orange-500 animate-pulse" />
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                    <CardHeader>
                        <CardTitle className="text-orange-600 dark:text-orange-400">{t.current}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-6xl font-bold text-orange-500 mb-2">
                            {streakData.currentStreak} <span className="text-xl text-muted-foreground font-normal">days</span>
                        </div>
                        <p className="text-sm text-muted-foreground">You're on fire! Keep it up!</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t.longest}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-6xl font-bold text-muted-foreground mb-2">
                            {streakData.longestStreak} <span className="text-xl font-normal">days</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Personal Best</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {t.activity}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center max-w-lg mx-auto py-8">
                        {streakData.activity.map((day: any, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                <div
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${day.status === 'complete'
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                        : day.status === 'today'
                                            ? 'bg-orange-500 text-white ring-4 ring-orange-200 animate-pulse'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {day.status === 'complete' ? '✓' : ''}
                                </div>
                                <span className="text-xs font-medium">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{t.rewards}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-muted/30 opacity-60">
                        <div className="bg-muted p-3 rounded-full">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold">30 Day Badge</h3>
                            <p className="text-xs text-muted-foreground">Reach 30 days Streak</p>
                        </div>
                    </div>
                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-muted/30 opacity-60">
                        <div className="bg-muted p-3 rounded-full">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-bold">Premium Theme</h3>
                            <p className="text-xs text-muted-foreground">Reach 50 days Streak</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
