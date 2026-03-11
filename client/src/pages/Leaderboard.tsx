import { useTheme } from "@/hooks/use-theme";
import { useLeaderboard } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
    const { lang } = useTheme();
    const { data: leaderboard, isLoading } = useLeaderboard();

    const t = {
        title: lang === 'en' ? 'Leaderboard' : 'لیڈر بورڈ',
        rank: lang === 'en' ? 'Rank' : 'رینک',
        name: lang === 'en' ? 'Student' : 'طالب علم',
        points: lang === 'en' ? 'Points' : 'پوائنٹس',
        class: lang === 'en' ? 'Class' : 'کلاس',
        loading: lang === 'en' ? 'Calculating rankings...' : 'درجہ بندی کا حساب لگایا جا رہا ہے...',
        empty: lang === 'en' ? 'No students ranked yet.' : 'ابھی تک کوئی طالب علم رینک نہیں ہوا۔',
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">{t.loading}</p>
            </div>
        );
    }

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="text-center p-20 space-y-4">
                <Trophy className="h-16 w-16 text-muted mx-auto" />
                <p className="text-xl font-medium text-muted-foreground">{t.empty}</p>
            </div>
        );
    }

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Crown className="h-8 w-8 text-yellow-500" />
                    {t.title}
                </h1>
                <Select defaultValue="class1">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="class1">Class 1</SelectItem>
                        <SelectItem value="class2">Class 2</SelectItem>
                        <SelectItem value="hifz">Hifz Class</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                {/* 2nd Place */}
                {top3[1] ? (
                    <Card className="order-2 md:order-1 h-[280px] flex flex-col items-center justify-end pb-8 border-slate-300 relative shadow-lg">
                        <div className="absolute top-4 left-4 font-bold text-slate-400 text-xl">#2</div>
                        <Avatar className="h-24 w-24 border-4 border-slate-300 mb-4">
                            <AvatarFallback className="text-2xl bg-slate-100">{top3[1].avatar}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg text-center px-2">{top3[1].name}</h3>
                        <Badge variant="secondary" className="mt-2">{top3[1].points} pts</Badge>
                    </Card>
                ) : (
                    <div className="order-2 md:order-1 h-[280px]" />
                )}

                {/* 1st Place */}
                {top3[0] ? (
                    <Card className="order-1 md:order-2 h-[320px] flex flex-col items-center justify-end pb-8 border-yellow-400 bg-yellow-50/20 relative shadow-xl z-10 md:-mt-8">
                        <div className="absolute -top-6">
                            <Crown className="h-12 w-12 text-yellow-500 drop-shadow-md" fill="currentColor" />
                        </div>
                        <Avatar className="h-32 w-32 border-4 border-yellow-400 mb-4 ring-4 ring-yellow-100">
                            <AvatarFallback className="text-4xl bg-yellow-100">{top3[0].avatar}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-xl text-center px-2">{top3[0].name}</h3>
                        <Badge className="mt-2 bg-yellow-500">{top3[0].points} pts</Badge>
                    </Card>
                ) : (
                    <div className="order-1 md:order-2 h-[320px]" />
                )}

                {/* 3rd Place */}
                {top3[2] ? (
                    <Card className="order-3 h-[260px] flex flex-col items-center justify-end pb-8 border-amber-600 relative shadow-lg">
                        <div className="absolute top-4 right-4 font-bold text-amber-700 text-xl">#3</div>
                        <Avatar className="h-20 w-20 border-4 border-amber-600 mb-4">
                            <AvatarFallback className="text-2xl bg-amber-100">{top3[2].avatar}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg text-center px-2">{top3[2].name}</h3>
                        <Badge variant="outline" className="mt-2 border-amber-600 text-amber-900">{top3[2].points} pts</Badge>
                    </Card>
                ) : (
                    <div className="order-3 h-[260px]" />
                )}
            </div>

            {/* Rest of the List */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">{t.rank}</TableHead>
                                <TableHead>{t.name}</TableHead>
                                <TableHead className="text-right">{t.points}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rest.map((user) => (
                                <TableRow key={user.rank}>
                                    <TableCell className="font-medium text-muted-foreground">#{user.rank}</TableCell>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{user.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
