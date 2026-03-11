import { useBooks, useCreateBook, useDeleteBook } from "@/hooks/use-resources";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Book as BookIcon, Download, Eye, ExternalLink, Quote, Search, Filter, Share2, Plus, Loader2, Image as ImageIcon, FileText, Trash2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Real AI-generated cover images per category
const CATEGORY_COVERS: Record<string, string> = {
  Tajweed: "/cover_tajweed.png",
  Hadith: "/cover_hadees.png",
  Hadees: "/cover_hadees.png",
  Namaz: "/cover_namaz.png",
  Tafsir: "/cover_tafsir.png",
  Tafseer: "/cover_tafsir.png",
  Quran: "/cover_quran.png",
  Fiqh: "/cover_fiqh.png",
  Aqeedah: "/cover_aqeedah.png",
  Seerah: "/cover_seerah.png",
  History: "/cover_seerah.png",
  Arabic: "/cover_tajweed.png",
  ArabicGrammar: "/cover_tajweed.png",
  Spirituality: "/cover_aqeedah.png",
  Other: "/cover_generic.png"
};

// Smart specific covers based on title match
const SPECIFIC_COVERS: Record<string, string> = {
  "Mishkat": "/cover_mishkat.png",
  "Qurtubi": "/cover_qurtubi.png",
  "Sa'di": "/cover_sadi.png",
  "Sa`di": "/cover_sadi.png",
  "Jalalayn": "/cover_jalalayn.png",
  "Kathir": "/cover_ibn_kathir.png",
  "Tmhedi": "/cover_tajweed.png",
  "Madani": "/cover_tajweed.png",
  "Qoul": "/cover_tajweed.png"
};

// CSS-based fallback themes for categories without a real image
const CSS_THEMES: Record<string, { bg: string; accent: string; title: string; mainIcon: string; arabic: string; level: string }> = {
  Tajweed: { bg: "#041d1a", accent: "#fbbf24", title: "#0d9488", mainIcon: "🕌", arabic: "التجويد", level: "Advanced" },
  Hadith: { bg: "#020617", accent: "#fbbf24", title: "#1e1b4b", mainIcon: "📖", arabic: "الحديث", level: "Intermediate" },
  Hadees: { bg: "#020617", accent: "#fbbf24", title: "#1e1b4b", mainIcon: "📖", arabic: "الحديث", level: "Intermediate" },
  Tafsir: { bg: "#1e1b4b", accent: "#fbbf24", title: "#1e1b4b", mainIcon: "📖", arabic: "التفسير", level: "Advanced" },
  Arabic: { bg: "#155e75", accent: "#d4af37", title: "#0891b2", mainIcon: "✒️", arabic: "العربية", level: "Beginner" },
  History: { bg: "#422006", accent: "#fbbf24", title: "#78350f", mainIcon: "📜", arabic: "التاريخ", level: "Intermediate" },
  Spirituality: { bg: "#2e1065", accent: "#d4af37", title: "#4c1d95", mainIcon: "🌙", arabic: "التزكية", level: "Advanced" },
  Fiqh: { bg: "#065f46", accent: "#fbbf24", title: "#059669", mainIcon: "⚖️", arabic: "الفقه", level: "Advanced" },
  default: { bg: "#1c1917", accent: "#d4af37", title: "#44403c", mainIcon: "📖", arabic: "الكتاب", level: "General" },
};


// Beautiful Creative Islamic Book Cover for Darse Nizami
const BookCoverFallback = ({ title, category, className: extraClass }: { title: string; category: string; className?: string }) => {
  const [imgFailed, setImgFailed] = useState(false);

  // 1. Check for specific book covers first based on title match
  let realCover = Object.entries(SPECIFIC_COVERS).find(
    ([key]) => title.toLowerCase().includes(key.toLowerCase())
  )?.[1];

  // 2. If no specific book cover, check for category cover
  if (!realCover) {
    const normalizedCategory = Object.keys(CATEGORY_COVERS).find(
      k => k.toLowerCase() === (category || '').toLowerCase()
    );
    realCover = normalizedCategory ? CATEGORY_COVERS[normalizedCategory] : CATEGORY_COVERS.Other;
  }

  if (realCover && !imgFailed) {
    return (
      <div className={`w-full h-full relative overflow-hidden group ${extraClass}`}>
        <img
          src={realCover}
          alt={`${category} cover`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgFailed(true)}
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

        {/* Bottom title section */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10 text-center bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="text-white font-bold leading-relaxed drop-shadow-xl line-clamp-2 px-1 text-[11px] md:text-xs tracking-wide">
            {title.replace(/([Al|Ar])-([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').trim()}
          </p>
          <div className="h-0.5 w-10 bg-yellow-400/70 mx-auto mt-2 rounded-full" />
        </div>
      </div>
    );
  }

  // CSS fallback for categories without a real image
  const theme = CSS_THEMES[category] || CSS_THEMES.default;

  return (
    <div
      className={`w-full h-full flex relative overflow-hidden group/cover transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] rounded-xl border border-white/5`}
      style={{ backgroundColor: theme.bg }}
    >
      {/* Background Ornate Pattern (Arabesque) */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z' filter='blur(1px)' fill='%23d4af37'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Detail Labels */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1.5 anim-fade-in">
        <span className="bg-yellow-500 text-[8px] font-black text-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] uppercase tracking-tighter">
          {theme.level}
        </span>
        <span className="bg-white/10 backdrop-blur-md text-[8px] font-bold text-white px-3 py-1 rounded-full border border-white/20 uppercase tracking-tighter">
          Urdu / Arabic
        </span>
      </div>

      {/* Heavy Golden Border (Luxury Look) */}
      <div className="absolute inset-0 border-[12px] border-transparent pointer-events-none z-20">
        <div className="absolute inset-0 border-2 border-yellow-600/40 rounded-lg" />
        <div className="absolute inset-1 border border-yellow-500/10 rounded-md" />

        {/* Corner Decorative Elements */}
        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] rounded-br-lg" />
      </div>

      {/* Content Layout */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full py-12 px-10">

        {/* TOP: Large Golden Arabic Calligraphy (Increased Size) */}
        <div className="text-center w-full mt-4">
          <div className="relative inline-block group-hover/cover:scale-110 transition-transform duration-700">
            <div className="absolute inset-x-[-20%] inset-y-[-10%] blur-3xl bg-yellow-500/20" />
            <p className="relative text-7xl md:text-8xl font-black text-yellow-500/95 drop-shadow-[0_8px_16px_rgba(0,0,0,1)] font-urdu tracking-tight leading-none" dir="rtl">
              {theme.arabic}
            </p>
          </div>
        </div>

        {/* MIDDLE: Radiant Sacred Illustration (Dynamic Glow) */}
        <div className="relative flex items-center justify-center">
          {/* Primary Sunburst */}
          <div className="absolute w-[300%] h-[300%] opacity-40 animate-[spin_60s_linear_infinite] pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500/40">
              {[...Array(36)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2={50 + 50 * Math.cos(i * Math.PI / 18)} y2={50 + 50 * Math.sin(i * Math.PI / 18)} stroke="currentColor" strokeWidth="0.8" />
              ))}
            </svg>
          </div>

          <div className="absolute w-56 h-56 bg-yellow-400/10 rounded-full blur-[80px] animate-pulse" />

          <div className="relative w-44 h-44 flex items-center justify-center group-hover/cover:scale-125 transition-all duration-1000">
            {category === 'Fiqh' ? (
              <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500/90 drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]">
                <path d="M50 10 L50 90 M20 40 L80 40 M20 40 Q20 80 50 80 M80 40 Q80 80 50 80" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="50" cy="15" r="6" fill="currentColor" />
                <rect x="12" y="36" width="16" height="8" rx="2" fill="currentColor" />
                <rect x="72" y="36" width="16" height="8" rx="2" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-500/90 drop-shadow-[0_0_30px_rgba(234,179,8,0.7)]">
                <path d="M50 80 L15 55 L15 25 L50 45 L85 25 L85 55 Z" fill="currentColor" />
                <path d="M25 80 L50 55 L75 80 M35 90 L65 90" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M50 45 L50 20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            )}
          </div>
        </div>

        {/* BOTTOM: Book Name Section (Pill style like image) */}
        <div className="w-full text-center space-y-5">
          <div className="inline-block px-12 py-3 bg-black/80 backdrop-blur-xl rounded-full border-2 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative group/btn overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1500" />
            <h3 className="relative text-[22px] font-black text-white drop-shadow-md font-urdu">
              {title.replace(/([Al|Ar])-([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/\(/g, ' (').trim()}
            </h3>
          </div>

          <div className="flex justify-center gap-2">
            <div className="w-4 h-[2px] bg-yellow-500/40 rounded-full" />
            <div className="w-12 h-[2px] bg-yellow-500/60 rounded-full" />
            <div className="w-4 h-[2px] bg-yellow-500/40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </div>
  );
};

// Smart image component with fallback to CSS cover on load error
function BookImage({ book }: { book: any }) {
  const { lang } = useTheme();
  const title = book.title;

  // We only show the seeded "Mihrab" covers if the current cover is one of our default generic ones
  // OR if the cover is missing entirely. 
  // If the user provided an external URL or uploaded a custom file, we ALWAYS respect that.

  const isSeededGeneric = !book.coverUrl || book.coverUrl.startsWith('/cover_');
  const isCustomUpload = book.coverUrl?.startsWith('/uploads');
  const isExternalUrl = book.coverUrl?.startsWith('http');

  const hasSpecificMatch = Object.entries(SPECIFIC_COVERS).some(
    ([key]) => title.toLowerCase().includes(key.toLowerCase())
  );

  // Always prioritize our beautiful local specialized covers if a title match is found
  if (hasSpecificMatch) {
    return <BookCoverFallback category={book.category} title={book.title} />;
  }

  // If no cover at all or it's a generic unsplash placeholder that often fails/looks plain
  if (!book.coverUrl || book.coverUrl.includes('unsplash.com')) {
    return <BookCoverFallback category={book.category} title={book.title} />;
  }


  return (
    <img
      src={book.coverUrl}
      alt={book.title}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const parent = target.parentElement;
        if (parent) parent.classList.add('fb-active');
      }}
    />
  );
}

export default function Books() {
  const { data: books, isLoading } = useBooks();
  const createBookMutation = useCreateBook();
  const deleteBookMutation = useDeleteBook();
  const { lang } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [, setLocation] = useLocation();
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBookFile, setSelectedBookFile] = useState<File | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: number; title: string } | null>(null);

  const [newBook, setNewBook] = useState({
    title: "",
    className: "Beginner",
    category: "Tajweed",
    program: "Darse Nizami",
    summary: "",
    pdfUrl: "",
    coverUrl: "",
    language: "English"
  });

  const handleDeleteClick = (e: React.MouseEvent, bookId: number, bookTitle: string) => {
    e.stopPropagation();
    setBookToDelete({ id: bookId, title: bookTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    try {
      await deleteBookMutation.mutateAsync(bookToDelete.id);
      toast({
        title: lang === 'en' ? "Book Deleted" : "کتاب حذف کر دی گئی",
        description: lang === 'en' ? `"${bookToDelete.title}" has been removed from the library.` : `"${bookToDelete.title}" کو لائبریری سے ہٹا دیا گیا ہے۔`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive"
      });
    } finally {
      setBookToDelete(null);
    }
  };

  const categories = ["All", "Tajweed", "Hadith", "Fiqh", "Tafsir", "Seerah", "Arabic", "Aqeedah", "History", "Spirituality"];
  const languages = ["All", "English", "Urdu"];
  const classNames = ["Beginner", "Intermediate", "Advanced", "Masters"];

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalCoverUrl = newBook.coverUrl;
      let finalPdfUrl = newBook.pdfUrl;

      // Handle Cover Upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Cover upload failed");
        const data = await res.json();
        finalCoverUrl = data.url;
      }

      // Handle PDF Upload
      if (selectedBookFile) {
        const formData = new FormData();
        formData.append("file", selectedBookFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("PDF upload failed");
        const data = await res.json();
        finalPdfUrl = data.url;
      }

      await createBookMutation.mutateAsync({
        ...newBook,
        coverUrl: finalCoverUrl || null,
        pdfUrl: finalPdfUrl || null
      });

      toast({
        title: lang === 'en' ? "Book Added" : "کتاب شامل کر دی گئی",
        description: lang === 'en' ? "The new book has been successfully added to the library." : "نئی کتاب کامیابی کے ساتھ لائبریری میں شامل کر دی گئی ہے۔",
      });

      setIsAddModalOpen(false);
      setNewBook({
        title: "",
        className: "Beginner",
        category: "Tajweed",
        program: "Darse Nizami",
        coverUrl: "",
        pdfUrl: "",
        summary: "",
        language: "English"
      });
      setSelectedFile(null);
      setSelectedBookFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredBooks = books?.filter(book => {
    const isDarseNizami = book.program === "Darse Nizami";
    const matchesCategory = activeCategory === "All" ||
      book.category.toLowerCase().trim() === activeCategory.toLowerCase().trim();
    const matchesLanguage = activeLanguage === "All" ||
      (book.language || "English") === activeLanguage;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());
    return isDarseNizami && matchesCategory && matchesLanguage && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const handleRead = (book: any) => {
    setSelectedBook(book);
  };

  const getSampleText = (category: string) => {
    switch (category) {
      case 'Tajweed':
        if (selectedBook?.title.toLowerCase().includes('qaida')) {
          return {
            arabic: "أَ بَ تَ ثَ جَ حَ خَ دَ ذَ رَ زَ سَ شَ صَ ضَ طَ ظَ عَ غَ فَ قَ كَ لَ مَ نَ وَ هَ ءَ يَ",
            urdu: "الف، با، تا، ثا، جیما۔۔۔ یہ حروفِ مفردات تجوید کے ساتھ سیکھنے کا پہلا قدم ہیں۔"
          };
        }
        return {
          arabic: "أَحْكَامُ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ: الإِظْهَارُ، وَالإِدْغَامُ، وَالْإِقْلابُ، وَالْإِخْفَاءُ.",
          urdu: "نون ساکن اور تنوین کے چار احکام ہیں: اظہار، ادغام، اقلاب، اور اخفاء۔"
        };
      case 'Fiqh':
        return {
          arabic: "كِتَابُ الطَّهَارَةِ - قَالَ اللَّهُ تَعَالَى: {يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلاةِ فَاغْسِلُوا وُجُوهَكُمْ...}",
          urdu: "کتاب الطہارۃ - اللہ تعالیٰ نے فرمایا: ”اے ایمان والو! جب تم نماز کے لیے کھڑے ہو تو اپنے چہرے دھو لیا کرو۔۔۔“"
        };
      case 'Tafsir':
        return {
          arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ، وَالصَّلاةُ وَالسَّلامُ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
          urdu: "اللہ کے نام سے شروع جو بڑا مہربان نہایت رحم والا ہے۔ تمام تعریفیں اللہ رب العالمین کے لیے ہیں، درود و سلام ہو ہمارے نبی پر۔"
        };
      case 'Aqeedah':
        return {
          arabic: "الْأَصْلُ الْأَوَّلُ: مَعْرِفَةُ الرَّبِّ - فَإِذَا قِيلَ لَكَ: مَنْ رَبُّكَ؟ فَقُلْ: رَبِّيَ اللَّهُ الَّذِي رَبَّانِي.",
          urdu: "پہلا اصول: رب کی معرفت - اگر آپ سے پوچھا جائے کہ آپ کا رب کون ہے؟ تو کہیں: میرا رب اللہ ہے جس نے میری پرورش کی۔"
        };
      case 'History':
        return {
          arabic: "ذِكْرُ أَخْبَارِ قَوْمِ نُوحٍ عَلَيْهِ السَّلَامُ - وَكَانَ بَيْنَ آدَمَ وَنُوحٍ عَشَرَةُ قُرُونٍ.",
          urdu: "قومِ نوح علیہ السلام کے اخبار کا ذکر - آدم اور نوح علیہما السلام کے درمیان دس صدیاں (یا قرون) کا فاصلہ تھا۔"
        };
      default:
        return {
          arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْHAMDُ لِلَّهِ رَبِّ الْعَالَمِينَ ، وَالصَّلاةُ وَالسَّلامُ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
          urdu: "اللہ کے نام سے شروع جو بڑا مہربان نہایت رحم والا ہے۔ تمام تعریفیں اللہ رب العالمین کے لیے ہیں، درود و سلام ہو ہمارے نبی پر۔"
        };
    }
  };

  const currentSample = selectedBook ? getSampleText(selectedBook.category) : { arabic: "", urdu: "" };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{lang === 'en' ? 'Darse Nizami Library' : 'درس نظامی لائبریری'}</h1>
            <p className="text-muted-foreground text-lg">{lang === 'en' ? 'Authentic Islamic texts for serious students.' : 'طلبہ کے لیے مستند اسلامی کتب۔'}</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-5 transition-all ${activeCategory === cat ? 'shadow-md scale-105' : 'hover:bg-background/80'}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50 ml-2">
              {languages.map((l) => (
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

            {isAdminOrTeacher && (
              <Button
                variant={isManageMode ? "default" : "outline"}
                size="sm"
                className={`rounded-xl px-4 transition-all gap-2 border-primary/20 ${isManageMode ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'hover:bg-primary/10'}`}
                onClick={() => setIsManageMode(!isManageMode)}
              >
                <Plus className="h-4 w-4" />
                {lang === 'en' ? (isManageMode ? 'Exit Manage' : 'Manage Library') : (isManageMode ? 'انتظام ختم کریں' : 'لائبریری کا انتظام')}
              </Button>
            )}

            {isAdminOrTeacher && isManageMode && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl h-11 px-6 shadow-lg bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-5 w-5" />
                    {lang === 'en' ? 'Add Book' : 'کتاب شامل کریں'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                  <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <BookIcon className="h-6 w-6 text-primary" />
                      {lang === 'en' ? 'Add New Book' : 'نئی کتاب شامل کریں'}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {lang === 'en' ? 'Enter book details to expand the Darse Nizami library.' : 'لائبریری میں اضافہ کرنے کے لیے کتاب کی تفصیلات درج کریں۔'}
                    </DialogDescription>
                  </div>
                  <form onSubmit={handleAddBook} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">{lang === 'en' ? 'Book Title' : 'کتاب کا عنوان'}</Label>
                        <Input
                          id="title"
                          required
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          className="rounded-xl h-12"
                          placeholder={lang === 'en' ? "e.g. Al-Qoul al-Sadeed" : "مثلاً القول السدید"}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{lang === 'en' ? 'Class Level' : 'کلاس لیول'}</Label>
                          <Select value={newBook.className} onValueChange={(val) => setNewBook({ ...newBook, className: val })}>
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {classNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{lang === 'en' ? 'Category' : 'زمرہ'}</Label>
                          <Select value={newBook.category} onValueChange={(val) => setNewBook({ ...newBook, category: val })}>
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{lang === 'en' ? 'Program' : 'پروگرام'}</Label>
                          <Select
                            value={newBook.program}
                            onValueChange={(value) => setNewBook({ ...newBook, program: value })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Darse Nizami">Darse Nizami</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{lang === 'en' ? 'Language' : 'زبان'}</Label>
                          <Select
                            value={newBook.language}
                            onValueChange={(value) => setNewBook({ ...newBook, language: value })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Urdu">Urdu</SelectItem>
                              <SelectItem value="Arabic">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="summary">{lang === 'en' ? 'Short Summary' : 'مختصر خلاصہ'}</Label>
                        <Textarea
                          id="summary"
                          value={newBook.summary}
                          onChange={(e) => setNewBook({ ...newBook, summary: e.target.value })}
                          className="rounded-xl min-h-[100px] resize-none"
                          placeholder={lang === 'en' ? "What is this book about?" : "یہ کتاب کس بارے میں ہے؟"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{lang === 'en' ? 'Book File (PDF)' : 'کتاب کی فائل (پی ڈی ایف)'}</Label>
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                          <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              id="bookPdfFile"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => setSelectedBookFile(e.target.files?.[0] || null)}
                            />
                            <Label htmlFor="bookPdfFile" className="cursor-pointer text-sm font-bold text-primary hover:underline">
                              {selectedBookFile ? selectedBookFile.name : (lang === 'en' ? 'Click to upload PDF' : 'پی ڈی ایف اپ لوڈ کرنے کے لیے کلک کریں')}
                            </Label>
                            <p className="text-[10px] text-muted-foreground mt-1">PDF up to 50MB</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">OR URL</span>
                          <Input
                            id="pdfUrl"
                            value={newBook.pdfUrl}
                            onChange={(e) => setNewBook({ ...newBook, pdfUrl: e.target.value })}
                            className="rounded-xl h-12 pl-16 text-xs"
                            placeholder="https://drive.google.com/..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{lang === 'en' ? 'Book Cover' : 'کتاب کا سرورق'}</Label>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5">
                            <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                              <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <input
                                type="file"
                                id="bookCoverFile"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              />
                              <Label htmlFor="bookCoverFile" className="cursor-pointer text-sm font-bold text-primary hover:underline">
                                {selectedFile ? selectedFile.name : (lang === 'en' ? 'Click to upload cover image' : 'سرورق اپ لوڈ کرنے کے لیے کلک کریں')}
                              </Label>
                              <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">OR URL</span>
                            <Input
                              id="coverUrl"
                              value={newBook.coverUrl}
                              onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                              className="rounded-xl h-12 pl-16 text-xs"
                              placeholder="https://images.unsplash.com/..."
                            />
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
                        {isUploading ? (lang === 'en' ? 'Adding...' : 'اضافہ ہو رہا ہے...') : (lang === 'en' ? 'Add Book' : 'کتاب شامل کریں')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={lang === 'en' ? "Search by book title or category..." : "کتاب کا نام یا زمرہ تلاش کریں..."}
              className="pl-12 h-14 rounded-2xl bg-card border-border/60 shadow-sm text-lg focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {
        filteredBooks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{lang === 'en' ? 'No books found' : 'کوئی کتاب نہیں ملی'}</h3>
              <p className="text-muted-foreground">
                {lang === 'en' ? "Try adjusting your search or category filter." : "اپنی تلاش یا زمرہ فلٹر کو تبدیل کرنے کی کوشش کریں۔"}
              </p>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
              {lang === 'en' ? 'Clear all filters' : 'تمام فلٹرز ختم کریں'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks?.map((book, idx) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-500 group border-border/40 overflow-hidden rounded-2xl hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                    {/* Top Cover Section */}
                    <div className="relative aspect-[3/4] overflow-hidden m-4 rounded-[1.5rem] shadow-lg bg-slate-100">
                      <BookImage book={book} />

                      {isAdminOrTeacher && (
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-10 w-10 rounded-xl shadow-xl hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookToDelete({ id: book.id, title: book.title });
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="px-8 pb-8 flex flex-col flex-grow">
                      {/* Metadata Row */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                          {book.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-black text-slate-800 mb-6 leading-tight flex-grow line-clamp-2">
                        {book.title.replace(/([Al|Ar])-([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/\(/g, ' (').trim()}
                      </h3>

                      {/* Button matching reference image */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-[#108a65] hover:bg-[#0d6e51] text-white rounded-xl py-6 text-md font-bold shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-3 transition-all duration-300"
                          onClick={() => setSelectedBook(book)}
                        >
                          <BookOpen className="h-5 w-5" />
                          Open Reader
                        </Button>

                        {isAdmin && isManageMode && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-12 w-12 rounded-xl shrink-0 shadow-lg"
                            onClick={(e) => handleDeleteClick(e, book.id, book.title)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                {lang === 'en' ? 'Delete Book?' : 'کتاب حذف کریں؟'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base leading-relaxed pl-15">
              {lang === 'en'
                ? <span>You are about to permanently delete <strong className="text-foreground">&ldquo;{bookToDelete?.title}&rdquo;</strong>. This action cannot be undone.</span>
                : <span><strong className="text-foreground">&ldquo;{bookToDelete?.title}&rdquo;</strong> کو مستقل طور پر حذف کیا جائے گا۔ یہ عمل واپس نہیں کیا جا سکتا۔</span>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel className="rounded-xl h-11 font-semibold flex-1">
              {lang === 'en' ? 'Cancel' : 'منسوخ کریں'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl h-11 font-bold flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
              onClick={handleDeleteConfirm}
              disabled={deleteBookMutation.isPending}
            >
              {deleteBookMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />
              }
              {lang === 'en' ? 'Delete Book' : 'حذف کریں'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-3xl border-none shadow-2xl">
          <div className="h-32 bg-primary/5 absolute top-0 left-0 w-full z-0" />

          <DialogHeader className="p-8 pt-10 relative z-10 flex-row items-start gap-6">
            <div className="w-28 h-40 shadow-2xl rounded-xl overflow-hidden shrink-0 border-4 border-background mt-[-20px] relative">
              {(selectedBook?.coverUrl && selectedBook?.program !== "Darse Nizami") ? (
                <img
                  src={selectedBook.coverUrl || ""}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) parent.classList.add('fb-active');
                  }}
                />
              ) : (
                <div className="absolute inset-0 h-full">
                  <BookCoverFallback title={selectedBook?.title || ""} category={selectedBook?.category || ""} />
                </div>
              )}
              <div className="absolute inset-0 hidden [.fb-active_&]:block !relative !h-full">
                <BookCoverFallback title={selectedBook?.title || ""} category={selectedBook?.category || ""} />
              </div>
            </div>
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-tighter">
                {selectedBook?.category} • {selectedBook?.className}
              </Badge>
              <DialogTitle className="text-3xl font-extrabold leading-tight text-foreground pr-8">
                {selectedBook?.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium italic flex items-center gap-2">
                <Quote className="h-3 w-3" /> Digital Library Edition
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar relative z-10">
            <div className="prose prose-slate dark:prose-invert max-w-none">

              <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 mb-8">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Book Summary</h4>
                <p className="text-lg leading-relaxed font-medium">
                  {selectedBook?.summary || (lang === 'en'
                    ? "This is a pivotal text in Islamic learning. It provides deep insights and clear guidance."
                    : "یہ اسلامی تعلیم و تعلم کا ایک اہم متن ہے۔ یہ بصیرت اور واضح رہنمائی فراہم کرتا ہے۔")}
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-primary/80">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {lang === 'en' ? 'Digital Book Reader' : 'ڈیجیٹل بک ریڈر'}
                  </h4>

                  <div className="w-full aspect-[3/4] md:aspect-video bg-background rounded-2xl border border-border/40 overflow-hidden shadow-inner relative">
                    {selectedBook?.pdfUrl ? (
                      <iframe
                        src={selectedBook.pdfUrl.includes('archive.org/details/')
                          ? selectedBook.pdfUrl.replace('/details/', '/embed/')
                          : selectedBook.pdfUrl}
                        className="w-full h-full border-none"
                        title={selectedBook.title}
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-muted-foreground">{lang === 'en' ? 'PDF Not Available' : 'پی ڈی ایف دستیاب نہیں ہے'}</p>
                          <p className="text-sm text-muted-foreground/60">{lang === 'en' ? 'This book is coming soon to our digital library.' : 'یہ کتاب جلد ہی ہماری ڈیجیٹل لائبریری میں دستیاب ہوگی۔'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/40 border-t flex items-center justify-between gap-4 relative z-10 rounded-b-3xl">
            <Button variant="outline" className="h-12 rounded-xl flex-1 font-bold border-border/60" onClick={() => setSelectedBook(null)}>
              {lang === 'en' ? 'Close' : 'بند کریں'}
            </Button>

            {selectedBook?.pdfUrl && selectedBook.pdfUrl !== "#" && (
              <Button
                variant="default"
                className="h-12 rounded-xl flex-[2] font-bold shadow-lg gap-2"
                onClick={() => window.open(selectedBook.pdfUrl, "_blank")}
              >
                <ExternalLink className="h-5 w-5" />
                {lang === 'en' ? 'Full Digital Book' : 'مکمل کتاب دیکھیں'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div >
  );
}
