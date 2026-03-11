import { useState, useRef, useEffect } from "react";
import { Play, Pause, ExternalLink, Mic, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const VoiceWaveform = ({ active }: { active: boolean }) => (
    <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3, 4, 1].map((h, i) => (
            <div
                key={i}
                className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 ${active ? 'animate-pulse' : ''}`}
                style={{ height: active ? `${Math.random() * 100}%` : `${h * 20}%` }}
            />
        ))}
    </div>
);

interface VoicePlayerProps {
    url: string;
    id: string | number;
}

export default function VoicePlayer({ url, id }: VoicePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.error("Playback failed:", err);
                toast({
                    title: "Playback Blocked",
                    description: "Your browser blocked the audio. Try clicking 'Open' to listen in a new tab.",
                    variant: "destructive"
                });
            });
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 min-w-[280px] p-1">
            <div className="flex flex-col gap-1 items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600 scale-105 shadow-red-500/20' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-zinc-400 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            if (!isPlaying) {
                                audioRef.current.play().then(() => setIsPlaying(true));
                            }
                        }
                    }}
                    title="Restart"
                >
                    <RotateCcw className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex-1 pt-1 group/voice">
                <div
                    className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full mb-1.5 overflow-hidden relative cursor-pointer group/progress border border-black/5 dark:border-white/5"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        if (audioRef.current && audioRef.current.duration) {
                            audioRef.current.currentTime = percent * audioRef.current.duration;
                        }
                    }}
                >
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 6px)` }} />
                </div>

                <audio
                    ref={audioRef}
                    src={url}
                    className="hidden"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                        setIsPlaying(false);
                        setProgress(0);
                    }}
                    onError={() => {
                        setIsPlaying(false);
                        console.error("Audio Load Error");
                    }}
                />

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                        <span>{isPlaying ? 'Playing' : formatTime(duration) || 'Voice Note'}</span>
                        <VoiceWaveform active={isPlaying} />
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`voice-note-${id}.webm`}
                            className="flex items-center gap-1 hover:text-emerald-600 transition-colors p-1"
                            onClick={(e) => e.stopPropagation()}
                            title="Download/Open in new tab"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
