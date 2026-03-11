import { useTheme } from "@/hooks/use-theme";
import { virtualTours } from "@/data/mockData";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Maximize2 } from "lucide-react";

export default function VirtualTours() {
    const { lang } = useTheme();

    const t = {
        title: lang === 'en' ? '360° Virtual Tours' : '360° ورچوئل ٹور',
        explore: lang === 'en' ? 'Start Tour' : 'ٹیور شروع کریں',
        immersive: lang === 'en' ? 'Immersive Experience' : 'عمیق تجربہ',
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Compass className="h-10 w-10 text-primary animate-pulse" />
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
                {virtualTours.map((tour: any) => (
                    <Card
                        key={tour.id}
                        className="overflow-hidden border-2 border-transparent hover:border-primary/40 transition-all group relative bg-card shadow-lg hover:shadow-2xl duration-500 rounded-3xl"
                    >
                        <a
                            href={tour.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img
                                    src={tour.image}
                                    alt={tour.title[lang]}
                                    className="object-cover w-full h-full brightness-[0.85] group-hover:brightness-100 group-hover:scale-110 transition-all duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="bg-white/10 backdrop-blur-md rounded-full p-6 border border-white/20 shadow-2xl group-hover:scale-125 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                                        <Compass className="h-8 w-8 text-white group-hover:text-primary transition-colors" />
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap drop-shadow-lg">
                                            {tour.isLive ? (lang === 'en' ? 'Live Stream' : 'لائیو اسٹریم') : t.immersive}
                                        </span>
                                    </div>
                                </div>
                                <Badge className={`absolute top-4 right-4 border-none shadow-lg gap-2 ${tour.isLive ? 'bg-red-600 animate-pulse' : 'bg-primary'} text-white`}>
                                    {tour.isLive ? (
                                        <>
                                            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                                            {lang === 'en' ? 'LIVE NOW' : 'ابھی براہ راست'}
                                        </>
                                    ) : '360° VR'}
                                </Badge>
                            </div>

                            <CardHeader className="pt-6">
                                <div className="flex justify-between items-start gap-4">
                                    <CardTitle className="text-2xl font-black text-primary tracking-tight leading-tight group-hover:text-primary/80 transition-colors">
                                        {tour.title[lang]}
                                    </CardTitle>
                                    <Maximize2 className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:rotate-90 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                </div>
                                <CardDescription className="text-base mt-3 font-medium leading-relaxed text-muted-foreground">
                                    {tour.description[lang]}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter className="pb-8 pt-2">
                                <Button
                                    className={`w-full h-14 text-lg font-bold rounded-2xl ${tour.isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg shadow-primary/20 transition-all group-hover:scale-[1.02] active:scale-[0.98] gap-3 pointer-events-none`}
                                >
                                    <Compass className="h-6 w-6 animate-pulse" />
                                    {tour.isLive ? (lang === 'en' ? 'Watch Now' : 'ابھی دیکھیں') : t.explore}
                                </Button>
                            </CardFooter>
                        </a>
                    </Card>
                ))}
            </div>
        </div>
    );
}
