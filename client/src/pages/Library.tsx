import { useState, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { TAJWEED_RULES } from "@/data/tajweed-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Play, Pause, RotateCcw, Volume2, BookOpen, Book as BookIcon, Loader2, Plus, Library as LibraryIcon, ImageIcon, FileText, Trash2, Pencil, AlertTriangle } from "lucide-react";
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
import { motion } from "framer-motion";
import { useResources, useCreateResource, useUpdateResource, useDeleteResource, useBooks, useCheckAchievements } from "@/hooks/use-resources";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, StopCircle } from "lucide-react";
import { useVoiceRecorder } from "@/replit_integrations/audio/useVoiceRecorder";

// Premium Branding and CSS themes for Library
const CSS_THEMES: Record<string, { bg: string; accent: string; mainIcon: string; arabic: string; level: string }> = {
    urdu_book: { bg: "#041d1a", accent: "#fbbf24", mainIcon: "📖", arabic: "صفوة الكتب", level: "Advanced" },
    story: { bg: "#422006", accent: "#fbbf24", mainIcon: "📜", arabic: "قصص إسلامية", level: "Intermediate" },
    dua: { bg: "#1e1b4b", accent: "#fbbf24", mainIcon: "🤲", arabic: "نور الدعاء", level: "Beginner" },
    dictionary: { bg: "#171717", accent: "#fbbf24", mainIcon: "📔", arabic: "كنز اللغات", level: "Advanced" },
    tajweed: { bg: "#041d1a", accent: "#fbbf24", mainIcon: "🕌", arabic: "تاج التجويد", level: "Intermediate" },
    hadith: { bg: "#020617", accent: "#fbbf24", mainIcon: "📖", arabic: "أنوار الحديث", level: "Intermediate" },
    hadees: { bg: "#020617", accent: "#fbbf24", mainIcon: "📖", arabic: "أنوار الحديث", level: "Intermediate" },
    fiqh: { bg: "#065f46", accent: "#fbbf24", mainIcon: "⚖️", arabic: "الفقه الإسلامي", level: "Advanced" },
    default: { bg: "#1c1917", accent: "#d4af37", mainIcon: "📖", arabic: "كنز المعرفة", level: "General" },
};


const LibraryBookCover = ({ title, category, imageUrl, className: extraClass }: { title: string; category: string; imageUrl?: string; className?: string }) => {
    // Check if imageUrl is a valid non-placeholder image
    const hasRealImage = imageUrl && !imageUrl.includes("unsplash.com") && !imageUrl.includes("placeholder");

    if (hasRealImage) {
        return (
            <div className={`w-full h-full relative overflow-hidden group ${extraClass}`}>
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10 text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-white font-bold leading-relaxed drop-shadow-xl line-clamp-2 px-1 text-[11px] md:text-xs tracking-wide">
                        {title}
                    </p>
                    <div className="h-0.5 w-10 bg-yellow-400/70 mx-auto mt-2 rounded-full" />
                </div>
            </div>
        );
    }

    const theme = CSS_THEMES[category] || CSS_THEMES.default;

    return (
        <div
            className={`w-full h-full flex relative overflow-hidden group/cover transition-all duration-700 shadow-2xl rounded-[1.5rem]`}
            style={{ backgroundColor: theme.bg }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.2] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pointer-events-none" />

            {/* Labels matching UI */}
            <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1 pointer-events-none">
                <span className="bg-yellow-500 text-[6px] font-black text-black px-2 py-0.5 rounded-full shadow-lg">
                    {theme.level}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-[6px] font-bold text-white px-2 py-0.5 rounded-full border border-white/10 uppercase">
                    Urdu
                </span>
            </div>

            {/* Golden Frame Ornament */}
            <div className="absolute inset-3 border-[1px] border-yellow-500/10 rounded-sm pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/30" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/30" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-between w-full h-full py-6 px-4">
                {/* TOP: Calligraphy */}
                <div className="w-full text-center">
                    <p className="text-3xl font-black text-yellow-500/95 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-urdu leading-none" dir="rtl">
                        {theme.arabic}
                    </p>
                </div>

                {/* MIDDLE: Radiant Illustration */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-yellow-400/10 blur-[40px]" />
                    <div className="relative z-10 text-4xl group-hover/cover:scale-125 group-hover/cover:rotate-[15deg] transition-all duration-700 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                        {theme.mainIcon}
                    </div>
                </div>

                {/* BOTTOM: Title Section (Pill style) */}
                <div className="w-full text-center">
                    <div className="bg-black/80 border border-white/5 py-1.5 rounded-full shadow-xl">
                        <h3 className="text-[10px] font-black leading-tight text-white/95 drop-shadow-sm font-urdu px-2">
                            LIB-ENTRY
                        </h3>
                    </div>
                </div>
            </div>

            {/* Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/cover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>
    );
};

export default function Library() {
    const { lang } = useTheme();
    const { data: resources, isLoading: isLoadingResources } = useResources();
    const { data: allBooks, isLoading: isLoadingBooks } = useBooks();
    const isLoading = isLoadingResources || isLoadingBooks;
    const createResourceMutation = useCreateResource();
    const updateResourceMutation = useUpdateResource();
    const deleteResourceMutation = useDeleteResource();
    const { toast } = useToast();
    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isAdminOrTeacher = isAdmin || user?.role?.toLowerCase() === 'teacher';
    const { mutate: checkAchievements } = useCheckAchievements();

    useEffect(() => {
        // Trigger check on library entry
        checkAchievements({ visitedLibrary: true });
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [playingWord, setPlayingWord] = useState<string | null>(null);
    const [pausedWord, setPausedWord] = useState<string | null>(null);
    const [activeLanguage, setActiveLanguage] = useState("All");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
    const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
    const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Voice recording for uploads
    const { state: recordingState, startRecording, stopRecording } = useVoiceRecorder();
    const isRecording = recordingState === "recording";
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRecording) {
            setRecordingSeconds(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds(s => s + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setRecordingSeconds(0);
        }
        return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
    }, [isRecording]);

    const handleLibraryVoiceRecord = async () => {
        try {
            if (isRecording) {
                const blob = await stopRecording();
                if (blob.size < 100) return;

                // Convert blob to file for upload
                const extension = blob.type.includes('mp4') ? 'm4a' :
                    blob.type.includes('webm') ? 'webm' :
                        blob.type.includes('ogg') ? 'ogg' : 'wav';
                const file = new File([blob], `voice-upload-${Date.now()}.${extension}`, { type: blob.type });
                setSelectedAudioFile(file);
                toast({
                    title: lang === 'en' ? "Recording Captured" : "ریکارڈنگ محفوظ کر لی گئی",
                    description: lang === 'en' ? "Your voice has been recorded and is ready to upload." : "آپ کی آواز ریکارڈ کر لی گئی ہے اور اپ لوڈ کے لیے تیار ہے۔",
                });
            } else {
                await startRecording();
            }
        } catch (err: any) {
            console.error("Recording error:", err);
            toast({
                title: "Microphone Error",
                description: "Could not start recording. Please check microphone permissions.",
                variant: "destructive"
            });
        }
    };

    const [newResource, setNewResource] = useState({
        titleEn: "",
        titleUr: "",
        type: "urdu_book", // story, dua, dictionary, urdu_book
        categoryEn: "",
        categoryUr: "",
        contentEn: "",
        contentUr: "",
        url: "",
        imageUrl: "",
        duaArabic: "",
        duaTransliteration: "",
        duaTranslationEn: "",
        duaTranslationUr: ""
    });

    const resourceTypes = [
        { value: "urdu_book", labelEn: "Urdu Book", labelUr: "اردو کتاب" },
        { value: "story", labelEn: "Islamic Story", labelUr: "اسلامی کہانی" },
        { value: "dua", labelEn: "Daily Dua", labelUr: "روزمرہ دعا" },
        { value: "dictionary", labelEn: "Dictionary Word", labelUr: "لغت کا لفظ" },
    ];

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let finalImageUrl = newResource.imageUrl;
            let finalDocUrl = newResource.url;
            let finalAudioUrl = "";

            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                const res = await fetch("/api/images/upload", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Image upload failed");
                const data = await res.json();
                finalImageUrl = data.url;
            }

            if (selectedDocFile) {
                const formData = new FormData();
                formData.append("file", selectedDocFile);
                const res = await fetch("/api/audio/upload", { // Using audio upload for generic files
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("File upload failed");
                const data = await res.json();
                finalDocUrl = data.url;
            }

            if (selectedAudioFile) {
                const formData = new FormData();
                formData.append("file", selectedAudioFile);
                const res = await fetch("/api/audio/upload", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Audio upload failed");
                const data = await res.json();
                finalAudioUrl = data.url;
            }

            let finalContent: any = {};

            if (newResource.type === 'dictionary') {
                finalContent = {
                    word: newResource.titleUr, // Using Urdu title as the word
                    meaning: {
                        en: newResource.titleEn,
                        ur: newResource.titleUr
                    },
                    example: newResource.contentUr || newResource.contentEn,
                    audioUrl: finalAudioUrl || (editingResourceId ? (resources?.find(r => r.id === editingResourceId)?.content as any)?.audioUrl : "")
                };
            } else {
                finalContent = {
                    en: newResource.contentEn,
                    ur: newResource.contentUr
                };
            }

            if (newResource.type === 'dua') {
                finalContent = {
                    ...finalContent,
                    //@ts-ignore
                    arabic: newResource.duaArabic,
                    transliteration: newResource.duaTransliteration,
                    translation: {
                        en: newResource.duaTranslationEn,
                        ur: newResource.duaTranslationUr
                    },
                    audioUrl: finalAudioUrl || (editingResourceId ? (resources?.find(r => r.id === editingResourceId)?.content as any)?.audioUrl : "")
                };
            }

            const resourceData: any = {
                title: { en: newResource.titleEn, ur: newResource.titleUr },
                type: newResource.type,
                category: newResource.categoryEn || newResource.categoryUr
                    ? { en: newResource.categoryEn || "", ur: newResource.categoryUr || "" }
                    : null,
                content: finalContent,
            };

            if (finalDocUrl) resourceData.url = finalDocUrl;
            if (finalImageUrl) resourceData.imageUrl = finalImageUrl;

            if (editingResourceId) {
                await updateResourceMutation.mutateAsync({
                    id: editingResourceId,
                    data: resourceData
                });
            } else {
                await createResourceMutation.mutateAsync(resourceData);
            }

            toast({
                title: lang === 'en' ? (editingResourceId ? "Resource Updated" : "Resource Added") : (editingResourceId ? "وسیلہ اپ ڈیٹ کر دیا گیا" : "وسیلہ شامل کر دیا گیا"),
                description: lang === 'en' ? `The item has been successfully ${editingResourceId ? 'updated' : 'added'} to the library.` : `نیا آئٹم کامیابی کے ساتھ ${editingResourceId ? 'اپ ڈیٹ' : 'شامل'} کر دیا گیا ہے۔`,
            });

            setIsAddModalOpen(false);
            setEditingResourceId(null);
            setNewResource({
                titleEn: "",
                titleUr: "",
                type: "urdu_book",
                categoryEn: "",
                categoryUr: "",
                contentEn: "",
                contentUr: "",
                url: "",
                imageUrl: "",
                duaArabic: "",
                duaTransliteration: "",
                duaTranslationEn: "",
                duaTranslationUr: ""
            });
            setSelectedFile(null);
            setSelectedDocFile(null);
            setSelectedAudioFile(null);
        } catch (error: any) {
            console.error("Save error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save resource. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: any) => {
        // Robust ID handling (strip prefix if any, like "res-123")
        const resourceId = typeof id === 'string' && id.includes('-')
            ? parseInt(id.split('-')[1])
            : parseInt(String(id));

        if (isNaN(resourceId)) {
            toast({
                title: "Error",
                description: "Invalid resource ID",
                variant: "destructive"
            });
            return;
        }

        setItemToDelete(resourceId);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deleteResourceMutation.mutateAsync(itemToDelete);
            toast({
                title: lang === 'en' ? "Resource Deleted" : "وسیلہ حذف کر دیا گیا",
                description: lang === 'en' ? "The item has been removed from the library." : "آئٹم کو لائبریری سے ہٹا دیا گیا ہے۔",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete resource",
                variant: "destructive"
            });
        } finally {
            setItemToDelete(null);
        }
    };

    const handleEdit = (resource: any) => {
        setEditingResourceId(resource.realId || resource.id);
        const resourceType = resource.type;

        let titleEn = resource.title?.en || "";
        let titleUr = resource.title?.ur || "";
        let contentEn = "";
        let contentUr = "";
        let duaArabic = "";
        let duaTransliteration = "";
        let duaTranslationEn = "";
        let duaTranslationUr = "";

        if (resourceType === 'dua') {
            duaArabic = resource.content?.arabic || "";
            duaTransliteration = resource.content?.transliteration || "";
            duaTranslationEn = resource.content?.translation?.en || "";
            duaTranslationUr = resource.content?.translation?.ur || "";
        } else if (resourceType === 'dictionary') {
            // For dictionary: Arabic word → titleUr, meanings → titleEn/contentUr, example → contentEn
            titleUr = resource.content?.word || "";
            titleEn = resource.content?.meaning?.en || "";
            contentUr = resource.content?.meaning?.ur || "";
            contentEn = resource.content?.example || "";
        } else {
            contentEn = resource.content?.en || "";
            contentUr = resource.content?.ur || "";
        }

        setNewResource({
            titleEn,
            titleUr,
            type: resourceType,
            categoryEn: resource.category?.en || "",
            categoryUr: resource.category?.ur || "",
            contentEn,
            contentUr,
            url: resource.url || "",
            imageUrl: resource.imageUrl || "",
            duaArabic,
            duaTransliteration,
            duaTranslationEn,
            duaTranslationUr
        });
        setIsAddModalOpen(true);
    };

    const t = {
        title: lang === 'en' ? 'Library' : 'لائبریری',
        stories: lang === 'en' ? 'Islamic Stories' : 'اسلامی کہانیاں',
        duas: lang === 'en' ? 'Daily Duas' : 'روزمرہ کی دعائیں',
        dictionary: lang === 'en' ? 'Arabic-Urdu Dictionary' : 'عربی اردو لغت',
        tajweed: lang === 'en' ? 'Tajweed Guide' : 'تجوید گائیڈ',
        urduBooks: lang === 'en' ? 'Urdu Books' : 'اردو کتب',
        readMore: lang === 'en' ? 'Read More' : 'مزید پڑھیں',
        search: lang === 'en' ? 'Search word...' : 'الفاظ تلاش کریں...',
        noResults: lang === 'en' ? 'No results found.' : 'کوئی نتیجہ نہیں ملا۔',
        meaning: lang === 'en' ? 'Meaning' : 'معنی',
        example: lang === 'en' ? 'Example' : 'مثال',
        listen: lang === 'en' ? 'Listen' : 'سنیں',
    };

    // Unified Urdu Books from both Resources and Books tables
    const urduResources = resources?.filter(r => r.type === 'urdu_book') || [];
    const urduBooksFromTable = allBooks?.filter(b => b.language === 'Urdu') || [];

    const unifiedUrduBooks = [
        ...urduResources.map(r => ({
            id: `res-${r.id}`,
            realId: r.id,
            isResource: true,
            title: r.title,
            category: r.category,
            content: r.content,
            imageUrl: r.imageUrl,
            url: r.url
        })),
        ...urduBooksFromTable.map(b => ({
            id: `book-${b.id}`,
            realId: b.id,
            isResource: false,
            title: { en: b.title, ur: b.title }, // Book title is already in its own language
            category: { en: b.category, ur: b.category },
            content: { en: b.summary || "", ur: b.summary || "" },
            imageUrl: b.coverUrl,
            url: b.pdfUrl
        }))
    ];

    const filterByLanguage = (item: any) => {
        if (activeLanguage === "All") return true;

        if (item.type === 'story' || item.type === 'dua') {
            // Check if content exists for the active language
            const content = item.content as any;
            if (activeLanguage === "English") return !!content.en;
            if (activeLanguage === "Urdu") return !!content.ur;
        }

        return true;
    };

    const stories = resources?.filter(r => r.type === 'story' && filterByLanguage(r)) || [];
    const duas = resources?.filter(r => r.type === 'dua' && filterByLanguage(r)) || [];
    const dictionary = resources?.filter(r => r.type === 'dictionary') || [];
    const urduBooks = unifiedUrduBooks;

    const filteredDictionary = dictionary.filter((item: any) => {
        const content = item.content as any;
        return content.word.includes(searchTerm) ||
            content.meaning.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            content.meaning.ur.includes(searchTerm);
    });

    // Helper to play audio from a given src
    const startAudio = useCallback((word: string, audioUrl?: string) => {
        const onEnded = () => {
            setPlayingWord(null);
            setPausedWord(null);
        };

        const onError = (error: any) => {
            console.error("Audio playback error:", error);
            setPlayingWord(null);
            setPausedWord(null);

            // Special case for "Nasheed" to provide clearer feedback
            const isNasheed = word.toLowerCase().includes('nasheed');

            toast({
                title: lang === 'en' ? "Playback Error" : "آڈیو چلانے میں خرابی",
                description: lang === 'en' 
                    ? (isNasheed ? "The Nasheed audio file is missing or unsupported on this device." : "Your browser blocked audio or the file is unsupported. Try clicking again.")
                    : "آپ کے براؤزر نے آڈیو بلاک کر دی ہے یا فائل اس ڈیوائس پر نہیں چل سکتی۔",
                variant: "destructive"
            });
        };

        if (audioUrl) {
            try {
                // Stop any existing audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                }

                const finalUrl = audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
                const audio = new Audio(finalUrl);
                audioRef.current = audio;
                
                audio.preload = "auto";
                audio.onended = onEnded;
                audio.onerror = onError;

                // Explicit load for mobile browsers
                audio.load();

                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log("Audio playing successfully:", finalUrl);
                    }).catch((err) => {
                        console.warn("Audio play promise failed:", err);
                        // If it's a domain/policy error, it might need a direct user interaction
                        if (err.name === 'NotAllowedError') {
                            toast({
                                title: "Interaction Required",
                                description: "Please tap the play button again.",
                            });
                        }
                        onError(err);
                    });
                }
                return audio;
            } catch (err) {
                onError(err);
                return null;
            }
        }

        // TTS fallback (only if no audioUrl)
        if (!window.speechSynthesis) {
            toast({
                title: "Not Supported",
                description: "Voice synthesis is not supported on this browser.",
                variant: "destructive"
            });
            return null;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        const isArabic = /[\u0600-\u06FF]/.test(word);
        utterance.lang = isArabic ? 'ar-SA' : (lang === 'en' ? 'en-US' : 'ur-PK');
        utterance.rate = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(isArabic ? 'ar' : (lang === 'en' ? 'en' : 'ur')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = onEnded;
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            onEnded();
        };

        window.speechSynthesis.speak(utterance);
        setPlayingWord(word);
        return null;
    }, [lang, toast]);

    // Main toggle: play → pause → resume from same spot
    const handleListen = useCallback((word: string, audioUrl?: string) => {
        // If this exact audio is playing → pause it
        if (playingWord === word && audioRef.current) {
            audioRef.current.pause();
            setPlayingWord(null);
            setPausedWord(word);
            return;
        }

        // If this exact audio is paused → resume from where we left off
        if (pausedWord === word && audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setPlayingWord(word);
                    setPausedWord(null);
                }).catch(err => {
                    console.error("Resume failed:", err);
                    startAudio(word, audioUrl); // Fallback to restart
                });
            } else {
                setPlayingWord(word);
                setPausedWord(null);
            }
            return;
        }

        // Stop current
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        
        // Start fresh
        setPausedWord(null);
        setPlayingWord(word);
        startAudio(word, audioUrl);

        // Achievement logic
        const currentCount = parseInt(localStorage.getItem("duas_listened_count") || "0");
        const nextCount = currentCount + 1;
        localStorage.setItem("duas_listened_count", nextCount.toString());
        if (nextCount >= 5) {
            checkAchievements({ duasListened: nextCount });
        }
    }, [playingWord, pausedWord, startAudio, checkAchievements]);

    // Restart from beginning
    const handleRestart = useCallback((word: string, audioUrl?: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        setPausedWord(null);
        setPlayingWord(word);
        startAudio(word, audioUrl);
    }, [startAudio]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>

                {isAdminOrTeacher && (
                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (open && !editingResourceId) {
                            // Reset form for fresh "Add"
                            setNewResource({
                                titleEn: "",
                                titleUr: "",
                                type: "urdu_book",
                                categoryEn: "",
                                categoryUr: "",
                                contentEn: "",
                                contentUr: "",
                                url: "",
                                imageUrl: "",
                                duaArabic: "",
                                duaTransliteration: "",
                                duaTranslationEn: "",
                                duaTranslationUr: ""
                            });
                            setSelectedFile(null);
                            setSelectedDocFile(null);
                            setSelectedAudioFile(null);
                        }
                        if (!open) {
                            setEditingResourceId(null);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl h-11 px-6 shadow-lg bg-primary hover:bg-primary/90 gap-2">
                                <Plus className="h-5 w-5" />
                                {lang === 'en' ? 'Add Content' : 'مواد شامل کریں'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-primary/5 p-8 border-b border-primary/10">
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <LibraryIcon className="h-6 w-6 text-primary" />
                                    {editingResourceId
                                        ? (lang === 'en' ? 'Edit Resource' : 'مواد میں ترمیم کریں')
                                        : (lang === 'en' ? 'Add New Content' : 'نیا مواد شامل کریں')}
                                </DialogTitle>
                                <DialogDescription className="mt-2">
                                    {lang === 'en' ? 'Add a book, story, or dua to the educational hub.' : 'تعلیمی مرکز میں کتاب، کہانی یا دعا شامل کریں۔'}
                                </DialogDescription>
                            </div>
                            <form onSubmit={handleAddResource} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>{lang === 'en' ? 'Content Type' : 'مواد کی قسم'}</Label>
                                        <Select value={newResource.type} onValueChange={(val) => setNewResource({ ...newResource, type: val })}>
                                            <SelectTrigger className="rounded-xl h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {resourceTypes.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {lang === 'en' ? t.labelEn : t.labelUr}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{lang === 'en' ? 'Title (English)' : 'عنوان (انگریزی)'}</Label>
                                            <Input
                                                required
                                                value={newResource.titleEn}
                                                onChange={(e) => setNewResource({ ...newResource, titleEn: e.target.value })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Title (Urdu)' : 'عنوان (اردو)'}</Label>
                                            <Input
                                                required
                                                dir="rtl"
                                                value={newResource.titleUr}
                                                onChange={(e) => setNewResource({ ...newResource, titleUr: e.target.value })}
                                                className="rounded-xl h-11 text-right font-urdu"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{lang === 'en' ? 'Category (English)' : 'زمرہ (انگریزی)'}</Label>
                                            <Input
                                                value={newResource.categoryEn}
                                                onChange={(e) => setNewResource({ ...newResource, categoryEn: e.target.value })}
                                                className="rounded-xl h-11"
                                                placeholder="e.g. Prophets"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Category (Urdu)' : 'زمرہ (اردو)'}</Label>
                                            <Input
                                                dir="rtl"
                                                value={newResource.categoryUr}
                                                onChange={(e) => setNewResource({ ...newResource, categoryUr: e.target.value })}
                                                className="rounded-xl h-11 text-right font-urdu"
                                                placeholder="مثلاً انبیاء علیہم السلام"
                                            />
                                        </div>
                                    </div>

                                    {newResource.type === 'dua' ? (
                                        <div className="space-y-4 pt-4 border-t border-primary/10">
                                            <div className="space-y-2">
                                                <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Arabic Text' : 'عربی متن'}</Label>
                                                <Input
                                                    required
                                                    dir="rtl"
                                                    value={newResource.duaArabic}
                                                    onChange={(e) => setNewResource({ ...newResource, duaArabic: e.target.value })}
                                                    className="rounded-xl h-11 text-right font-arabic text-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{lang === 'en' ? 'Transliteration' : 'ترجمہ خط'}</Label>
                                                <Input
                                                    value={newResource.duaTransliteration}
                                                    onChange={(e) => setNewResource({ ...newResource, duaTransliteration: e.target.value })}
                                                    className="rounded-xl h-11 italic"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>{lang === 'en' ? 'Translation (English)' : 'ترجمہ (انگریزی)'}</Label>
                                                    <Input
                                                        value={newResource.duaTranslationEn}
                                                        onChange={(e) => setNewResource({ ...newResource, duaTranslationEn: e.target.value })}
                                                        className="rounded-xl h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Translation (Urdu)' : 'ترجمہ (اردو)'}</Label>
                                                    <Input
                                                        dir="rtl"
                                                        value={newResource.duaTranslationUr}
                                                        onChange={(e) => setNewResource({ ...newResource, duaTranslationUr: e.target.value })}
                                                        className="rounded-xl h-11 text-right font-urdu"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{lang === 'en' ? 'Voice Upload (Your Voice)' : 'آواز اپ لوڈ کریں (اپنی آواز)'}</Label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                                                        <Volume2 className="h-6 w-6 text-primary shrink-0" />
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                id="resAudioFile"
                                                                className="hidden"
                                                                accept="audio/*"
                                                                onChange={(e) => setSelectedAudioFile(e.target.files?.[0] || null)}
                                                            />
                                                            <Label htmlFor="resAudioFile" className="cursor-pointer text-sm font-bold text-primary hover:underline block">
                                                                {selectedAudioFile ? selectedAudioFile.name : (lang === 'en' ? 'Select Audio File' : 'آڈیو فائل منتخب کریں')}
                                                            </Label>
                                                            <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV up to 10MB</p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant={isRecording ? "destructive" : "outline"}
                                                        className={`w-full rounded-xl py-6 gap-3 font-bold transition-all shadow-sm ${isRecording ? 'animate-pulse' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                                                        onClick={handleLibraryVoiceRecord}
                                                    >
                                                        {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                                        {isRecording
                                                            ? (lang === 'en' ? `Recording... (${recordingSeconds}s)` : `ریکارڈنگ ہو رہی ہے... (${recordingSeconds}s)`)
                                                            : (lang === 'en' ? 'Record Voice' : 'آواز ریکارڈ کریں')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : newResource.type === 'dictionary' ? (
                                        <div className="space-y-4 pt-4 border-t border-primary/10">
                                            <div className="space-y-2">
                                                <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Arabic Word' : 'عربی لفظ'}</Label>
                                                <Input
                                                    required
                                                    dir="rtl"
                                                    value={newResource.titleUr}
                                                    onChange={(e) => setNewResource({ ...newResource, titleUr: e.target.value })}
                                                    className="rounded-xl h-11 text-right font-arabic text-2xl"
                                                    placeholder="مثلاً: صَلَاة"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>{lang === 'en' ? 'Meaning (English)' : 'معنی (انگریزی)'}</Label>
                                                    <Input
                                                        value={newResource.titleEn}
                                                        onChange={(e) => setNewResource({ ...newResource, titleEn: e.target.value })}
                                                        className="rounded-xl h-11"
                                                        placeholder="e.g. Prayer"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label dir="rtl" className="text-right block w-full">{lang === 'en' ? 'Meaning (Urdu)' : 'معنی (اردو)'}</Label>
                                                    <Input
                                                        dir="rtl"
                                                        value={newResource.contentUr}
                                                        onChange={(e) => setNewResource({ ...newResource, contentUr: e.target.value })}
                                                        className="rounded-xl h-11 text-right font-urdu"
                                                        placeholder="نماز"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{lang === 'en' ? 'Example (Arabic)' : 'مثال (عربی)'}</Label>
                                                <Input
                                                    dir="rtl"
                                                    value={newResource.contentEn}
                                                    onChange={(e) => setNewResource({ ...newResource, contentEn: e.target.value })}
                                                    className="rounded-xl h-11 text-right font-arabic"
                                                    placeholder="أَقِيمُوا الصَّلَاةَ"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{lang === 'en' ? 'Upload Pronunciation Audio' : 'تلفظ آڈیو اپ لوڈ کریں'}</Label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                                                        <Volume2 className="h-6 w-6 text-primary shrink-0" />
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                id="dictAudioFile"
                                                                className="hidden"
                                                                accept="audio/*"
                                                                onChange={(e) => setSelectedAudioFile(e.target.files?.[0] || null)}
                                                            />
                                                            <Label htmlFor="dictAudioFile" className="cursor-pointer text-sm font-bold text-primary hover:underline block">
                                                                {selectedAudioFile ? selectedAudioFile.name : (lang === 'en' ? 'Select Voice File' : 'آواز فائل منتخب کریں')}
                                                            </Label>
                                                            <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV up to 10MB</p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant={isRecording ? "destructive" : "outline"}
                                                        className={`w-full rounded-xl py-6 gap-3 font-bold transition-all shadow-sm ${isRecording ? 'animate-pulse' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                                                        onClick={handleLibraryVoiceRecord}
                                                    >
                                                        {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                                        {isRecording
                                                            ? (lang === 'en' ? `Recording... (${recordingSeconds}s)` : `ریکارڈنگ ہو رہی ہے... (${recordingSeconds}s)`)
                                                            : (lang === 'en' ? 'Record Voice' : 'آواز ریکارڈ کریں')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>{lang === 'en' ? 'Content/Story (Urdu)' : 'مواد / کہانی (اردو)'}</Label>
                                            <Textarea
                                                dir="rtl"
                                                value={newResource.contentUr}
                                                onChange={(e) => setNewResource({ ...newResource, contentUr: e.target.value })}
                                                className="rounded-xl min-h-[120px] text-right font-urdu leading-loose"
                                                placeholder="یہاں مواد لکھیں۔۔۔"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>{lang === 'en' ? 'Upload Document (Optional)' : 'دستاویز اپ لوڈ کریں (اختیاری)'}</Label>
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                                            <FileText className="h-6 w-6 text-primary shrink-0" />
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="resDocFile"
                                                    className="hidden"
                                                    onChange={(e) => setSelectedDocFile(e.target.files?.[0] || null)}
                                                />
                                                <Label htmlFor="resDocFile" className="cursor-pointer text-sm font-bold text-primary hover:underline block">
                                                    {selectedDocFile ? selectedDocFile.name : (lang === 'en' ? 'Select File' : 'فائل منتخب کریں')}
                                                </Label>
                                                <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC up to 50MB</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold">OR URL</span>
                                            <Input
                                                id="resUrl"
                                                value={newResource.url}
                                                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                                className="rounded-xl h-11 pl-12 text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{lang === 'en' ? 'Image/Cover' : 'تصویر / سرورق'}</Label>
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                                            <ImageIcon className="h-6 w-6 text-primary shrink-0" />
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="resImageFile"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                />
                                                <Label htmlFor="resImageFile" className="cursor-pointer text-sm font-bold text-primary hover:underline">
                                                    {selectedFile ? selectedFile.name : (lang === 'en' ? 'Upload image' : 'تصویر اپ لوڈ کریں')}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="pt-4 flex gap-3">
                                    <Button type="button" variant="outline" className="rounded-xl h-12 flex-1" onClick={() => setIsAddModalOpen(false)}>
                                        {lang === 'en' ? 'Cancel' : 'منسوخ کریں'}
                                    </Button>
                                    <Button type="submit" className="rounded-xl h-12 flex-[2] font-bold gap-2" disabled={isUploading}>
                                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                        {isUploading ? (lang === 'en' ? 'Saving...' : 'محفوظ ہو رہا ہے...') : (lang === 'en' ? 'Save Content' : 'محفوظ کریں')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Tabs defaultValue="urdu_books" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 h-auto p-1 bg-muted/50 rounded-2xl w-full md:w-max">
                        <TabsTrigger value="urdu_books" className="rounded-xl py-3 px-6">{t.urduBooks}</TabsTrigger>
                        <TabsTrigger value="stories" className="rounded-xl py-3 px-6">{t.stories}</TabsTrigger>
                        <TabsTrigger value="duas" className="rounded-xl py-3 px-6">{t.duas}</TabsTrigger>
                        <TabsTrigger value="dictionary" className="rounded-xl py-3 px-6">{t.dictionary}</TabsTrigger>
                        <TabsTrigger value="tajweed" className="rounded-xl py-3 px-6">{t.tajweed}</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50 shrink-0">
                        {["All", "English", "Urdu"].map((l) => (
                            <Button
                                key={l}
                                variant={activeLanguage === l ? "secondary" : "ghost"}
                                size="sm"
                                className={`rounded-xl px-4 transition-all ${activeLanguage === l ? 'shadow-sm' : ''}`}
                                onClick={() => setActiveLanguage(l)}
                            >
                                {l === 'All' ? (lang === 'en' ? 'All Languages' : 'تمام زبانیں') : l}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Urdu Books */}
                <TabsContent value="urdu_books" className="space-y-4 outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {urduBooks.map((book: any) => (
                            <div key={book.id} className="group/card bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500 border border-black/5 flex flex-col h-full">
                                <div className="relative aspect-[3/4] overflow-hidden m-4 rounded-[1.5rem] shadow-lg bg-slate-100">
                                    <LibraryBookCover title={book.title[lang]} category="urdu_book" />
                                </div>
                                <div className="px-8 pb-8 flex flex-col flex-grow text-center relative">
                                    {isAdminOrTeacher && book.isResource && (
                                        <div className="absolute top-0 right-8 flex gap-2 -translate-y-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-white text-emerald-600" onClick={() => handleEdit(resources?.find(r => r.id === book.realId))}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md" onClick={() => handleDelete(book.realId)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-black text-slate-800 mb-6 font-urdu flex-grow">
                                        {book.title[lang]}
                                    </h3>
                                    <Button
                                        className="w-full bg-[#108a65] hover:bg-[#0d6e51] text-white rounded-xl py-6 text-md font-bold shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-3 transition-all"
                                        onClick={() => window.open(book.url, '_blank')}
                                    >
                                        <BookOpen className="h-5 w-5" />
                                        {lang === 'en' ? 'Read Book' : 'کتاب مطالعہ کریں'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Islamic Stories */}
                <TabsContent value="stories" className="space-y-4 outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {stories.map((story: any) => (
                            <div key={story.id} className="group/card bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500 border border-black/5 flex flex-col h-full">
                                <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[1.5rem] shadow-lg bg-slate-100">
                                    <LibraryBookCover title={story.title[lang]} category="story" />
                                </div>
                                <div className="px-8 pb-8 flex flex-col flex-grow relative">
                                    {isAdminOrTeacher && (
                                        <div className="absolute top-0 right-4 flex gap-2 -translate-y-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-white text-emerald-600" onClick={() => handleEdit(story)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md" onClick={() => handleDelete(story.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <h3 className="text-lg font-black text-slate-800 mb-4 font-urdu line-clamp-1">
                                        {story.title[lang]}
                                    </h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-grow">
                                        {story.content[lang]}
                                    </p>
                                    <Button
                                        className="w-full bg-[#108a65] hover:bg-[#0d6e51] text-white rounded-xl py-6 text-md font-bold shadow-lg"
                                        onClick={() => window.open(story.url, '_blank')}
                                    >
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        {t.readMore}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Daily Duas */}
                <TabsContent value="duas" className="space-y-4 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {duas.map((dua: any) => {
                            const content = dua.content as any;
                            return (
                                <Card key={dua.id} className="bg-white rounded-[2.5rem] border-none shadow-xl overflow-hidden group/dua transition-all duration-500 hover:shadow-2xl">
                                    <CardHeader className="flex flex-row items-center justify-between pb-4 pt-10 px-10">
                                        <CardTitle className="text-2xl font-black text-slate-800 font-urdu">{dua.title[lang]}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isAdminOrTeacher && (
                                                <div className="flex gap-1 mr-2 opacity-0 group-hover/dua:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600" onClick={() => handleEdit(dua)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600" onClick={() => handleDelete(dua.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all shadow-sm active:scale-95"
                                                onClick={() => handleRestart(content.arabic, content.audioUrl)}
                                            >
                                                <RotateCcw className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className={`h-12 w-12 rounded-full transition-all shadow-md active:scale-95 ${playingWord === content.arabic ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                onClick={() => handleListen(content.arabic, content.audioUrl)}
                                            >
                                                {playingWord === content.arabic ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-12 space-y-6">
                                        <div className="text-center p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative group-hover/dua:border-emerald-100 transition-colors">
                                            <p className="text-4xl font-arabic leading-loose mb-6 text-slate-800" style={{ fontFamily: 'Al_Mushaf, serif' }}>
                                                {content.arabic}
                                            </p>
                                            <p className="text-sm text-slate-400 italic mb-8 font-medium">
                                                {content.transliteration}
                                            </p>
                                            <div className="space-y-6">
                                                <p className="text-xl font-bold text-slate-700 leading-relaxed italic">
                                                    {content.translation.en}
                                                </p>
                                                {content.translation.ur && (
                                                    <p className="text-2xl font-urdu text-emerald-700 leading-loose border-t border-slate-200 pt-6" dir="rtl">
                                                        {content.translation.ur}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Arabic-Urdu Dictionary */}
                <TabsContent value="dictionary" className="space-y-8 outline-none">
                    <div className="relative max-w-lg mx-auto mb-10">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                        <Input
                            placeholder={t.search}
                            className="pl-16 h-16 rounded-full bg-white border-2 border-slate-100 shadow-xl text-lg focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredDictionary.map((item: any) => {
                            const content = item.content as any;
                            return (
                                <div key={item.id} className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col items-center text-center group/dict relative">
                                    {isAdminOrTeacher && (
                                        <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover/dict:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600" onClick={() => handleEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div
                                        className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 cursor-pointer transition-all active:scale-90 ${playingWord === content.word ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600 group-hover/dict:scale-110'}`}
                                        onClick={() => handleListen(content.word, content.audioUrl)}
                                    >
                                        {playingWord === content.word ? <Pause className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                                    </div>
                                    <h3 className="text-5xl font-arabic text-slate-800 mb-4">{content.word}</h3>
                                    <h4 className="text-2xl font-black text-emerald-600 mb-6 font-urdu">{content.meaning[lang]}</h4>
                                    <div className="h-[2px] w-12 bg-slate-100 mb-6" />
                                    <p className="text-sm text-slate-400 font-arabic italic line-clamp-2 leading-loose">{content.example}</p>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Tajweed Guide */}
                <TabsContent value="tajweed" className="space-y-10 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {TAJWEED_RULES.map((rule, idx) => (
                            <div key={idx} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 group/tajweed hover:shadow-2xl transition-all">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-bold text-2xl border-2 ${rule.color.replace('text-', 'border-')} ${rule.color} shadow-sm group-hover/tajweed:scale-110 transition-transform`}>
                                        {idx + 1}
                                    </div>
                                    <h3 className={`text-2xl font-black ${rule.color}`}>{rule.name}</h3>
                                </div>
                                <p className="text-lg text-slate-500 font-urdu text-right leading-loose mb-8" dir="rtl">
                                    {rule.descriptionUrdu}
                                </p>
                                {rule.letters && (
                                    <div className="flex flex-wrap gap-4">
                                        {rule.letters.map((l, i) => (
                                            <span key={i} className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl font-arabic font-bold text-slate-800 shadow-sm">
                                                {l}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-rose-600 mb-2">
                            Delete Resource?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-lg text-slate-500">
                            Are you sure you want to permanently delete this resource? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-4">
                        <AlertDialogCancel className="rounded-2xl border-2 border-slate-100 h-14 font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-10 h-14 font-bold shadow-lg"
                        >
                            Delete Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
