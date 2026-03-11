import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useCreateWisdom, useAllWisdom } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Send, History, Quote, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function WisdomManager() {
    const { user } = useAuth();
    const { lang } = useTheme();
    const { toast } = useToast();
    const createWisdom = useCreateWisdom();
    const { data: wisdomList } = useAllWisdom();
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    const isAdminOrTeacher = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';

    if (!isAdminOrTeacher) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await createWisdom.mutateAsync({
                content,
                author: author || (lang === 'en' ? "Anonymous" : "گمنام"),
            });
            toast({
                title: lang === 'en' ? "Wisdom Shared" : "حکمت شیئر ہو گئی",
                description: lang === 'en' ? "Daily reflective wisdom has been updated." : "روزانہ کی حکمت اپ ڈیٹ کر دی گئی ہے۔",
            });
            setContent("");
            setAuthor("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to post wisdom",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="border-none bg-emerald-950 shadow-3xl rounded-[3rem] overflow-hidden group/card relative min-h-[320px]">
            <div className="absolute inset-0 bg-islamic-subtle opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="p-8 pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-8 bg-amber-500/30" />
                            <CardTitle className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em]">
                                {lang === 'en' ? "Compose Wisdom" : "حکمت تحریر کریں"}
                            </CardTitle>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? <Send className="h-4 w-4" /> : <History className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 relative z-10 flex flex-col h-full">
                <AnimatePresence mode="wait">
                    {!showHistory ? (
                        <motion.form
                            key="compose"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleSubmit}
                            className="space-y-4 flex-1 flex flex-col"
                        >
                            <div className="relative group flex-1">
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={lang === 'en' ? "What inspires you today?" : "آج کی بصیرت لکھیں..."}
                                    className={cn(
                                        "min-h-[120px] bg-white/5 border-white/5 rounded-2xl focus:ring-amber-500/20 focus:border-amber-500/40 text-emerald-50 text-base p-5 leading-relaxed shadow-inner border transition-all resize-none italic",
                                        lang === 'ur' && "font-urdu text-right text-2xl md:text-3xl leading-[2.2]"
                                    )}
                                />
                                <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
                                    <Quote className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder={lang === 'en' ? "Author / Source" : "مصنف کا نام"}
                                    className={cn(
                                        "h-12 bg-white/5 border-white/5 rounded-xl focus:ring-amber-500/20 focus:border-amber-500/40 px-5 text-emerald-200/60 font-medium shadow-inner border",
                                        lang === 'ur' && "font-urdu text-right text-lg"
                                    )}
                                />
                                <Button
                                    disabled={!content.trim() || createWisdom.isPending}
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-xs uppercase tracking-[0.2em] gap-3 shadow-lg shadow-amber-500/10 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                >
                                    {createWisdom.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {lang === 'en' ? "Publish" : "شائع کریں"}
                                </Button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                        >
                            {!wisdomList || wisdomList.length === 0 ? (
                                <div className="text-center py-10 opacity-20">
                                    <p className="text-white text-[10px] font-bold uppercase tracking-widest italic">Locked in time.</p>
                                </div>
                            ) : (
                                wisdomList.map((w: any, idx) => (
                                    <div key={w.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <p className={cn(
                                            "text-emerald-50/80 leading-relaxed font-medium text-sm italic",
                                            lang === 'ur' && "font-urdu text-right text-xl leading-[2.2]"
                                        )}>
                                            "{w.content}"
                                        </p>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{new Date(w.createdAt).toLocaleDateString()}</span>
                                            <span className={cn("text-amber-500/60 font-black text-[10px]", lang === 'ur' && "font-urdu text-xs")}>— {w.author}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
