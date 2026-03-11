import { useTheme } from "@/hooks/use-theme";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface CourseHeroProps {
    title: string;
    subtitle: string;
    badgeText: string;
    color: "emerald" | "blue" | "rose" | "violet" | "amber" | "gold";
    illustration?: string;
    children?: React.ReactNode;
}

const COLOR_MAP = {
    emerald: {
        from: "from-emerald-950",
        to: "to-emerald-900",
        accent: "bg-emerald-500",
        badge: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        glow: "emerald-glow",
        border: "border-emerald-500/20"
    },
    blue: {
        from: "from-slate-950",
        to: "to-blue-950",
        accent: "bg-blue-500",
        badge: "text-blue-400 border-blue-500/30 bg-blue-500/10",
        glow: "blue-glow",
        border: "border-blue-500/20"
    },
    rose: {
        from: "from-rose-950",
        to: "to-rose-900",
        accent: "bg-rose-500",
        badge: "text-rose-400 border-rose-500/30 bg-rose-500/10",
        glow: "rose-glow",
        border: "border-rose-500/20"
    },
    violet: {
        from: "from-slate-950",
        to: "to-violet-950",
        accent: "bg-violet-500",
        badge: "text-violet-400 border-violet-500/30 bg-violet-500/10",
        glow: "violet-glow",
        border: "border-violet-500/20"
    },
    amber: {
        from: "from-amber-950",
        to: "to-amber-900",
        accent: "bg-amber-500",
        badge: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        glow: "amber-glow",
        border: "border-amber-500/20"
    },
    gold: {
        from: "from-slate-950",
        to: "to-zinc-900",
        accent: "bg-amber-400",
        badge: "text-amber-400 border-amber-400/30 bg-amber-400/10",
        glow: "amber-glow",
        border: "border-amber-400/20"
    }
};

export default function CourseHero({ title, subtitle, badgeText, color, illustration, children }: CourseHeroProps) {
    const { lang } = useTheme();
    const style = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.emerald;

    return (
        <section className={`relative overflow-hidden rounded-[3rem] bg-gradient-to-br ${style.from} ${style.to} p-8 pt-24 md:p-12 md:pt-32 border ${style.border} shadow-2xl`}>
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Modern Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

                {/* Dynamic Glows */}
                <div className={`absolute top-[-20%] right-[-10%] w-[600px] h-[600px] ${style.accent} rounded-full blur-[120px] opacity-20`} />
                <div className={`absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] ${style.accent} rounded-full blur-[100px] opacity-10`} />

                {/* Main Illustration / Banner */}
                {illustration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute right-0 top-0 h-full w-[100%] lg:w-[70%] z-0"
                    >
                        <div className="relative h-full w-full">
                            {/* Sophisticated Gradient Mask */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${style.from} via-transparent to-transparent z-10 w-[60%]`} />
                            <div className={`absolute inset-0 bg-gradient-to-b ${style.from} via-transparent to-transparent z-10 h-[30%]`} />
                            <div className={`absolute inset-0 bg-gradient-to-t ${style.from} via-transparent to-transparent z-10 h-[30%] top-auto`} />

                            <img
                                src={illustration}
                                alt=""
                                className="h-full w-full object-cover object-right opacity-60 filter saturate-[0.8] brightness-75 lg:brightness-100"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="relative z-20 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-8 text-center md:text-left flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-lg border-white/10 ${style.badge}`}>
                            <Sparkles className="h-3.5 w-3.5 mr-2 animate-pulse" /> {badgeText}
                        </Badge>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl font-medium leading-relaxed drop-shadow-md">
                            {subtitle}
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
                    className="w-full md:w-auto"
                >
                    {children}
                </motion.div>
            </div>

            {/* Bottom Accent Decor */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent`} />
        </section>
    );
}
