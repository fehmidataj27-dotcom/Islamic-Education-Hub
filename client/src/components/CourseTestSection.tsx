import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
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
import {
    FileText,
    Upload,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    ClipboardList,
    FileUp,
    Eye,
    Trophy,
    BookOpen,
    AlertCircle,
    GraduationCap,
    Check,
    FileCode,
    User,
    Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api, buildUrl } from "@shared/routes";
import { CourseTest, CourseTestResult } from "@shared/schema";

type QuizOption = { text: string; isCorrect: boolean };
type QuizQuestion = { id: string; question: string; options: QuizOption[] };
type AnswerMap = Record<string, number>; // questionId -> selected option index

export default function CourseTestSection({ courseId }: { courseId: string }) {
    const { user } = useAuth();
    const { lang } = useTheme();
    const { toast } = useToast();

    const [answers, setAnswers] = useState<AnswerMap>({});
    const [activeTestId, setActiveTestId] = useState<number | null>(null);

    // Test Deletion State
    const [testToDelete, setTestToDelete] = useState<number | null>(null);

    // Student Submission State
    const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
    const [submissionText, setSubmissionText] = useState("");
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [submittingTestId, setSubmittingTestId] = useState<number | null>(null);
    const submissionFileRef = useRef<HTMLInputElement>(null);

    // Teacher View State
    const [viewResultsTestId, setViewResultsTestId] = useState<number | null>(null);

    // Teacher: Grading State
    const [gradingResultId, setGradingResultId] = useState<number | null>(null);
    const [gradingScore, setGradingScore] = useState<number>(0);
    const [gradingTotal, setGradingTotal] = useState<number>(100);
    const [gradingFeedback, setGradingFeedback] = useState("");

    // Queries
    const { data: allItems = [], isLoading: isLoadingTests } = useQuery<CourseTest[]>({
        queryKey: [buildUrl(api.courseTests.list.path, { courseId })],
    });

    const tests = allItems.filter(item => item.type !== 'notes');

    const { data: results = [], isLoading: isLoadingResults } = useQuery<CourseTestResult[]>({
        queryKey: [api.courseTests.results.path],
    });

    // Query for teachers to see ALL results of a specific test
    const { data: allStudentResults = [], isLoading: isLoadingAllResults } = useQuery<(CourseTestResult & { studentName?: string })[]>({
        queryKey: [`/api/course-tests/${viewResultsTestId}/all-results`],
        enabled: !!viewResultsTestId && (user?.role === "teacher" || user?.role === "admin"),
    });

    // Mutations
    const createTestMutation = useMutation({
        mutationFn: async (newTest: any) => {
            const res = await apiRequest("POST", buildUrl(api.courseTests.create.path, { courseId }), newTest);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [buildUrl(api.courseTests.list.path, { courseId })] });
            toast({ title: "✅ Test uploaded successfully!" });
        },
    });

    const deleteTestMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", buildUrl(api.courseTests.delete.path, { id }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [buildUrl(api.courseTests.list.path, { courseId })] });
            toast({ title: "🗑️ Test deleted" });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: lang === 'en' ? "Error deleting test" : "ٹیسٹ حذف کرنے میں خرابی",
                description: error.message
            });
        },
    });

    const submitResultMutation = useMutation({
        mutationFn: async (result: any) => {
            const res = await apiRequest("POST", api.courseTests.submit.path, result);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.courseTests.results.path] });
            toast({ title: lang === 'en' ? "Submission successful!" : "جواب جمع کر دیا گیا ہے!" });
        },
    });

    const gradeMutation = useMutation({
        mutationFn: async (data: { id: number, score: number, total: number, feedback: string }) => {
            const res = await apiRequest("PATCH", `/api/course-tests/results/${data.id}/grade`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/course-tests/${viewResultsTestId}/all-results`] });
            toast({ title: lang === 'en' ? "Graded successfully!" : "گریڈ کر دیا گیا ہے!" });
            setGradingResultId(null);
        },
    });

    // Upload quiz dialog state
    const [quizDialogOpen, setQuizDialogOpen] = useState(false);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
    const [quizTitle, setQuizTitle] = useState("");
    const [quizDesc, setQuizDesc] = useState("");
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { id: "q1", question: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }
    ]);
    const [pdfTitle, setPdfTitle] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const isTeacher = user?.role === "teacher" || user?.role === "admin";
    const isStudent = user?.role === "student";
    const isParent = user?.role === "parent";

    // --- Teacher: Save Quiz ---
    const handleSaveQuiz = () => {
        if (!quizTitle.trim()) { toast({ variant: "destructive", title: "Quiz title is required" }); return; }
        const testQuestions = questions as QuizQuestion[];
        const hasEmptyQ = testQuestions.some((q: QuizQuestion) => !q.question.trim() || q.options.some((o: QuizOption) => !o.text.trim()));
        if (hasEmptyQ) { toast({ variant: "destructive", title: "Fill all questions & options" }); return; }

        createTestMutation.mutate({
            type: "quiz",
            title: quizTitle,
            description: quizDesc,
            questions,
        });
        setQuizDialogOpen(false);
        resetQuizForm();
    };

    const resetQuizForm = () => {
        setQuizTitle(""); setQuizDesc("");
        setQuestions([{ id: "q1", question: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
    };

    // --- Teacher: Save PDF ---
    const handleSavePDF = async () => {
        if (!pdfTitle.trim() || !pdfFile) { toast({ variant: "destructive", title: "Please enter title and select PDF" }); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            createTestMutation.mutate({
                type: "pdf",
                title: pdfTitle,
                pdfName: pdfFile.name,
                pdfData: e.target?.result as string,
            });
            setPdfDialogOpen(false);
            setPdfTitle(""); setPdfFile(null);
        };
        reader.readAsDataURL(pdfFile);
    };

    // --- Student: Submit Answer (PDF/Text) ---
    const handleSaveSubmission = async () => {
        if (!submittingTestId) return;
        if (!submissionText.trim() && !submissionFile) {
            toast({ variant: "destructive", title: lang === 'en' ? "Please provide an answer or file" : "براہ کرم جواب لکھیں یا فائل اپلوڈ کریں" });
            return;
        }

        const submit = (fileData?: string, fileName?: string) => {
            submitResultMutation.mutate({
                testId: submittingTestId,
                submissionText,
                submissionData: fileData,
                submissionName: fileName,
                completedAt: new Date(),
            });
            setSubmissionDialogOpen(false);
            setSubmissionText("");
            setSubmissionFile(null);
            setSubmittingTestId(null);
        };

        if (submissionFile) {
            const reader = new FileReader();
            reader.onload = (e) => submit(e.target?.result as string, submissionFile.name);
            reader.readAsDataURL(submissionFile);
        } else {
            submit();
        }
    };

    // --- Teacher: Handle Grade Submit ---
    const handleSaveGrade = () => {
        if (gradingResultId === null) return;
        gradeMutation.mutate({
            id: gradingResultId,
            score: gradingScore,
            total: gradingTotal,
            feedback: gradingFeedback,
        });
    };

    // --- Student: Submit Quiz ---
    const handleSubmit = (test: CourseTest) => {
        if (!test.questions) return;
        const testQuestions = test.questions as unknown as QuizQuestion[];
        let correct = 0;
        testQuestions.forEach((q: QuizQuestion) => {
            const chosen = answers[q.id];
            if (chosen !== undefined && q.options[chosen]?.isCorrect) correct++;
        });

        submitResultMutation.mutate({
            testId: test.id,
            score: correct,
            total: testQuestions.length,
        });

        setActiveTestId(null);
        toast({ title: `You scored ${correct}/${testQuestions.length}!`, description: correct === testQuestions.length ? "Perfect score! 🎉" : correct >= testQuestions.length / 2 ? "Good job! 👍" : "Keep studying! 📚" });
    };

    const handleDeleteConfirm = () => {
        if (!testToDelete) return;
        deleteTestMutation.mutate(testToDelete);
        setTestToDelete(null);
    };

    // --- Question builder helpers ---
    const addQuestion = () => {
        setQuestions([...questions, {
            id: `q${Date.now()}`,
            question: "",
            options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]
        }]);
    };
    const updateQuestion = (qi: number, val: string) => {
        const updated = [...questions];
        updated[qi] = { ...updated[qi], question: val };
        setQuestions(updated);
    };
    const updateOption = (qi: number, oi: number, val: string) => {
        const updated = [...questions];
        updated[qi].options[oi] = { ...updated[qi].options[oi], text: val };
        setQuestions(updated);
    };
    const setCorrect = (qi: number, oi: number) => {
        const updated = [...questions];
        updated[qi].options = updated[qi].options.map((o: QuizOption, i: number) => ({ ...o, isCorrect: i === oi }));
        setQuestions(updated);
    };
    const removeQuestion = (qi: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_: any, i: number) => i !== qi));
    };

    const activeTest = tests.find(t => t.id === activeTestId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary" />
                        {lang === 'en' ? 'Tests & Assignments' : 'ٹیسٹ اور اسائنمنٹس'}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {isTeacher && (lang === 'en' ? 'Upload quizzes or PDF assignments for students' : 'طلباء کے لیے کوئز یا پی ڈی ایف اسائنمنٹ اپلوڈ کریں')}
                        {isStudent && (lang === 'en' ? 'Complete your tests and track your scores' : 'اپنے ٹیسٹ مکمل کریں اور اسکور دیکھیں')}
                        {isParent && (lang === 'en' ? "View your child's tests and assignments" : "اپنے بچے کے ٹیسٹ اور اسائنمنٹ دیکھیں")}
                    </p>
                </div>

                {isTeacher && (
                    <div className="flex gap-2 flex-wrap">
                        {/* Upload Quiz */}
                        <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 rounded-xl shadow">
                                    <Plus className="h-4 w-4" /> {lang === 'en' ? 'Add Quiz' : 'کوئز شامل کریں'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-primary" />
                                        {lang === 'en' ? 'Create Quiz / Assignment' : 'کوئز / اسائنمنٹ بنائیں'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-1">
                                        <Label>{lang === 'en' ? 'Quiz Title *' : 'کوئز کا عنوان *'}</Label>
                                        <Input placeholder={lang === 'en' ? "e.g. Tajweed Chapter 1 Quiz" : "مثلاً تجوید باب 1 کوئز"} value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>{lang === 'en' ? 'Description (optional)' : 'تفصیل (اختیاری)'}</Label>
                                        <Textarea placeholder={lang === 'en' ? "Instructions for students..." : "طلباء کے لیے ہدایات..."} value={quizDesc} onChange={e => setQuizDesc(e.target.value)} rows={2} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">{lang === 'en' ? 'Questions' : 'سوالات'}</Label>
                                            <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1 rounded-xl">
                                                <Plus className="h-3 w-3" /> {lang === 'en' ? 'Add Question' : 'سوال شامل کریں'}
                                            </Button>
                                        </div>

                                        {questions.map((q: QuizQuestion, qi: number) => (
                                            <Card key={q.id} className="border-border/50 bg-muted/20">
                                                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                                    <span className="font-bold text-sm text-primary">Q{qi + 1}</span>
                                                    {questions.length > 1 && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeQuestion(qi)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-3">
                                                    <Input
                                                        placeholder={lang === 'en' ? "Type your question here..." : "یہاں سوال لکھیں..."}
                                                        value={q.question}
                                                        onChange={e => updateQuestion(qi, e.target.value)}
                                                    />
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-muted-foreground font-medium">{lang === 'en' ? 'Options (click radio to mark correct answer):' : 'آپشن (صحیح جواب کے لیے ریڈیو پر کلک کریں):'}</p>
                                                        {q.options.map((opt: QuizOption, oi: number) => (
                                                            <div key={oi} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${opt.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border/50'}`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${q.id}`}
                                                                    checked={opt.isCorrect}
                                                                    onChange={() => setCorrect(qi, oi)}
                                                                    className="accent-green-500"
                                                                />
                                                                <Input
                                                                    className="border-none bg-transparent h-7 p-0 focus-visible:ring-0"
                                                                    placeholder={`${lang === 'en' ? 'Option' : 'آپشن'} ${oi + 1}`}
                                                                    value={opt.text}
                                                                    onChange={e => updateOption(qi, oi, e.target.value)}
                                                                />
                                                                {opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>{lang === 'en' ? 'Cancel' : 'منسوخ'}</Button>
                                    <Button onClick={handleSaveQuiz} className="gap-2">
                                        <Upload className="h-4 w-4" /> {lang === 'en' ? 'Publish Quiz' : 'کوئز شائع کریں'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Upload PDF */}
                        <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 rounded-xl">
                                    <FileUp className="h-4 w-4" /> {lang === 'en' ? 'Upload PDF' : 'پی ڈی ایف اپلوڈ'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        {lang === 'en' ? 'Upload PDF Assignment' : 'پی ڈی ایف اسائنمنٹ اپلوڈ'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-1">
                                        <Label>{lang === 'en' ? 'Assignment Title *' : 'اسائنمنٹ کا عنوان *'}</Label>
                                        <Input placeholder={lang === 'en' ? "e.g. Week 3 Assignment" : "مثلاً ہفتہ 3 اسائنمنٹ"} value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} />
                                    </div>
                                    <div
                                        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        {pdfFile ? (
                                            <div>
                                                <p className="font-semibold text-primary">{pdfFile.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium">{lang === 'en' ? 'Click to upload PDF / DOC / TXT' : 'پی ڈی ایف / ڈاک / ٹیکسٹ اپلوڈ کریں'}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{lang === 'en' ? 'Supports PDF, Word, Text files' : 'پی ڈی ایف، ورڈ، ٹیکسٹ فائلیں قابل قبول ہیں'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>{lang === 'en' ? 'Cancel' : 'منسوخ'}</Button>
                                    <Button onClick={handleSavePDF} disabled={!pdfFile} className="gap-2">
                                        <Upload className="h-4 w-4" /> {lang === 'en' ? 'Upload' : 'اپلوڈ'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Student Submission Dialog */}
            <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-primary" />
                            {lang === 'en' ? 'Submit Your Answer' : 'اپنا جواب جمع کروائیں'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label>{lang === 'en' ? 'Your Answer (Text)' : 'آپ کا جواب (ٹیکسٹ)'}</Label>
                            <Textarea
                                placeholder={lang === 'en' ? "Type your answer or notes here..." : "اپنا جواب یہاں لکھیں..."}
                                value={submissionText}
                                onChange={e => setSubmissionText(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">{lang === 'en' ? 'OR' : 'یا'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>{lang === 'en' ? 'Upload PDF / Photo' : 'پی ڈی ایف / فوٹو اپلوڈ کریں'}</Label>
                            <div
                                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                onClick={() => submissionFileRef.current?.click()}
                            >
                                <input
                                    ref={submissionFileRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={e => setSubmissionFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                {submissionFile ? (
                                    <div>
                                        <p className="font-semibold text-primary text-sm">{submissionFile.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{(submissionFile.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-medium">{lang === 'en' ? 'Select File (PDF, Images)' : 'فائل منتخب کریں (پی ڈی ایف، تصاویر)'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubmissionDialogOpen(false)}>{lang === 'en' ? 'Cancel' : 'منسوخ'}</Button>
                        <Button onClick={handleSaveSubmission} disabled={submitResultMutation.isPending} className="gap-2">
                            {submitResultMutation.isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Upload className="h-4 w-4" />}
                            {lang === 'en' ? 'Submit Answer' : 'جواب جمع کریں'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Teacher: View All Submissions Dialog */}
            <Dialog open={!!viewResultsTestId} onOpenChange={() => setViewResultsTestId(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            {lang === 'en' ? 'Student Submissions' : 'طلباء کے جوابات'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        {isLoadingAllResults ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : allStudentResults.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>{lang === 'en' ? 'No submissions yet.' : 'ابھی تک کوئی جواب جمع نہیں ہوا۔'}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allStudentResults.map((res: CourseTestResult & { studentName?: string }) => (
                                    <Card key={res.id} className="border-border/50 overflow-hidden">
                                        <CardHeader className="p-4 pb-2 bg-muted/20">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{res.studentName || res.userId}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <p className="text-[10px] text-muted-foreground">{res.completedAt ? new Date(res.completedAt).toLocaleString() : ''}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {res.score !== null ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold py-1 px-3">
                                                            {res.score} / {res.total}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-yellow-300 text-yellow-700 animate-pulse">
                                                            {lang === 'en' ? 'Pending' : 'منتظر'}
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1 rounded-lg text-xs"
                                                        onClick={() => {
                                                            setGradingResultId(res.id);
                                                            setGradingScore(res.score || 0);
                                                            setGradingTotal(res.total || 100);
                                                            setGradingFeedback((res as any).teacherFeedback || "");
                                                        }}
                                                    >
                                                        <ClipboardList className="h-3 w-3" />
                                                        {lang === 'en' ? 'Grade' : 'گریڈ کریں'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            {gradingResultId === res.id ? (
                                                <div className="space-y-3 p-3 bg-primary/5 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs">{lang === 'en' ? 'Score' : 'نمبر'}</Label>
                                                            <Input
                                                                type="number"
                                                                value={gradingScore}
                                                                onChange={e => setGradingScore(Number(e.target.value))}
                                                                className="h-8"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs">{lang === 'en' ? 'Total' : 'کل نمبر'}</Label>
                                                            <Input
                                                                type="number"
                                                                value={gradingTotal}
                                                                onChange={e => setGradingTotal(Number(e.target.value))}
                                                                className="h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">{lang === 'en' ? 'Teacher Feedback' : 'استاد کی رائے'}</Label>
                                                        <Textarea
                                                            placeholder={lang === 'en' ? "Well done! Keep it up." : "بہت اچھا! اسے جاری رکھیں۔"}
                                                            value={gradingFeedback}
                                                            onChange={e => setGradingFeedback(e.target.value)}
                                                            rows={2}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSaveGrade} disabled={gradeMutation.isPending}>
                                                            {lang === 'en' ? 'Save Grade' : 'گریڈ محفوظ کریں'}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setGradingResultId(null)}>
                                                            {lang === 'en' ? 'Cancel' : 'منسوخ'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {res.submissionText && (
                                                        <div className="bg-muted/30 p-3 rounded-lg text-sm border shadow-sm">
                                                            <p className="whitespace-pre-wrap">{res.submissionText}</p>
                                                        </div>
                                                    )}
                                                    {res.submissionData && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full gap-2 text-xs border border-muted-foreground/10 hover:shadow-md transition-all"
                                                            onClick={() => {
                                                                const a = document.createElement("a");
                                                                a.href = res.submissionData as string;
                                                                a.download = res.submissionName || "submission";
                                                                a.click();
                                                            }}
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            {lang === 'en' ? 'Download File:' : 'فائل ڈاؤنلوڈ کریں:'} <span className="font-bold truncate max-w-[150px]">{res.submissionName}</span>
                                                        </Button>
                                                    )}
                                                    {(res as any).teacherFeedback && (
                                                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                            <p className="text-[10px] uppercase font-bold text-green-700 mb-1">{lang === 'en' ? 'Teacher Feedback' : 'استاد کی رائے'}</p>
                                                            <p className="text-xs italic text-green-800 dark:text-green-200">"{(res as any).teacherFeedback}"</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Active Quiz Taking View */}
            <AnimatePresence>
                {activeTestId && activeTest?.type === "quiz" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-primary/30 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge className="mb-2 bg-primary/20 text-primary border-none">
                                            <ClipboardList className="h-3 w-3 mr-1" /> {lang === 'en' ? 'Quiz in Progress' : 'کوئز جاری ہے'}
                                        </Badge>
                                        <CardTitle className="text-2xl">{activeTest.title}</CardTitle>
                                        {activeTest.description && <p className="text-muted-foreground text-sm mt-1">{activeTest.description}</p>}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setActiveTestId(null)} className="rounded-xl">
                                        {lang === 'en' ? 'Cancel' : 'منسوخ'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="py-6 space-y-6">
                                {((activeTest.questions || []) as unknown as QuizQuestion[]).map((q: QuizQuestion, qi: number) => (
                                    <div key={q.id} className="space-y-3">
                                        <p className="font-semibold text-base">
                                            <span className="text-primary font-bold mr-2">Q{qi + 1}.</span>{q.question}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {q.options.map((opt: QuizOption, oi: number) => (
                                                <button
                                                    key={oi}
                                                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                                                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm
                                                        ${answers[q.id] === oi
                                                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                                                        }`}
                                                >
                                                    <span className="font-bold mr-2 text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 rounded-b-lg py-4 flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    {Object.keys(answers).length} / {((activeTest.questions || []) as unknown as QuizQuestion[]).length} {lang === 'en' ? 'answered' : 'جوابات دیے'}
                                </p>
                                <Button
                                    onClick={() => handleSubmit(activeTest)}
                                    disabled={Object.keys(answers).length === 0}
                                    className="gap-2 px-8 rounded-xl"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {lang === 'en' ? 'Submit Answers' : 'جوابات جمع کروائیں'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Test List */}
            {isLoadingTests ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : tests.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border"
                >
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <ClipboardList className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{lang === 'en' ? 'No Tests Yet' : 'ابھی تک کوئی ٹیسٹ نہیں'}</h3>
                        <p className="text-muted-foreground max-w-md">
                            {isTeacher
                                ? (lang === 'en' ? 'Upload your first quiz or PDF assignment using the buttons above.' : 'اوپر بٹن سے اپنا پہلا کوئز یا پی ڈی ایف اپلوڈ کریں۔')
                                : (lang === 'en' ? 'Tests and assignments will appear here once uploaded by the teacher.' : 'استاد کی طرف سے اپلوڈ ہونے پر ٹیسٹ یہاں نظر آئیں گے۔')}
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tests.map((test, idx) => {
                        const result = results.find(r => r.testId === test.id);
                        const isCompleted = !!result;

                        return (
                            <motion.div
                                key={test.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                            >
                                <Card className={`h-full border transition-all duration-300 hover:shadow-lg group
                                    ${isCompleted ? 'border-green-500/30 bg-green-50/30 dark:bg-green-950/10' : 'border-border/50 hover:border-primary/30'}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${test.type === "pdf" ? "bg-orange-100 dark:bg-orange-950/30 text-orange-600" : "bg-blue-100 dark:bg-blue-950/30 text-blue-600"}`}>
                                                    {test.type === "pdf" ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <Badge variant="outline" className={`text-[10px] mb-1 ${test.type === "pdf" ? "border-orange-300 text-orange-600" : "border-blue-300 text-blue-600"}`}>
                                                        {test.type === "pdf" ? (lang === 'en' ? "PDF Assignment" : "پی ڈی ایف اسائنمنٹ") : (lang === 'en' ? "Quiz" : "کوئز")}
                                                    </Badge>
                                                    <CardTitle className="text-base leading-tight">{test.title}</CardTitle>
                                                </div>
                                            </div>
                                            {isTeacher && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                                    onClick={() => setTestToDelete(test.id)}
                                                    disabled={deleteTestMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-3">
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {test.description && <p className="text-sm text-foreground/80 mb-2">{test.description}</p>}
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {test.uploadedBy}</span>
                                                <span>{test.uploadedAt ? new Date(test.uploadedAt).toLocaleDateString() : ''}</span>
                                                {test.type === "quiz" && <span>{((test.questions || []) as unknown as QuizQuestion[]).length} {lang === 'en' ? 'Qs' : 'سوال'}</span>}
                                            </div>
                                        </div>

                                        {/* Score Badge */}
                                        {isCompleted && (
                                            <div className="space-y-2">
                                                <div className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold
                                                    ${result.score === result.total
                                                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700'
                                                        : (result.score || 0) >= (result.total || 0) / 2
                                                            ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700'
                                                            : 'bg-red-100 dark:bg-red-950/30 text-red-700'}`}>
                                                    <Trophy className="h-4 w-4" />
                                                    {lang === 'en' ? 'Score:' : 'اسکور:'} {result.score}/{result.total}
                                                    {result.score === result.total && " 🎉"}
                                                </div>

                                                {(result as any).teacherFeedback && (
                                                    <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs italic">
                                                        <p className="font-bold text-[10px] uppercase text-primary mb-1">{lang === 'en' ? 'Teacher Feedback' : 'استاد کی رائے'}</p>
                                                        "{(result as any).teacherFeedback}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="pt-0 flex flex-col gap-2">
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                variant="outline"
                                                className={`flex-1 gap-2 rounded-xl transition-all duration-300 ${test.type === 'pdf' ? 'bg-orange-50/50 hover:bg-orange-100 dark:bg-orange-950/20' : ''}`}
                                                onClick={() => {
                                                    if (test.pdfData) {
                                                        const a = document.createElement("a");
                                                        a.href = test.pdfData;
                                                        a.download = test.pdfName || "assignment.pdf";
                                                        a.click();
                                                    }
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                                {lang === 'en' ? 'View/Download' : 'دیکھیں / ڈاؤنلوڈ'}
                                            </Button>

                                            {isTeacher && (
                                                <Button
                                                    variant="secondary"
                                                    className="gap-2 rounded-xl"
                                                    onClick={() => setViewResultsTestId(test.id)}
                                                >
                                                    <GraduationCap className="h-4 w-4" />
                                                    {lang === 'en' ? 'Submissions' : 'جوابات'}
                                                </Button>
                                            )}
                                        </div>

                                        {test.type === "pdf" && isStudent && !isCompleted && (
                                            <Button
                                                className="w-full gap-2 rounded-xl bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
                                                onClick={() => { setSubmittingTestId(test.id); setSubmissionDialogOpen(true); }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                {lang === 'en' ? 'Submit Answer' : 'جواب جمع کریں'}
                                            </Button>
                                        )}

                                        {test.type === "quiz" && isStudent && !isCompleted && (
                                            <Button
                                                className="w-full gap-2 rounded-xl bg-primary shadow-sm hover:shadow-md transition-all active:scale-95"
                                                onClick={() => { setActiveTestId(test.id); setAnswers({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            >
                                                <ClipboardList className="h-4 w-4" />
                                                {lang === 'en' ? 'Start Quiz' : 'کوئز شروع کریں'}
                                            </Button>
                                        )}

                                        {isCompleted && isStudent && (
                                            <Button variant="outline" disabled className="w-full gap-2 rounded-xl border-green-500/50 text-green-600 bg-green-50/50">
                                                <CheckCircle2 className="h-4 w-4" />
                                                {lang === 'en' ? 'Already Submitted' : 'پہلے ہی جمع کر دیا گیا ہے'}
                                            </Button>
                                        )}

                                        {(isParent || (isTeacher && test.type === "quiz")) && !isTeacher && (
                                            <Button variant="ghost" disabled className="w-full gap-2 rounded-xl text-muted-foreground bg-muted/30">
                                                <Eye className="h-4 w-4" />
                                                {isParent ? (lang === 'en' ? 'View Only' : 'صرف دیکھیں') : (lang === 'en' ? `${((test.questions || []) as unknown as QuizQuestion[]).length} Questions` : `${((test.questions || []) as unknown as QuizQuestion[]).length} سوالات`)}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
            {/* Alert Dialog for Deletion */}
            <AlertDialog open={!!testToDelete} onOpenChange={() => setTestToDelete(null)}>
                <AlertDialogContent className="rounded-3xl border-primary/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            {lang === 'en' ? 'Delete Test?' : 'ٹیسٹ حذف کریں؟'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {lang === 'en'
                                ? "Are you sure you want to delete this test? This action cannot be undone and all student results will be lost."
                                : "کیا آپ واقعی اس ٹیسٹ کو حذف کرنا چاہتے ہیں؟ اس عمل کو واپس نہیں لیا جا سکتا اور طلباء کے نتائج ضائع ہو جائیں گے۔"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">{lang === 'en' ? 'Cancel' : 'منسوخ'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                        >
                            {lang === 'en' ? 'Delete Permanently' : 'مستقل طور پر حذف کریں'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
