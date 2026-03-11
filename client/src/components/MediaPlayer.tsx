import { X, Play, Pause, Volume2, Maximize, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

interface MediaPlayerProps {
    url: string;
    title: string;
    onClose: () => void;
}

export default function MediaPlayer({ url, title, onClose }: MediaPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isAudioOnly, setIsAudioOnly] = useState(false);

    useEffect(() => {
        // Check if file is audio based on extension
        const extension = url.split('.').pop()?.toLowerCase();
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
            setIsAudioOnly(true);
        } else {
            setIsAudioOnly(false);
        }
    }, [url]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    const handleSliderChange = (value: number[]) => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            videoRef.current.currentTime = (value[0] / 100) * duration;
            setProgress(value[0]);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        if (videoRef.current) {
            const newVolume = value[0] / 100;
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-5xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-primary/20"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-primary/10">
                    <h3 className="font-bold text-lg truncate pr-8">{title}</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className={`relative ${isAudioOnly ? 'bg-primary/5 py-20 flex items-center justify-center' : 'aspect-video bg-black'}`}>
                    {isAudioOnly ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                <Volume2 className="h-12 w-12 text-primary" />
                            </div>
                            <p className="text-muted-foreground font-medium italic">Audio Lecture Playing...</p>
                        </div>
                    ) : null}

                    <video
                        ref={videoRef}
                        src={url}
                        className={`w-full h-full ${isAudioOnly ? 'hidden' : 'block'}`}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onClick={togglePlay}
                    />

                    <AnimatePresence>
                        {showControls && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2"
                            >
                                <div className="flex items-center gap-4 text-white">
                                    <Button variant="ghost" size="icon" onClick={togglePlay} className="hover:bg-white/20 text-white">
                                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                                    </Button>

                                    <Slider
                                        value={[progress]}
                                        max={100}
                                        step={0.1}
                                        onValueChange={handleSliderChange}
                                        className="flex-1 cursor-pointer"
                                    />

                                    <div className="flex items-center gap-2 group relative">
                                        <Button variant="ghost" size="icon" onClick={toggleMute} className="hover:bg-white/20 text-white">
                                            {isMuted ? <Volume2 className="h-5 w-5 opacity-50" /> : <Volume2 className="h-5 w-5" />}
                                        </Button>
                                        <div className="hidden group-hover:block absolute bottom-full pb-2 mb-2 w-32 left-1/2 -translate-x-1/2">
                                            <div className="bg-popover p-2 rounded-lg shadow-lg border border-border">
                                                <Slider
                                                    value={[volume * 100]}
                                                    max={100}
                                                    onValueChange={handleVolumeChange}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="icon" onClick={handleRestart} className="hover:bg-white/20 text-white">
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>

                                    {!isAudioOnly && (
                                        <Button variant="ghost" size="icon" onClick={handleFullscreen} className="hover:bg-white/20 text-white">
                                            <Maximize className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
