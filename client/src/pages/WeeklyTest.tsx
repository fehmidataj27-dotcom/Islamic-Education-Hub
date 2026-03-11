import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockQuestions = [
    {
        id: 1,
        question: { en: "Which surah is known as the heart of Quran?", ur: "قرآن کا دل کس سورت کو کہا جاتا ہے؟" },
        options: [
            { id: 'a', text: { en: "Surah Al-Fatiha", ur: "سورہ فاتحہ" } },
            { id: 'b', text: { en: "Surah Yaseen", ur: "سورہ یاسین" } },
            { id: 'c', text: { en: "Surah Al-Imran", ur: "سورہ آل عمران" } },
            { id: 'd', text: { en: "Surah Al-Baqarah", ur: "سورہ بقرہ" } },
        ],
        correct: 'b'
    },
    {
        id: 2,
        question: { en: "How many pillars of Islam are there?", ur: "اسلام کے کتنے ارکان ہیں؟" },
        options: [
            { id: 'a', text: { en: "Three", ur: "تین" } },
            { id: 'b', text: { en: "Five", ur: "پانچ" } },
            { id: 'c', text: { en: "Six", ur: "چھ" } },
            { id: 'd', text: { en: "Four", ur: "چار" } },
        ],
        correct: 'b'
    }
];

export default function WeeklyTest() {
    const { lang } = useTheme();
    const [started, setStarted] = useState(false);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [finished, setFinished] = useState(false);

    const t = {
        title: lang === 'en' ? 'Weekly Test' : 'ہفتہ وار ٹیسٹ',
        start: lang === 'en' ? 'Start Test' : 'ٹیسٹ شروع کریں',
        submit: lang === 'en' ? 'Submit' : 'جمع کروائیں',
        next: lang === 'en' ? 'Next' : 'اگلا',
        result: lang === 'en' ? 'Test Result' : 'نیچہ',
        score: lang === 'en' ? 'Your Score' : 'آپ کا اسکور',
        time: lang === 'en' ? 'Time Remaining' : 'باقی وقت',
        instructions: lang === 'en' ? 'Instructions' : 'ہدایات',
        instructionText: lang === 'en' ? 'Please complete all questions within the time limit. Do not refresh.' : 'برائے مہربانی دیئے گئے وقت میں تمام سوالات مکمل کریں۔ ریفریش نہ کریں۔',
    };

    useEffect(() => {
        if (started && !finished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && started && !finished) {
            setFinished(true);
        }
    }, [started, finished, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStart = () => {
        setStarted(true);
    };

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [mockQuestions[currentQIndex].id]: value }));
    };

    const handleNext = () => {
        if (currentQIndex < mockQuestions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            setFinished(true);
        }
    };

    const calculateScore = () => {
        let score = 0;
        mockQuestions.forEach(q => {
            if (answers[q.id] === q.correct) score++;
        });
        return (score / mockQuestions.length) * 100;
    };

    if (finished) {
        const score = calculateScore();
        return (
            <div className="max-w-md mx-auto py-12">
                <Card>
                    <CardHeader className="text-center">
                        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <CardTitle>{t.result}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="text-4xl font-bold text-primary">{score}%</div>
                        <p className="text-muted-foreground">{t.score}</p>
                        <Progress value={score} className="h-4" />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => window.location.reload()}>Retake Test</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-xl mx-auto py-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t.title}</CardTitle>
                        <CardDescription>Topic: General Islamic Knowledge</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t.instructions}</AlertTitle>
                            <AlertDescription>{t.instructionText}</AlertDescription>
                        </Alert>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            <span>5 Minutes Duration</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full" onClick={handleStart}>{t.start}</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQ = mockQuestions[currentQIndex];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">{t.title}</h1>
                <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="text-lg font-mono">
                    {formatTime(timeLeft)}
                </Badge>
            </div>

            <Progress value={(currentQIndex / mockQuestions.length) * 100} className="h-2" />

            <Card>
                <CardHeader>
                    <CardTitle className="leading-relaxed">
                        <span className="text-muted-foreground mr-2">Q{currentQIndex + 1}.</span>
                        {currentQ.question[lang]}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        onValueChange={handleAnswer}
                        value={answers[currentQ.id]}
                        className="space-y-4"
                    >
                        {currentQ.options.map((opt) => (
                            <div key={opt.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} />
                                <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-medium">
                                    {opt.text[lang]}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleNext}>
                        {currentQIndex === mockQuestions.length - 1 ? t.submit : t.next}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
