import { useTheme } from "@/hooks/use-theme";
import patternHero from "@/assets/images/islamic_pattern_hero.png";

const CSS_THEMES: Record<string, { bg: string; accent: string; icon: string; urdu: string }> = {
    tajweed: { bg: "from-emerald-950 via-emerald-900 to-green-950", accent: "emerald", icon: "🕌", urdu: "تجوید" },
    fiqh: { bg: "from-blue-950 via-indigo-900 to-blue-950", accent: "indigo", icon: "⚖️", urdu: "فقہ" },
    history: { bg: "from-amber-950 via-orange-900 to-amber-950", accent: "amber", icon: "📜", urdu: "تاریخ" },
    arabic: { bg: "from-teal-950 via-teal-900 to-cyan-950", accent: "teal", icon: "🖋️", urdu: "عربی" },
    namaz: { bg: "from-slate-950 via-slate-900 to-black", accent: "slate", icon: "🤲", urdu: "نماز" },
    tafseer: { bg: "from-rose-950 via-red-900 to-rose-950", accent: "rose", icon: "📖", urdu: "تفسیر" },
    hadith: { bg: "from-violet-950 via-purple-900 to-violet-950", accent: "violet", icon: "🏺", urdu: "حدیث" },
    hadees: { bg: "from-violet-950 via-purple-900 to-violet-950", accent: "violet", icon: "🏺", urdu: "حدیث" },
    default: { bg: "from-emerald-950 via-emerald-900 to-green-950", accent: "emerald", icon: "📺", urdu: "لیکچر" },
};

// Madressa logo overlay

interface LectureCoverProps {
    title: string;
    category: string;
    imageUrl?: string;
}

export default function LectureCover({ title, category, imageUrl }: LectureCoverProps) {
    const { lang } = useTheme();
    const themeKey = category.toLowerCase();
    const theme = CSS_THEMES[themeKey] || CSS_THEMES.default;
    const hasRealImage = imageUrl && !imageUrl.includes("unsplash.com") && !imageUrl.includes("placeholder") && imageUrl.length > 10;

    if (hasRealImage) {
        return (
            <div className="w-full h-full relative overflow-hidden group">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <p className="text-white text-sm font-bold leading-tight drop-shadow-md line-clamp-2">
                        {title}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${theme.bg}`}>
            {/* Geometric Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{
                backgroundImage: `url(${patternHero})`,
                backgroundSize: '120px 120px'
            }} />

            <div className="absolute inset-0 opacity-30 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-[40px] border-white/5 rounded-full rotate-45 transform scale-150" />
            </div>


            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-10 text-center">
                <div className="mb-2 text-4xl drop-shadow-2xl filter brightness-125">
                    {theme.icon}
                </div>

                <p className="text-yellow-400/90 font-urdu text-xl mb-1 drop-shadow-md leading-none" dir="rtl">
                    {theme.urdu}
                </p>

                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-4" />

                <h3 className={`text-white font-bold leading-tight drop-shadow-xl line-clamp-3 px-2 ${lang === 'ur' ? 'font-urdu text-lg' : 'text-base tracking-tight'}`}>
                    {title}
                </h3>

                <div className="mt-4 flex items-center gap-2">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-none">
                            Lecture Series
                        </span>
                    </div>
                </div>
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
}
