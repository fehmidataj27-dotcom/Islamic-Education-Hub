import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    id: 1,
    question: "How many letters of Qalqalah are there?",
    options: ["4", "5", "6", "3"],
    correct: 1
  },
  {
    id: 2,
    question: "Which of these is a throat letter?",
    options: ["Ba", "Ta", "Ha", "Sa"],
    correct: 2
  }
];

export default function Quizzes() {
  const { lang } = useTheme();
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = start screen
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = () => setCurrentIdx(0);
  const nextQuestion = () => {
    if (selected === QUESTIONS[currentIdx].correct) setScore(s => s + 1);
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="w-full max-w-md text-center p-8 space-y-6">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-3xl font-bold">{lang === 'en' ? 'Quiz Completed!' : 'کوئز مکمل!'}</h2>
            <div className="text-5xl font-black text-primary">{score} / {QUESTIONS.length}</div>
            <p className="text-muted-foreground">{lang === 'en' ? 'Excellent effort! Keep practicing to master Tajweed.' : 'بہترین کوشش! تجوید میں مہارت حاصل کرنے کے لیے مشق جاری رکھیں۔'}</p>
            <Button className="w-full" onClick={() => window.location.reload()}>
              {lang === 'en' ? 'Try Again' : 'دوبارہ کوشش کریں'}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (currentIdx === -1) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{lang === 'en' ? 'Quizzes & Assessment' : 'کوئز اور تشخیص'}</h1>
          <p className="text-muted-foreground">{lang === 'en' ? 'Test your knowledge and track your progress.' : 'اپنے علم کی جانچ کریں اور اپنی پیشرفت کو ٹریک کریں۔'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover-elevate cursor-pointer border-primary/20" onClick={startQuiz}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tajweed Basics
                <Badge>Level 1</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Focuses on basic pronunciation and letter recognition.</p>
              <Button className="w-full">{lang === 'en' ? 'Start Quiz' : 'کوئز شروع کریں'}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Question {currentIdx + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((currentIdx + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <Progress value={((currentIdx + 1) / QUESTIONS.length) * 100} />
      </div>

      <Card className="p-8 space-y-8 shadow-xl border-primary/20">
        <h2 className="text-2xl font-bold leading-tight">{current.question}</h2>
        
        <RadioGroup value={selected?.toString()} onValueChange={v => setSelected(parseInt(v))} className="space-y-4">
          {current.options.map((opt, i) => (
            <div 
              key={i} 
              className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selected === i ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelected(i)}
            >
              <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
              <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-medium text-lg">{opt}</Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          className="w-full h-12 text-lg" 
          disabled={selected === null}
          onClick={nextQuestion}
        >
          {currentIdx === QUESTIONS.length - 1 ? (lang === 'en' ? 'Finish' : 'ختم کریں') : (lang === 'en' ? 'Next Question' : 'اگلا سوال')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
