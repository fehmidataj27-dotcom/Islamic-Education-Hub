import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    RefreshCcw,
    BookOpen,
    Users,
    Star,
    Trophy,
    HelpCircle,
    Info,
    AlertTriangle
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import islamicPattern from "@/assets/images/islamic_pattern_hero.png";
import mosqueSilhouette from "@/assets/images/mosque_silhouette.png";

type Flashcard = {
    id: number;
    question: { en: string; ur: string };
    answer: { en: string; ur: string };
    category: string;
};

export default function Flashcards() {
    const { lang } = useTheme();
    const { user } = useAuth();
    const { toast } = useToast();

    // Core state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [category, setCategory] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<number | null>(null);

    // Session tracking
    const [learnedCount, setLearnedCount] = useState(0);

    // Form state for creating new cards
    const [newQuestionEn, setNewQuestionEn] = useState("");
    const [newQuestionUr, setNewQuestionUr] = useState("");
    const [newAnswerEn, setNewAnswerEn] = useState("");
    const [newAnswerUr, setNewAnswerUr] = useState("");
    const [newCategory, setNewCategory] = useState("General Knowledge");

    const { data: flashcards = [], isLoading } = useQuery<Flashcard[]>({
        queryKey: ["/api/flashcards"],
    });

    const createMutation = useMutation({
        mutationFn: async (newCard: Omit<Flashcard, "id">) => {
            const res = await apiRequest("POST", "/api/flashcards", newCard);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
            toast({ title: lang === 'en' ? "Success" : "کامیابی", description: lang === 'en' ? "Flashcard created successfully" : "فلیش کارڈ کامیابی سے تیار کر لیا گیا ہے" });
            setIsDialogOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/flashcards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
            toast({ title: lang === 'en' ? "Deleted" : "حذف کر دیا گیا", description: lang === 'en' ? "Flashcard removed successfully" : "فلیش کارڈ کامیابی سے ہٹا دیا گیا ہے" });
            if (currentIndex >= filteredCards.length - 1 && currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
            setCardToDelete(null);
        },
        onError: () => {
            setCardToDelete(null);
        }
    });

    const handleDelete = (id: number) => {
        setCardToDelete(id);
    };

    const confirmDelete = () => {
        if (cardToDelete) {
            deleteMutation.mutate(cardToDelete);
        }
    };

    const resetForm = () => {
        setNewQuestionEn("");
        setNewQuestionUr("");
        setNewAnswerEn("");
        setNewAnswerUr("");
        setNewCategory("General Knowledge");
    };

    const isAdminOrTeacher = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';

    const t = {
        title: lang === 'en' ? 'Knowledge Flashcards' : 'علمی فلیش کارڈز',
        subtitle: lang === 'en' ? 'Test your Islamic knowledge with interactive cards' : 'انٹرایکٹو کارڈز کے ساتھ اپنے اسلامی علم کی جانچ کریں',
        flip: lang === 'en' ? 'Flip to See Answer' : 'جواب دیکھنے کے لیے پلٹیں',
        next: lang === 'en' ? 'Next Card' : 'اگلا کارڈ',
        prev: lang === 'en' ? 'Previous' : 'پچھلا',
        question: lang === 'en' ? 'Question' : 'سوال',
        answer: lang === 'en' ? 'Correct Answer' : 'درست جواب',
        filterBy: lang === 'en' ? 'Filter Category' : 'زمرہ منتخب کریں',
        all: lang === 'en' ? 'All Wisdom' : 'تمام حکمت',
        addBtn: lang === 'en' ? 'Create New Card' : 'نیا کارڈ بنائیں',
        learned: lang === 'en' ? 'Learned It!' : 'سیکھ لیا!',
        stillLearning: lang === 'en' ? 'Still Learning' : 'ابھی سیکھ رہا ہوں',
        finishedTitle: lang === 'en' ? 'Great Job!' : 'بہت اچھا!',
        finishedDesc: lang === 'en' ? 'You have completed this set of flashcards.' : 'آپ نے فلیش کارڈز کا یہ سیٹ مکمل کر لیا ہے۔',
        restart: lang === 'en' ? 'Start Again' : 'دوبارہ شروع کریں',
        stats: lang === 'en' ? 'Session Progress' : 'سیشن کی پیش رفت',
        deleteConfirm: lang === 'en' ? "Are you sure you want to delete this card?" : "کیا آپ واقعی اس کارڈ کو حذف کرنا چاہتے ہیں؟",
    };

    const filteredCards = useMemo(() => {
        return category === "all"
            ? flashcards
            : flashcards.filter(card => card.category === category);
    }, [flashcards, category]);

    const currentCard = filteredCards[currentIndex];
    const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

    const handleNext = () => {
        if (currentIndex < filteredCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleMarkLearned = () => {
        setLearnedCount(prev => prev + 1);
        handleNext();
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
        setLearnedCount(0);
    };

    const handleAddFlashcard = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            question: { en: newQuestionEn, ur: newQuestionUr },
            answer: { en: newAnswerEn, ur: newAnswerUr },
            category: newCategory,
        });
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case "Prophets": return <Users className="h-4 w-4" />;
            case "Worship": return <Star className="h-4 w-4" />;
            case "General Knowledge": return <BookOpen className="h-4 w-4" />;
            default: return <HelpCircle className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                <p className="text-muted-foreground animate-pulse">Loading Wisdom...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${islamicPattern})`, backgroundSize: '400px' }} />
            <div className="absolute bottom-0 left-0 right-0 h-64 z-0 opacity-[0.05] pointer-events-none bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url(${mosqueSilhouette})` }} />

            <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                                {t.title}
                            </h1>
                            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select onValueChange={(val) => { setCategory(val); handleRestart(); }} defaultValue="all">
                            <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-emerald-100 rounded-xl shadow-sm focus:ring-emerald-500">
                                <SelectValue placeholder={t.filterBy} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-emerald-100">
                                <SelectItem value="all">{t.all}</SelectItem>
                                <SelectItem value="Prophets">Prophets</SelectItem>
                                <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                                <SelectItem value="Worship">Worship</SelectItem>
                            </SelectContent>
                        </Select>

                        {isAdminOrTeacher && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-xl">
                                        <Plus className="h-4 w-4" />
                                        {t.addBtn}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">{t.addBtn}</DialogTitle>
                                        <DialogDescription>Create a new bilingual flashcard for students.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddFlashcard} className="space-y-6 pt-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Question (English)</Label>
                                                    <Input className="rounded-xl" value={newQuestionEn} onChange={(e) => setNewQuestionEn(e.target.value)} required placeholder="e.g. Who was the first Prophet?" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="w-full text-right block">سوال (اردو)</Label>
                                                    <Input dir="rtl" className="text-right rounded-xl font-urdu" value={newQuestionUr} onChange={(e) => setNewQuestionUr(e.target.value)} required placeholder="جیسے: پہلے نبی کون تھے؟" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Answer (English)</Label>
                                                    <Input className="rounded-xl" value={newAnswerEn} onChange={(e) => setNewAnswerEn(e.target.value)} required placeholder="e.g. Prophet Adam (AS)" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="w-full text-right block">جواب (اردو)</Label>
                                                    <Input dir="rtl" className="text-right rounded-xl font-urdu" value={newAnswerUr} onChange={(e) => setNewAnswerUr(e.target.value)} required placeholder="جیسے: حضرت آدم (ع)" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select onValueChange={setNewCategory} defaultValue={newCategory}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Prophets">Prophets</SelectItem>
                                                        <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                                                        <SelectItem value="Worship">Worship</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-xl text-lg font-bold" disabled={createMutation.isPending}>
                                            {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t.addBtn}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Progress Tracking */}
                {filteredCards.length > 0 && !isFinished && (
                    <div className="space-y-3 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/10 shadow-sm">
                        <div className="flex justify-between items-end text-sm">
                            <div className="flex items-center gap-2 font-bold text-emerald-800">
                                <Trophy className="h-4 w-4 text-emerald-600" />
                                <span>{t.stats}: {learnedCount} / {filteredCards.length}</span>
                            </div>
                            <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                Card {currentIndex + 1} of {filteredCards.length}
                            </span>
                        </div>
                        <div className="relative h-3 w-full bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                    </div>
                )}

                {/* Main Interaction Area */}
                <AnimatePresence mode="wait">
                    {isFinished ? (
                        <motion.div
                            key="finished"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full py-20 px-4"
                        >
                            <Card className="max-w-md mx-auto overflow-hidden rounded-[2.5rem] border-primary/20 bg-white shadow-2xl">
                                <div className="p-10 text-center space-y-6">
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                                        <CheckCircle2 className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-emerald-900">{t.finishedTitle}</h2>
                                        <p className="text-muted-foreground italic px-6">{t.finishedDesc}</p>
                                    </div>
                                    <div className="py-4 px-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                        <span className="font-bold text-emerald-800">Knowledge Mastered:</span>
                                        <span className="text-2xl font-black text-emerald-600">{learnedCount}</span>
                                    </div>
                                    <Button onClick={handleRestart} className="w-full h-14 text-lg font-bold gap-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl">
                                        <RefreshCcw className="h-5 w-5" />
                                        {t.restart}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ) : currentCard ? (
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30, transition: { duration: 0.2 } }}
                            className="space-y-8"
                        >
                            {/* Flashcard Component */}
                            <div className="perspective-1000 w-full h-[450px] relative group" onClick={() => setIsFlipped(!isFlipped)}>
                                <motion.div
                                    className="w-full h-full relative"
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.8, type: "spring", damping: 20 }}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Front Side */}
                                    <div className="absolute inset-0 w-full h-full cursor-pointer" style={{ backfaceVisibility: 'hidden' }}>
                                        <Card className="w-full h-full flex flex-col items-center justify-center p-12 text-center rounded-[3rem] border-2 border-emerald-500/10 bg-gradient-to-br from-white via-white to-emerald-50/50 shadow-2xl group-hover:shadow-emerald-200/50 group-hover:border-emerald-500/30 transition-all duration-500">
                                            {/* Category Tag */}
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 py-2 px-6 rounded-full bg-emerald-100/80 backdrop-blur-md text-emerald-700 text-sm font-black tracking-widest uppercase flex items-center gap-2">
                                                {getCategoryIcon(currentCard.category)}
                                                {currentCard.category}
                                            </div>

                                            <div className="space-y-8 max-w-lg">
                                                <div className="space-y-3">
                                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{t.question}</span>
                                                    <h2 className={cn(
                                                        "text-3xl md:text-5xl font-black leading-tight text-emerald-900 tracking-tight",
                                                        lang === 'ur' && "font-urdu leading-normal"
                                                    )} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
                                                        {currentCard.question[lang]}
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-10 flex items-center gap-2 text-sm font-bold text-emerald-400 bg-white/80 px-4 py-2 rounded-full shadow-inner border border-emerald-50 animate-bounce">
                                                <RotateCw className="h-4 w-4" /> {t.flip}
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 w-full h-full cursor-pointer" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                        <Card className="w-full h-full flex flex-col items-center justify-center p-12 text-center rounded-[3rem] border-4 border-emerald-500 bg-emerald-600 shadow-2xl relative overflow-hidden">
                                            {/* Subtile Glow effect */}
                                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />

                                            <div className="space-y-6 max-w-lg relative z-10">
                                                <div className="space-y-2">
                                                    <span className="text-xs font-black text-emerald-200/80 uppercase tracking-widest">{t.answer}</span>
                                                    <h2 className={cn(
                                                        "text-3xl md:text-5xl font-black leading-tight text-white tracking-tight",
                                                        lang === 'ur' && "font-urdu leading-normal"
                                                    )} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
                                                        {currentCard.answer[lang]}
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-10 py-1 px-4 rounded-full border border-white/20 text-white/50 text-xs font-black">
                                                {t.flip}
                                            </div>
                                        </Card>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Controls Drawer */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        variant="outline"
                                        className="h-14 w-14 rounded-2xl border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="h-14 px-8 text-lg font-bold gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-xl rounded-2xl"
                                    >
                                        {t.next}
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onClick={handleMarkLearned}
                                        variant="ghost"
                                        className="h-14 px-6 text-emerald-600 font-bold gap-2 hover:bg-emerald-50 rounded-2xl"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        {t.learned}
                                    </Button>
                                </div>

                                {isAdminOrTeacher && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2 rounded-xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(currentCard.id);
                                        }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Card
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 bg-white/30 backdrop-blur-md border-2 border-dashed border-emerald-500/20 rounded-[3rem]"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                    <Info className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-emerald-900/50">Wisdom Hub</h3>
                                    <p className="text-muted-foreground">Choose a category or create a card to begin.</p>
                                </div>
                                <Button variant="outline" className="rounded-full px-8" onClick={() => setIsDialogOpen(true)}>
                                    Add Your First Card
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend / Tip */}
            {!isFinished && currentCard && (
                <div className="max-w-md mx-auto mt-12 px-6 py-4 bg-emerald-500/5 rounded-2xl text-center flex items-center justify-center gap-3">
                    <Info className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs text-emerald-800 italic">
                        Tip: You can hit <strong>"Learned It!"</strong> to track your mastery progress during this session.
                    </p>
                </div>
            )}
            {/* Delete Confirmation */}
            <AlertDialog open={!!cardToDelete} onOpenChange={() => setCardToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {lang === 'en' ? 'Delete Card?' : 'کارڈ حذف کریں؟'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground">
                            {t.deleteConfirm}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">{lang === 'en' ? "Cancel" : "منسوخ کریں"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6 font-bold"
                        >
                            {lang === 'en' ? "Delete" : "حذف کریں"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
