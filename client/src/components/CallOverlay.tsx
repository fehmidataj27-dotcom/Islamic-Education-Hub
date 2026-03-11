import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    Video,
    X,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Video as VideoIcon,
    VideoOff,
    PhoneOff,
    Maximize2,
    MessageSquare,
    Shield,
    Lock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CallOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientAvatar?: string;
    callType: 'audio' | 'video';
}

export default function CallOverlay({ isOpen, onClose, recipientName, recipientAvatar, callType }: CallOverlayProps) {
    const [status, setStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Mock call progress
    useEffect(() => {
        if (!isOpen) {
            setStatus('ringing');
            setDuration(0);
            return;
        }

        const ringTimeout = setTimeout(() => {
            setStatus('connected');
        }, 3000);

        return () => clearTimeout(ringTimeout);
    }, [isOpen]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Camera access for video call
    useEffect(() => {
        if (isOpen && callType === 'video' && !isCameraOff) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error("Camera access error:", err));
        } else if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, [isOpen, callType, isCameraOff]);

    const formatDuration = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        setStatus('ended');
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl"
                >
                    <div className="relative w-full h-full md:w-[450px] md:h-[800px] md:rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col items-center justify-between py-16 px-8 select-none">

                        {/* ── Background (Video or Gradient) ── */}
                        {callType === 'video' ? (
                            <div className="absolute inset-0 z-0">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                <div className="absolute inset-0 bg-black/30" />
                                {isCameraOff && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                        <Avatar className="h-40 w-40 border-4 border-emerald-500/20">
                                            <AvatarFallback className="text-6xl bg-emerald-950 text-emerald-500 font-black">{recipientName[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#075e54] via-[#054d44] to-[#043d36]">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        )}

                        {/* ── Header ── */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative z-10 text-center space-y-3 w-full"
                        >
                            <div className="flex items-center justify-center gap-2 text-white/40 mb-1">
                                <Lock className="h-3 w-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">End-to-End Encrypted</span>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl">{recipientName}</h2>
                            <p className="text-sm font-black text-emerald-400 uppercase tracking-widest drop-shadow-lg">
                                {status === 'ringing' ? 'Ringing...' : status === 'ended' ? 'Call Ended' : formatDuration(duration)}
                            </p>
                        </motion.div>

                        {/* ── Center Piece (Avatar for Voice) ── */}
                        <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
                            {callType === 'audio' && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-[-40px] rounded-full border border-emerald-500/10 animate-[ping_4s_infinite]" />
                                    <div className="absolute inset-[-20px] rounded-full border border-emerald-500/20 animate-[ping_3s_infinite]" />
                                    <Avatar className="h-48 w-48 border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 transition-transform active:scale-95 duration-500">
                                        <AvatarImage src={recipientAvatar} />
                                        <AvatarFallback className="text-6xl bg-emerald-800/20 text-white font-black drop-shadow-xl backdrop-blur-md">
                                            {recipientName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            )}

                            {callType === 'video' && status === 'connected' && (
                                <motion.div
                                    drag
                                    dragConstraints={{ left: -100, right: 100, top: -200, bottom: 200 }}
                                    className="absolute bottom-10 right-0 w-36 h-52 rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-xl z-20 cursor-move transition-shadow hover:shadow-emerald-500/20"
                                >
                                    {/* Small local preview would go here in real app, showing recipient for mock */}
                                    <Avatar className="w-full h-full rounded-none">
                                        <AvatarFallback className="text-3xl bg-black text-emerald-500 font-black">
                                            {recipientName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                        <span className="text-[9px] font-black text-white uppercase tracking-wider">{recipientName}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* ── Footer Controls ── */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative z-20 w-full flex flex-col items-center gap-10 pb-4"
                        >
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`h-16 w-16 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-white hover:bg-white/10'}`}
                                >
                                    {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                    className={`h-16 w-16 rounded-full text-white hover:bg-white/10 transition-all ${!isSpeakerOn ? 'opacity-40' : 'bg-white/5 shadow-inner'}`}
                                >
                                    {isSpeakerOn ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7" />}
                                </Button>

                                {callType === 'video' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsCameraOff(!isCameraOff)}
                                        className={`h-16 w-16 rounded-full transition-all duration-300 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-white hover:bg-white/10'}`}
                                    >
                                        {isCameraOff ? <VideoOff className="h-7 w-7" /> : <VideoIcon className="h-7 w-7" />}
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-16 w-16 rounded-full text-white hover:bg-white/10 transition-all opacity-40 hover:opacity-100"
                                >
                                    <MessageSquare className="h-7 w-7" />
                                </Button>
                            </div>

                            {/* End Call Button */}
                            <Button
                                onClick={handleEndCall}
                                className="h-24 w-24 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all active:scale-95 group border-4 border-white/5 active:rotate-12"
                            >
                                <PhoneOff className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-500" />
                            </Button>
                        </motion.div>

                        {/* ── Status Bar Mock ── */}
                        <div className="absolute top-8 w-full px-16 flex justify-between items-center opacity-40 pointer-events-none">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div className="w-2 h-2 bg-white/40 rounded-full" />
                                <div className="w-2 h-2 bg-white/20 rounded-full" />
                            </div>
                            <div className="text-[11px] font-black text-white/50 tracking-tighter uppercase tabular-nums">12:30 PM</div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
