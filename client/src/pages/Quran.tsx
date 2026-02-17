import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle2, BookOpen, Music } from "lucide-react";
import { motion } from "framer-motion";

export default function Quran() {
  const { lang } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const ayahs = [
    { id: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { id: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" },
    { id: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{lang === 'en' ? 'Quran & Tajweed' : 'قرآن و تجوید'}</h1>
          <p className="text-muted-foreground">{lang === 'en' ? 'Master your recitation with proper Tajweed.' : 'درست تجوید کے ساتھ اپنی تلاوت میں مہارت حاصل کریں۔'}</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-sm font-medium">{lang === 'en' ? 'Hifz Progress' : 'حفظ کی پیشرفت'}</p>
             <p className="text-2xl font-bold text-primary">{progress}%</p>
           </div>
           <Progress value={progress} className="w-32 h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Surah Al-Fatihah
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button size="icon" variant="ghost">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {ayahs.map((ayah) => (
              <motion.div 
                key={ayah.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 text-center"
              >
                <p className="text-4xl md:text-5xl font-arabic leading-[1.8] text-foreground rtl" dir="rtl">
                  {ayah.arabic}
                </p>
                <p className="text-muted-foreground italic">
                  {lang === 'en' ? ayah.translation : 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔'}
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-7">
                    {lang === 'en' ? 'Repeat' : 'دہرائیں'}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-7">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {lang === 'en' ? 'Memorized' : 'حفظ ہو گیا'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Music className="h-5 w-5 text-secondary-foreground" />
                {lang === 'en' ? 'Tajweed Rules' : 'تجوید کے قواعد'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-xl border border-border">
                <h4 className="font-bold text-primary mb-1">Qalqalah</h4>
                <p className="text-sm text-muted-foreground">The vibration of sound at the end of a letter.</p>
                <div className="mt-2 flex gap-2">
                  {['ق', 'ط', 'ب', 'ج', 'د'].map(l => (
                    <span key={l} className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-arabic text-primary font-bold">{l}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border">
                <h4 className="font-bold text-blue-600 mb-1">Ghunnah</h4>
                <p className="text-sm text-muted-foreground">The nasal sound produced through the nose.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{lang === 'en' ? 'Learning Tools' : 'سیکھنے کے اوزار'}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs">{lang === 'en' ? 'Checklist' : 'فہرست'}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <RotateCcw className="h-5 w-5 text-blue-500" />
                <span className="text-xs">{lang === 'en' ? 'Revision' : 'دہرائی'}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
