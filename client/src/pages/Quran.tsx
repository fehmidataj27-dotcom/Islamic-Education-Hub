import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Music,
  ChevronDown,
  Loader2,
  Volume2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuranProgress, useUpdateQuranProgress } from "@/hooks/use-resources";
import { useToast } from "@/hooks/use-toast";
import { TAJWEED_RULES } from "@/data/tajweed-data";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { TajweedText } from "@/components/TajweedText";
import logoImg from "@/assets/images/wajiha-logo.png";

interface Ayah {
  number: number;
  text: string;
  tajweedText?: string;
  translation?: string;
  urduTranslation?: string;
  audio?: string;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export default function Quran() {
  const { lang } = useTheme();
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [ayabs, setAyas] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio] = useState(new Audio());

  // Reading Mode State
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [hideArabic, setHideArabic] = useState(false);
  const [hideTranslation, setHideTranslation] = useState(false);
  const [isWordByWordMode, setIsWordByWordMode] = useState(false);

  const { toast } = useToast();
  const { data: quranProgress } = useQuranProgress();
  const updateProgressMutation = useUpdateQuranProgress();

  useEffect(() => {
    if (quranProgress && quranProgress.length > 0) {
      if (selectedSurah) {
        const surahAyahs = quranProgress.filter(p => p.surah === selectedSurah.number);
        const uniqueMemorizedCount = new Set(surahAyahs.filter(p => p.status === 'memorized').map(p => p.ayah)).size;
        setProgress(Math.round((uniqueMemorizedCount / selectedSurah.numberOfAyahs) * 100));
      }
    }
  }, [quranProgress, selectedSurah]);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(res => res.json())
      .then(data => {
        setSurahs(data.data);
        const fatihah = data.data.find((s: SurahInfo) => s.number === 1);
        if (fatihah) setSelectedSurah(fatihah);
      });
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      setLoading(true);
      const fetchSurahData = async () => {
        try {
          const [arabicRes, transRes, urduTransRes, tajweedRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/ar.alafasy`),
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.asad`),
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/ur.jalandhry`),
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/quran-tajweed`)
          ]);

          const arabicData = await arabicRes.json();
          const transData = await transRes.json();
          const urduTransData = await urduTransRes.json();
          const tajweedData = await tajweedRes.json();

          const combinedAyabs = arabicData.data.ayahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            tajweedText: tajweedData.data.ayahs[index].text,
            translation: transData.data.ayahs[index].text,
            urduTranslation: urduTransData.data.ayahs[index].text,
            audio: ayah.audio
          }));

          setAyas(combinedAyabs);
        } catch (error) {
          console.error("Error fetching surah:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSurahData();
    }
  }, [selectedSurah]);

  const toggleAudio = (index: number, audioUrl: string) => {
    if (isPlaying === index) {
      audio.pause();
      setIsPlaying(null);
    } else {
      audio.src = audioUrl;
      audio.play();
      setIsPlaying(index);
      audio.onended = () => setIsPlaying(null);
    }
  };

  const isMemorized = (ayahNumber: number) => {
    return quranProgress?.some(p => p.surah === selectedSurah?.number && p.ayah === ayahNumber && p.status === 'memorized');
  };

  const markMemorized = async (ayahNumber: number) => {
    if (!selectedSurah) return;
    const currentlyMemorized = isMemorized(ayahNumber);
    const newStatus = currentlyMemorized ? 'reading' : 'memorized';
    try {
      await updateProgressMutation.mutateAsync({
        surah: selectedSurah.number,
        ayah: ayahNumber,
        status: newStatus
      });
      toast({
        title: currentlyMemorized ? "Removed from memory" : "Progress saved",
        description: currentlyMemorized ? `Ayah ${ayahNumber} marked as reading.` : `Ayah ${ayahNumber} marked as memorized!`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save progress"
      });
    }
  };

  return (
    <div className="space-y-8 pb-20 relative min-h-screen">
      <div className="absolute inset-x-0 -top-40 h-[600px] z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('/src/assets/images/arabesque_divider.png')", backgroundSize: '600px' }} />

      {/* Branded Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 bg-card/70 backdrop-blur-md p-6 md:p-8 rounded-[3rem] border-2 border-primary/20 shadow-2xl">
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
          >
            <img src={logoImg} alt="Hafiza Wajiha" className="w-full h-full object-contain mix-blend-multiply" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="brand-text-premium text-2xl">Hafiza Wajiha</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-primary leading-none mt-1">
              {lang === 'en' ? 'Quran & Tajweed' : 'قرآن و تجوید'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-0.5 w-6 bg-amber-500/50" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                {lang === 'en' ? 'Sacred Recitation Hub' : 'تلاوت کا مرکز'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[220px] h-14 rounded-2xl justify-between shadow-xl border-2 border-primary/10 bg-background/50 hover:bg-background hover:border-primary/30 transition-all group">
                <span className="font-bold text-base">{selectedSurah ? `${selectedSurah.number}. ${selectedSurah.englishName}` : 'Select Surah'}</span>
                <ChevronDown className="ml-2 h-5 w-5 opacity-30 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[400px] overflow-y-auto w-[220px] rounded-3xl p-3 shadow-3xl border-2 border-primary/10">
              {surahs.map(surah => (
                <DropdownMenuItem
                  key={surah.number}
                  onClick={() => setSelectedSurah(surah)}
                  className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-primary/10 transition-colors mb-1"
                >
                  <span className="text-primary/40 mr-3 w-6">{surah.number}.</span> {surah.englishName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-6 bg-white shadow-xl px-8 py-3 rounded-2xl border-2 border-primary/10">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">{lang === 'en' ? 'Hifz Progress' : 'حفظ کی پیشرفت'}</p>
              <p className="text-2xl font-black text-primary leading-none mt-1">{progress}%</p>
            </div>
            <div className="w-24 h-3 bg-primary/5 rounded-full overflow-hidden border border-primary/10 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          <Button
            size="icon"
            variant="outline"
            className={`rounded-2xl h-14 w-14 border-2 transition-all shadow-xl ${isReadingMode ? 'bg-primary text-white border-primary emerald-glow' : 'bg-background/50 border-primary/10'}`}
            onClick={() => setIsReadingMode(!isReadingMode)}
            title={isReadingMode ? "Exit Reading Mode" : "Enter Reading Mode"}
          >
            {isReadingMode ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 pt-4 max-w-[1600px] mx-auto w-full">
        {/* Main Reading Area */}
        <div className="flex-1 min-w-0 space-y-12">
          <Card className="group border-none shadow-3xl overflow-hidden bg-white/70 backdrop-blur-sm rounded-[3.5rem] relative w-full">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none bg-no-repeat bg-contain translate-x-12 -translate-y-12" style={{ backgroundImage: "url('/src/assets/images/arabesque_divider.png')" }} />

            <CardHeader className="bg-primary/5 border-b border-primary/10 py-10 px-10 md:px-16">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="px-5 py-2 bg-amber-500 text-emerald-950 text-[11px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20">
                      Chapter {selectedSurah?.number}
                    </div>
                    <CardTitle className="text-4xl md:text-5xl font-black text-primary tracking-tighter">
                      {selectedSurah?.englishName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-primary/40 tracking-wider">/</span>
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.3em] flex items-center gap-3">
                      {selectedSurah?.numberOfAyahs} Divine Verses
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-quran text-3xl text-primary/80 normal-case tracking-normal pt-1">{selectedSurah?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <AnimatePresence>
                    {isRevisionMode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-6 bg-white shadow-2xl px-6 py-3 rounded-3xl border border-primary/20"
                      >
                        <div className="flex items-center space-x-3">
                          <Switch id="hide-arabic" checked={hideArabic} onCheckedChange={setHideArabic} />
                          <Label htmlFor="hide-arabic" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Arabic</Label>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div className="flex items-center space-x-3">
                          <Switch id="hide-translation" checked={hideTranslation} onCheckedChange={setHideTranslation} />
                          <Label htmlFor="hide-translation" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Urdu/En</Label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    size="icon"
                    variant={isRevisionMode ? "default" : "outline"}
                    className={`rounded-2xl h-14 w-14 shadow-2xl transition-all border-2 ${isRevisionMode ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 blue-glow' : 'bg-white hover:bg-gray-50 border-primary/10'}`}
                    onClick={() => {
                      setIsRevisionMode(!isRevisionMode);
                      if (isRevisionMode) {
                        setHideArabic(false);
                        setHideTranslation(false);
                      }
                    }}
                  >
                    {isRevisionMode ? <EyeOff className="h-6 w-6 text-white" /> : <Eye className="h-6 w-6 text-primary/60" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-40 gap-8 text-muted-foreground">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <BookOpen className="h-10 w-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="font-black tracking-[0.4em] uppercase text-[10px] text-primary">Establishing Connection</p>
                    <p className="text-sm font-medium opacity-60">Retrieving Sacred Knowledge...</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {ayabs.map((ayah, idx) => (
                      <motion.div
                        key={`${selectedSurah?.number}-${ayah.number}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.6 }}
                        className="group/ayah p-6 md:p-10 hover:bg-emerald-50/30 transition-all duration-500 relative scroll-mt-20"
                      >
                        <div className="absolute left-10 top-16 flex flex-col items-center gap-4">
                          <div className="w-14 h-14 mihrab-shape bg-gray-50 flex items-center justify-center text-xs font-black text-primary/30 group-hover/ayah:bg-primary group-hover/ayah:text-white transition-all shadow-inner">
                            {ayah.number}
                          </div>
                          <div className="w-px h-20 bg-gradient-to-b from-primary/20 to-transparent" />
                        </div>

                        <div className="space-y-6 max-w-5xl mx-auto">
                          {/* Arabic Text Section */}
                          <div className={`text-center space-y-8 transition-all duration-[800ms] ${isRevisionMode && hideArabic ? 'blur-[30px] grayscale opacity-10 select-none scale-95 pointer-events-none' : 'scale-100 opacity-100'}`}>
                            {isWordByWordMode ? (
                              <div className="flex flex-wrap gap-x-5 gap-y-10 justify-center" dir="rtl">
                                {ayah.text.split(' ').map((word, wIdx) => (
                                  <motion.span
                                    key={wIdx}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="text-3xl md:text-4xl font-quran bg-white hover:bg-emerald-50 px-5 py-3 rounded-[2rem] cursor-pointer transition-all shadow-xl border-2 border-primary/5 hover:border-primary/20"
                                  >
                                    {word}
                                  </motion.span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-4xl md:text-5xl font-quran leading-[1.8] text-gray-900 font-medium drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] selection:bg-amber-200" dir="rtl">
                                {ayah.tajweedText ? (
                                  <TajweedText text={ayah.tajweedText} />
                                ) : (
                                  ayah.text
                                )}
                              </div>
                            )}
                          </div>

                          {/* Translation and Controls Section */}
                          <div className={`space-y-12 transition-all duration-[800ms] ${isRevisionMode && hideTranslation ? 'blur-[15px] opacity-10 select-none pointer-events-none' : 'opacity-100'}`}>
                            <div className="space-y-8">
                              <div className="relative">
                                <div className="absolute -left-10 top-0 w-1 h-full bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 rounded-full" />
                                <p className="text-2xl md:text-3xl font-urdu leading-[2.2] text-center text-emerald-950/80 px-4 md:px-0" dir="rtl">
                                  {ayah.urduTranslation}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-0.5 bg-gray-100" />
                                <p className="text-base md:text-xl text-gray-400 font-medium leading-[1.8] text-center max-w-4xl mx-auto italic transition-all group-hover/ayah:text-gray-600">
                                  "{ayah.translation}"
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
                              <Button
                                variant={isPlaying === idx ? "default" : "secondary"}
                                size="sm"
                                className={`h-9 px-4 rounded-xl gap-2 shadow-md transition-all duration-500 hover:-translate-y-0.5 border-none ${isPlaying === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'}`}
                                onClick={() => ayah.audio && toggleAudio(idx, ayah.audio)}
                              >
                                {isPlaying === idx ? (
                                  <div className="flex gap-1 items-end h-5">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-1 bg-white animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />)}
                                  </div>
                                ) : (
                                  <Play className="h-5 w-5 fill-current" />
                                )}
                                <span className="font-black uppercase tracking-[0.2em] text-[11px]">
                                  {lang === 'en' ? (isPlaying === idx ? 'Playing' : 'Play') : (isPlaying === idx ? 'جاری ہے' : 'سنیں')}
                                </span>
                              </Button>

                              <Button
                                variant={isMemorized(ayah.number) ? "default" : "outline"}
                                size="sm"
                                className={`h-9 px-4 rounded-xl gap-2 transition-all duration-500 hover:-translate-y-0.5 border-2 shadow-md ${isMemorized(ayah.number) ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' : 'bg-white border-primary/10 hover:border-primary hover:bg-primary/5 text-gray-600'}`}
                                onClick={() => markMemorized(ayah.number)}
                                disabled={updateProgressMutation.isPending}
                              >
                                <CheckCircle2 className={`h-5 w-5 ${isMemorized(ayah.number) ? 'text-white' : 'text-emerald-500'}`} />
                                <span className="font-black uppercase tracking-[0.2em] text-[11px]">
                                  {isMemorized(ayah.number) ? (lang === 'en' ? 'Memorized' : 'حفظ شدہ') : (lang === 'en' ? 'I know' : 'حفظ ہے')}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sticky Right Sidebar for Tajweed and Tools */}
        <AnimatePresence>
          {!isReadingMode && (
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="lg:w-[400px] flex flex-col gap-8 shrink-0 pb-10"
            >
              <div className="sticky top-24 space-y-8">
                {/* Tools Sidebar Card */}
                <Card className="shadow-3xl rounded-[3.5rem] border-none overflow-hidden bg-emerald-950 relative">
                  <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/tajweed_sidebar_bg.png')" }} />
                  <div className="absolute inset-0 bg-islamic-subtle opacity-10" />
                  <CardHeader className="border-b border-white/10 py-8 px-8 relative z-10">
                    <CardTitle className="text-xl font-black text-white flex items-center gap-4">
                      <div className="w-14 h-14 rounded-3xl bg-amber-500 text-emerald-950 flex items-center justify-center shadow-xl shadow-amber-500/20">
                        <Settings2 className="h-7 w-7" />
                      </div>
                      <div>
                        {lang === 'en' ? 'Learning Tools' : 'سیکھنے کے اوزار'}
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/60 mt-1">Interactive Education</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 gap-6 relative z-10">
                    <Button
                      variant="outline"
                      className={`h-28 flex-row justify-start gap-5 rounded-[2.5rem] transition-all duration-500 border-2 border-dashed relative overflow-hidden group/tool px-8 ${isWordByWordMode ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-white/10 bg-white/5 text-emerald-100/60 hover:bg-white/10 hover:border-amber-500/50'}`}
                      onClick={() => setIsWordByWordMode(!isWordByWordMode)}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${isWordByWordMode ? 'bg-amber-500 text-emerald-950 shadow-xl shadow-amber-500/40' : 'bg-white/10 text-amber-500'}`}>
                        <Volume2 className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[11px] font-black uppercase tracking-[0.3em]">{lang === 'en' ? 'Word by Word' : 'لفظ بہ لفظ'}</span>
                        <span className="text-[9px] opacity-40 font-medium uppercase tracking-widest mt-1 block">Detailed breakdown</span>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className={`h-28 flex-row justify-start gap-5 rounded-[2.5rem] transition-all duration-500 border-2 border-dashed relative overflow-hidden group/tool px-8 ${isRevisionMode ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-white/5 text-emerald-100/60 hover:bg-white/10 hover:border-primary/50'}`}
                      onClick={() => {
                        const newMode = !isRevisionMode;
                        setIsRevisionMode(newMode);
                        if (newMode) setHideArabic(true);
                        else {
                          setHideArabic(false);
                          setHideTranslation(false);
                        }
                      }}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${isRevisionMode ? 'bg-primary text-white shadow-xl shadow-primary/40' : 'bg-white/10 text-primary'}`}>
                        <RotateCcw className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="block text-[11px] font-black uppercase tracking-[0.3em]">{lang === 'en' ? 'Revision Mode' : 'نظر ثانی'}</span>
                        <span className="text-[9px] opacity-40 font-medium uppercase tracking-widest mt-1 block">Active recall mode</span>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Tajweed Rules Card */}
                <Card className="bg-white border-none shadow-3xl overflow-hidden rounded-[3.5rem] relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.05] pointer-events-none rotate-90" style={{ backgroundImage: "url('/src/assets/images/arabesque_divider.png')", backgroundSize: 'contain' }} />
                  <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50 py-8 px-8">
                    <CardTitle className="text-xl flex items-center gap-4 font-black text-indigo-900 tracking-tight">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
                        <Music className="h-6 w-6" />
                      </div>
                      <div>
                        {lang === 'en' ? 'Tajweed Rules' : 'تجوید کے قواعد'}
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400 mt-1">Rules of Recitation</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {TAJWEED_RULES.map((rule) => (
                      <motion.div
                        key={rule.name}
                        whileHover={{ y: -5 }}
                        className="p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200 transition-all duration-500 group/rule flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${rule.color.replace('text-', 'bg-')} shadow-sm opacity-60`} />
                            <h4 className={`font-black uppercase tracking-[0.1em] text-[10px] ${rule.color}`}>{rule.name}</h4>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed mb-3">{rule.description}</p>
                        <p className="text-lg font-urdu text-right border-r-4 border-indigo-100 pr-3 leading-loose mb-3" dir="rtl">{rule.descriptionUrdu}</p>
                        {rule.letters && (
                          <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
                            {rule.letters.map(l => (
                              <span key={l} className={`h-8 w-8 rounded-lg bg-white flex items-center justify-center font-quran text-lg ${rule.color} font-black shadow-sm border border-gray-50 hover:-translate-y-1 transition-all`}>{l}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
