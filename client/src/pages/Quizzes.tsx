import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  ArrowRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  Target,
  RotateCcw,
  Award,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizzes, useQuiz, useSubmitQuiz, useCreateQuiz, useCreateQuizQuestion, useCheckAchievements } from "@/hooks/use-resources";
import { useAuthContext } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuizSchema, type Quiz, type QuizQuestion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import islamicPattern from "@/assets/images/islamic_pattern_hero.png";
import mosqueSilhouette from "@/assets/images/mosque_silhouette.png";

const quizWithQuestionsSchema = insertQuizSchema.extend({
  questions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string().min(1, "Option is required")).min(2, "At least 2 options required"),
    correctAnswer: z.number().min(0)
  })).min(1, "At least one question is required")
});

export default function Quizzes() {
  const { lang } = useTheme();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { data: serverQuizzes, isLoading: loadingQuizzes } = useQuizzes();
  const createQuiz = useCreateQuiz();
  const addQuestion = useCreateQuizQuestion();

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const { data: quizData, isLoading: loadingQuiz } = useQuiz(selectedQuizId || 0);
  const submitQuiz = useSubmitQuiz(selectedQuizId || 0);
  const { mutate: checkAchievements } = useCheckAchievements();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';

  const form = useForm({
    resolver: zodResolver(quizWithQuestionsSchema),
    defaultValues: {
      title: "",
      category: "",
      questions: [{ question: "", options: ["", ""], correctAnswer: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const t = {
    title: lang === 'en' ? 'Knowledge Assessments' : 'علمی تشخیصی کوئز',
    subtitle: lang === 'en' ? 'Refine your understanding through interactive tests' : 'انٹرایکٹو ٹیسٹ کے ذریعے اپنی سمجھ کو نکھاریں',
    start: lang === 'en' ? 'Take Challenge' : 'چیلنج شروع کریں',
    retry: lang === 'en' ? 'Retake Quiz' : 'دوبارہ کوشش',
    back: lang === 'en' ? 'Knowledge Hub' : 'علمی مرکز',
    next: lang === 'en' ? 'Continue' : 'جاری رکھیں',
    submit: lang === 'en' ? 'Final Polish' : 'نتائج دیکھیں',
    correct: lang === 'en' ? 'Excellent! Masha Allah!' : 'ماشاء اللہ، بالکل درست!',
    incorrect: lang === 'en' ? 'Keep learning, you got this!' : 'سیکھتے رہیں، ان شاء اللہ بہتر ہوگا!',
    resultTitle: lang === 'en' ? 'Course Evaluation' : 'کورس کی تشخیص',
    stats: lang === 'en' ? 'Performance Summary' : 'کارکردگی کا خلاصہ',
    createTitle: lang === 'en' ? 'New Assessment' : 'نیا کوئز تیار کریں',
    addQuestion: lang === 'en' ? 'Add Mystery' : 'سوال شامل کریں',
    deleteConfirm: lang === 'en' ? "Are you sure you want to remove this question?" : "کیا آپ واقعی اس سوال کو حذف کرنا چاہتے ہیں؟",
  };

  const startQuiz = (id: number) => {
    setSelectedQuizId(id);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    if (selected === null || !quizData) return;
    setShowFeedback(true);
    if (selected === quizData.questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
      toast({
        title: lang === 'en' ? "Correct!" : "درست جواب!",
        description: lang === 'en' ? "Masha Allah, well done." : "ماشاء اللہ، بہت اچھے",
        duration: 1500
      });
    }
  };

  const nextQuestion = async () => {
    if (!quizData) return;
    if (currentIdx < quizData.questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      await submitQuiz.mutateAsync({ score });
      const currentQuizzes = Number(localStorage.getItem("quizzes_completed_count") || "0");
      const nextQuizzes = currentQuizzes + 1;
      localStorage.setItem("quizzes_completed_count", nextQuizzes.toString());
      checkAchievements({ quizCount: nextQuizzes });
      setShowResult(true);
    }
  };

  const resetAll = () => {
    setSelectedQuizId(null);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
  };

  const onAddQuiz = async (values: any) => {
    try {
      const quiz = await createQuiz.mutateAsync({
        title: values.title,
        category: values.category
      });

      for (const q of values.questions) {
        await addQuestion.mutateAsync({
          quizId: quiz.id,
          data: q
        });
      }

      toast({ title: "Success", description: "Quiz created successfully" });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create quiz" });
    }
  };

  // Result screen
  if (showResult && quizData) {
    const pct = Math.round((score / quizData.questions.length) * 100);
    return (
      <div className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
        {/* Confetti-like effect background would go here */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg px-4 relative z-10">
          <Card className="rounded-[3rem] border-primary/20 bg-white shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" />
            <CardContent className="p-12 text-center space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full animate-pulse" />
                <Trophy className="h-24 w-24 text-yellow-500 mx-auto animate-bounce relative z-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black text-emerald-950">{t.resultTitle}</h2>
                <Badge variant="secondary" className="px-6 py-1 rounded-full text-emerald-600 font-bold bg-emerald-50">
                  {quizData.quiz.title}
                </Badge>
              </div>

              <div className="py-10 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center gap-2">
                <div className="text-7xl font-black text-emerald-600 tracking-tighter">{pct}%</div>
                <div className="text-lg font-bold text-emerald-800/60 uppercase tracking-widest">{t.stats}</div>
                <p className="text-xl font-medium text-emerald-900 mt-4">{score} / {quizData.questions.length} Correct Answers</p>
              </div>

              <p className="text-lg text-muted-foreground italic px-4">
                {pct >= 80 ? t.correct : pct >= 60 ? t.incorrect : lang === 'en' ? 'Keep striving, perfection takes time!' : 'کوشش جاری رکھیں، کمال وقت مانگتا ہے!'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1 h-16 rounded-[1.5rem] text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl" onClick={() => startQuiz(quizData.quiz.id)}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  {t.retry}
                </Button>
                <Button variant="outline" className="flex-1 h-16 rounded-[1.5rem] text-lg font-bold border-emerald-100 text-emerald-700 hover:bg-emerald-50" onClick={resetAll}>
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  {t.back}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz selection screen
  if (!selectedQuizId) {
    return (
      <div className="relative min-h-screen pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />

        <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50/50 animate-pulse">
                  Learning Checkpoints
                </Badge>
                <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-700 to-indigo-800 bg-clip-text text-transparent mt-2">
                  {t.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">{t.subtitle}</p>
              </motion.div>
            </div>

            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl text-lg font-bold gap-3">
                    <Plus className="h-6 w-6" />
                    {t.createTitle}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-emerald-950">{t.createTitle}</DialogTitle>
                    <DialogDescription>Design a new interactive challenge for your students.</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddQuiz)} className="space-y-8 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-black text-emerald-800 uppercase tracking-widest">Assessment Name</FormLabel>
                              <FormControl><Input {...field} className="h-12 rounded-xl focus:ring-emerald-500" placeholder="e.g. Tajweed Basics" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-black text-emerald-800 uppercase tracking-widest">Discipline</FormLabel>
                              <FormControl><Input {...field} className="h-12 rounded-xl" placeholder="e.g. Quran" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4 border-emerald-100">
                          <Label className="text-lg font-black text-emerald-950">Curate Questions</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ question: "", options: ["", ""], correctAnswer: 0 })} className="rounded-xl border-emerald-200">
                            <Plus className="mr-2 h-4 w-4" /> {t.addQuestion}
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {fields.map((field, index) => (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={field.id}>
                              <Card className="p-6 rounded-3xl border-emerald-50/50 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                  <Badge variant="outline" className="px-4 py-1 rounded-full text-xs font-bold text-emerald-600 border-emerald-100">
                                    Question #{index + 1}
                                  </Badge>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="rounded-xl hover:bg-rose-50 text-rose-500">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <FormField
                                  control={form.control}
                                  name={`questions.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem className="mb-4">
                                      <FormControl><Input {...field} className="font-bold border-none bg-emerald-50/50 rounded-xl h-12" placeholder="State your question..." /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {field.options.map((_, optIdx) => (
                                    <FormField
                                      key={optIdx}
                                      control={form.control}
                                      name={`questions.${index}.options.${optIdx}`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className="flex gap-3 items-center p-2 rounded-xl bg-white border border-emerald-50 hover:border-emerald-200 transition-colors">
                                              <input
                                                type="radio"
                                                className="h-5 w-5 accent-emerald-600"
                                                checked={form.watch(`questions.${index}.correctAnswer`) === optIdx}
                                                onChange={() => form.setValue(`questions.${index}.correctAnswer`, optIdx)}
                                              />
                                              <Input {...field} className="border-none shadow-none focus-visible:ring-0 p-0 h-8" placeholder={`Candidate ${optIdx + 1}`} />
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                                <Button type="button" variant="ghost" size="sm" className="mt-4 text-emerald-600 font-bold text-xs" onClick={() => {
                                  const currentOptions = form.getValues(`questions.${index}.options`);
                                  form.setValue(`questions.${index}.options`, [...currentOptions, ""]);
                                }}>+ Extend Options</Button>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl text-xl font-black transition-all active:scale-[0.98]" disabled={createQuiz.isPending}>
                        {createQuiz.isPending ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : null}
                        {createQuiz.isPending ? "Publishing Assessment..." : "Publish Quiz Now"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {loadingQuizzes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/50 backdrop-blur-sm animate-pulse rounded-[2.5rem] border border-emerald-50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
              {serverQuizzes?.map((quiz, idx) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 50 }}
                >
                  <Card
                    className="group relative h-full flex flex-col rounded-[3rem] border-emerald-500/10 bg-white hover:bg-emerald-50/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    onClick={() => startQuiz(quiz.id)}
                  >
                    {/* Visual Accent */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-600 shadow-lg shadow-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Target className="h-7 w-7 text-white" />
                        </div>
                        <Badge variant="outline" className="px-4 py-1 rounded-full text-emerald-600 border-emerald-100 bg-emerald-50 text-[10px] font-black uppercase tracking-widest">
                          {quiz.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-black text-emerald-950 group-hover:text-emerald-700 transition-colors leading-tight">
                        {quiz.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between gap-6">
                      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground/60">
                        <Clock className="h-4 w-4" />
                        Approx. 10 mins
                      </div>

                      <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                        <span className="text-emerald-600 font-black text-sm uppercase tracking-widest">{t.start}</span>
                        <div className="w-10 h-10 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600 bg-white group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64 z-0 opacity-[0.05] pointer-events-none bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url(${mosqueSilhouette})` }} />
      </div>
    );
  }

  // Active quiz
  if (loadingQuiz || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center animate-pulse">
          <Sparkles className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-black text-emerald-900 leading-tight">Preparing Assessment...</h2>
          <p className="text-muted-foreground animate-pulse">Syncing spiritual curriculum</p>
        </div>
        <Progress value={45} className="w-64 h-2 bg-emerald-50 text-emerald-600" />
      </div>
    );
  }

  const current = quizData.questions[currentIdx];
  const isCorrect = selected === current.correctAnswer;
  const quizProgress = ((currentIdx + 1) / quizData.questions.length) * 100;

  return (
    <div className="relative min-h-screen pb-40 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-96 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />

      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-12 space-y-10">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-emerald-950 tracking-tight">{quizData.quiz.title}</h2>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Badge className="bg-emerald-600 rounded-full px-4 text-xs font-black uppercase tracking-widest">
                Part {currentIdx + 1}
              </Badge>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Steps: {quizData.questions.length}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="h-12 px-6 rounded-2xl text-emerald-600 hover:bg-emerald-50 font-black text-sm gap-3 group transition-all"
            onClick={resetAll}
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t.back}
          </Button>
        </header>

        <div className="px-4">
          <div className="bg-emerald-100 h-3 rounded-full overflow-hidden shadow-inner border border-emerald-50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${quizProgress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -30, transition: { duration: 0.2 } }}
            className="w-full px-2"
          >
            <Card className="rounded-[4rem] p-12 space-y-12 shadow-3xl border-emerald-500/5 bg-white relative overflow-hidden">
              {/* Visual Flair */}
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-[80px] opacity-60" />

              <div className="relative z-10 space-y-6">
                <span className="text-xs font-black text-emerald-600/50 uppercase tracking-[0.3em]">Evaluation #{currentIdx + 1}</span>
                <h2 className={cn(
                  "text-3xl md:text-5xl font-black leading-tight text-emerald-950 tracking-tight",
                  lang === 'ur' && "font-urdu pr-2"
                )}>
                  {current.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {(current.options as string[]).map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOption = i === current.correctAnswer;

                  let cardStyles = "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/30";
                  let icon = null;

                  if (showFeedback) {
                    if (isCorrectOption) {
                      cardStyles = "border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100/50 scale-[1.02] ring-2 ring-emerald-500/20";
                      icon = <CheckCircle className="h-6 w-6 text-emerald-600 fill-emerald-50" />;
                    } else if (isSelected) {
                      cardStyles = "border-rose-300 bg-rose-50/50 opacity-80";
                      icon = <XCircle className="h-6 w-6 text-rose-500 fill-rose-50" />;
                    } else {
                      cardStyles = "border-muted/20 opacity-40 grayscale-[50%]";
                    }
                  } else if (isSelected) {
                    cardStyles = "border-emerald-600 bg-emerald-600 text-white shadow-2xl scale-[1.02]";
                  }

                  return (
                    <motion.div
                      key={i}
                      whileHover={!showFeedback ? { y: -4 } : {}}
                      whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      className={cn(
                        "group flex items-center gap-6 p-7 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                        cardStyles,
                        showFeedback && "cursor-default"
                      )}
                      onClick={() => !showFeedback && setSelected(i)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all",
                        isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
                        showFeedback && isCorrectOption && "bg-emerald-600 text-white"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={cn(
                        "flex-1 font-bold text-xl transition-colors",
                        isSelected && !showFeedback ? "text-white" : "text-emerald-950",
                        lang === 'ur' && "font-urdu"
                      )}>{opt}</span>
                      <div className="transition-all duration-500 transform scale-125">
                        {icon}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative z-10 pt-6">
                {!showFeedback ? (
                  <Button
                    className="w-full h-20 rounded-[2rem] text-2xl font-black bg-emerald-700 hover:bg-emerald-800 shadow-3xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-20"
                    disabled={selected === null}
                    onClick={checkAnswer}
                  >
                    {lang === 'en' ? 'Validate Understanding' : 'جواب چیک کریں'}
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className={cn(
                      "rounded-[2rem] p-8 flex items-center gap-6 border-2 transition-all",
                      isCorrect
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50/50 border-rose-100 text-rose-800"
                    )}>
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner",
                        isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {isCorrect ? <Award className="h-8 w-8" /> : <BookOpen className="h-8 w-8" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black leading-tight">
                          {isCorrect ? t.correct : t.incorrect}
                        </h4>
                        {!isCorrect && (
                          <p className="text-lg opacity-70">
                            Correct reflection: <span className="font-bold">{(current.options as string[])[current.correctAnswer]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full h-20 rounded-[2rem] text-2xl font-black bg-emerald-900 hover:bg-black shadow-3xl transition-all flex items-center justify-center gap-4"
                      onClick={nextQuestion}
                    >
                      {currentIdx === quizData.questions.length - 1 ? t.submit : t.next}
                      <ArrowRight className="h-8 w-8" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="text-center pb-20">
          <div className="inline-flex items-center gap-8 py-4 px-10 bg-white/50 backdrop-blur-md rounded-full border border-emerald-50 shadow-sm">
            <div className="space-x-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mastery</span>
              <span className="text-2xl font-black text-emerald-600">{score}</span>
            </div>
            <div className="w-px h-8 bg-emerald-100" />
            <div className="space-x-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progress</span>
              <span className="text-2xl font-black text-muted-foreground">{currentIdx + (showFeedback ? 1 : 0)} / {quizData.questions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
