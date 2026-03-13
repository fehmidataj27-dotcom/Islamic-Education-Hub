import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreVertical, Phone, Video, Loader2, MessageSquare, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mic, Paperclip, X, StopCircle, Play, Pause, Search, CircleDashed, Plus, FileText, AlertCircle, MicOff, ExternalLink, Info, Reply, CornerUpLeftIcon, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useToast } from "@/hooks/use-toast";
import CallOverlay from "@/components/CallOverlay";
import VoicePlayer from "@/components/VoicePlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceRecorder } from "@/replit_integrations/audio/useVoiceRecorder";
import { useAudioPlayback } from "@/replit_integrations/audio/useAudioPlayback";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Award, Trophy, Star, Crown, Zap } from "lucide-react";
import { useAchievements, useUserAchievements } from "@/hooks/use-resources";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

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

const MOCK_CALLS = [
    { id: 1, name: "Api Jan Hafiza Wajiha", type: "incoming", callType: "video", time: "2:30 PM", status: "missed" },
    { id: 2, name: "Admin Office", type: "outgoing", callType: "audio", time: "Yesterday", status: "completed" },
    { id: 3, name: "Islamic Hub Main Group", type: "incoming", callType: "audio", time: "Monday", status: "completed" },
];

const MOCK_STATUSES = [
    { id: 1, name: "My Status", time: "Tap to add", avatar: "", isSelf: true },
    { id: 2, name: "Api Jan Hafiza Wajiha", time: "12 minutes ago", avatar: "📖", isNew: true },
    { id: 3, name: "Admin Office", time: "2 hours ago", avatar: "🕌", isNew: false },
    { id: 4, name: "Islamic Hub Main Group", time: "Today, 10:15 AM", avatar: "✨", isNew: true },
];

const blobToBase64 = (blob: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export default function Communication() {
    const { lang } = useTheme();
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');
    const [activeSidebarTab, setActiveSidebarTab] = useState<'chats' | 'status' | 'calls'>('chats');
    const [searchQuery, setSearchQuery] = useState("");
    const [typingStatus, setTypingStatus] = useState<string>('Online');
    const [isStatusViewOpen, setIsStatusViewOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown');
    const [isIframe, setIsIframe] = useState(false);

    const { useConversations, useConversation, useSendMessage, useCreateConversation, useDeleteMessage } = useChat();
    const { data: conversations, isLoading: loadingConvs } = useConversations();
    const { data: activeConv, isLoading: loadingMessages } = useConversation(selectedId);
    const sendMessageMutation = useSendMessage();
    const createConversationMutation = useCreateConversation();
    const deleteMessageMutation = useDeleteMessage();

    // Group Creation State
    const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState("");
    const [newGroupCategory, setNewGroupCategory] = useState("general");

    // Achievements data for 'Award' icon
    const { data: allAchievements } = useAchievements();
    const { data: userAchievements } = useUserAchievements();

    // Voice recording
    const { state: recordingState, startRecording, stopRecording } = useVoiceRecorder();
    const isRecording = recordingState === "recording";
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showMicHelper, setShowMicHelper] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);

    useEffect(() => {
        if (isRecording) {
            setRecordingSeconds(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds(s => s + 1);
            }, 1000);
        } else {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setRecordingSeconds(0);
        }
        return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
    }, [isRecording]);

    useEffect(() => {
        setIsIframe(window !== window.parent);
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
                setMicPermission(status.state);
                status.onchange = () => setMicPermission(status.state);
            });
        }
    }, []);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (!isMobile && conversations && conversations.length > 0 && selectedId === null) {
            setSelectedId(conversations[0].id);
        }
    }, [conversations, selectedId]);

    const t = {
        title: lang === 'en' ? 'Communication Portal' : 'رابطہ پورٹل',
        search: lang === 'en' ? 'Search contacts...' : 'رابطے تلاش کریں...',
        type: lang === 'en' ? 'Type a message...' : 'پیغام لکھیں...',
        sending: lang === 'en' ? 'Sending...' : 'بھیج رہا ہے...',
        error: lang === 'en' ? 'Failed to send message' : 'پیغام بھیجنے میں ناکامی',
        chats: lang === 'en' ? 'Chats' : 'چیٹس',
        calls: lang === 'en' ? 'Calls' : 'کالز',
        status: lang === 'en' ? 'Status' : 'سٹیٹس',
        featureComing: lang === 'en' ? 'This feature is coming soon!' : 'یہ فیچر جلد آ رہا ہے!',
    };

    const handleSendMessage = async (e?: React.FormEvent, content?: string, fileType?: string, fileUrl?: string, audio?: string) => {
        if (e) e.preventDefault();
        const finalContent = content || inputValue.trim();
        if (!finalContent && !fileUrl && !audio) return;
        if (!selectedId || sendMessageMutation.isPending) return;

        try {
            await sendMessageMutation.mutateAsync({
                conversationId: selectedId,
                content: finalContent,
                fileType,
                fileUrl,
                audio,
                replyToId: replyingTo?.id,
                replyToContent: replyingTo?.content,
                replyToAuthor: replyingTo?.role === 'user' ? (user?.username || 'You') : activeConv?.title
            });
            setInputValue("");
            setReplyingTo(null);
        } catch (error: any) {
            toast({
                title: t.error,
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        if (!selectedId) return;
        setTypingStatus('Online');
        const interval = setInterval(() => {
            const statuses = ['Online', 'Typing...', 'Online', 'Online'];
            setTypingStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            handleSendMessage(undefined, file.name, file.type.startsWith('image') ? 'image' : 'file', data.url);
        } catch (err) {
            toast({ title: "Upload failed", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleVoiceRecord = async () => {
        if (!selectedId) return;

        // Check for secure context if browsers block it
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            toast({
                title: "Security Block",
                description: "Browsers require a secure HTTPS connection for microphone access. Please use https or localhost.",
                variant: "destructive"
            });
            return;
        }

        if ((micPermission as any) === 'denied') {
            audioInputRef.current?.click();
            return;
        }

        try {
            if (isRecording) {
                const blob = await stopRecording();
                if (blob.size < 100) return; // Ignore very short/empty recordings

                const extension = blob.type.includes('mp4') ? 'm4a' :
                    blob.type.includes('webm') ? 'webm' :
                        blob.type.includes('ogg') ? 'ogg' : 'wav';

                const formData = new FormData();
                formData.append('file', blob, `voice - ${Date.now()}.${extension} `);

                setIsUploading(true);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();

                // Also convert to base64 for transcription
                const audioBase64 = await blobToBase64(blob);
                handleSendMessage(undefined, "Voice Message", 'voice', data.url, audioBase64);
            } else {
                await startRecording();
            }
        } catch (err: any) {
            console.error("Recording error:", err);

            // If the error is a permission error, automatically fall back to upload
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError' || micPermission === 'denied') {
                toast({
                    title: "Switching to Voice Upload",
                    description: isIframe ? "Replit prevents live recording. Select an audio file instead." : "Microphone access denied. Select an audio file instead.",
                    variant: "default"
                });
                audioInputRef.current?.click();
                return;
            }

            toast({
                title: "Microphone Error",
                description: err.name === 'NotFoundError' ? "No microphone found." : "Could not start recording.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAudioPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            // Also convert to base64 for transcription
            const audioBase64 = await blobToBase64(file);
            handleSendMessage(undefined, "Voice Message", 'voice', data.url, audioBase64);

            toast({ title: "Voice note uploaded successfully" });
        } catch (err) {
            toast({ title: "Upload failed", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (audioInputRef.current) audioInputRef.current.value = '';
        }
    };

    const cancelRecording = async () => {
        await stopRecording();
    };

    const startCall = (type: 'audio' | 'video') => {
        setCallType(type);
        setIsCallOpen(true);
    };

    const messages = activeConv?.messages || [];

    return (
        <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-2rem)] w-full rounded-[1.5rem] md:rounded-[2rem] border-none bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col md:flex-row md:-mt-6">
            {/* Sidebar / Contact List */}
            <div className={`w-full md:w-[400px] lg:w-[450px] border-r border-zinc-100 dark:border-zinc-800 flex-col bg-[#f0f2f5] dark:bg-zinc-900/50 shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 bg-[#f0f2f5] dark:bg-zinc-900 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                                <AvatarFallback className="bg-zinc-200 text-zinc-600 font-bold uppercase">{user?.username?.[0] || 'A'}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-500 tracking-tight">Chats</h2>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                onClick={() => setIsNewGroupOpen(true)}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                onClick={() => toast({ title: "Settings", description: "Chat preferences and group settings." })}
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-emerald-600" />
                        <Input
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-zinc-800 border-none rounded-2xl h-12 pl-12 placeholder:text-zinc-400 shadow-sm focus-visible:ring-emerald-500/30 text-base"
                        />
                    </div>
                </div>

                <div className="px-3 pb-2 bg-[#f0f2f5] dark:bg-zinc-900">
                    <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-2xl gap-1">
                        <Button
                            variant={activeSidebarTab === 'chats' ? 'default' : 'ghost'}
                            size="sm"
                            className={`flex-1 rounded-xl h-9 font-black text-xs uppercase tracking-widest transition-all ${activeSidebarTab === 'chats' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-zinc-500'}`}
                            onClick={() => setActiveSidebarTab('chats')}
                        >
                            {t.chats}
                        </Button>
                        <Button
                            variant={activeSidebarTab === 'status' ? 'default' : 'ghost'}
                            size="sm"
                            className={`flex-1 rounded-xl h-9 font-black text-xs uppercase tracking-widest transition-all ${activeSidebarTab === 'status' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-zinc-500'}`}
                            onClick={() => setActiveSidebarTab('status')}
                        >
                            {t.status}
                        </Button>
                        <Button
                            variant={activeSidebarTab === 'calls' ? 'default' : 'ghost'}
                            size="sm"
                            className={`flex-1 rounded-xl h-9 font-black text-xs uppercase tracking-widest transition-all ${activeSidebarTab === 'calls' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-zinc-500'}`}
                            onClick={() => setActiveSidebarTab('calls')}
                        >
                            {t.calls}
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 bg-white dark:bg-zinc-950">
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-900 pb-20">
                        {activeSidebarTab === 'chats' ? (
                            loadingConvs ? (
                                <div className="flex flex-col items-center justify-center p-12 gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 opacity-40" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/30">Loading your hub...</p>
                                </div>
                            ) : (conversations?.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())) || []).map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => setSelectedId(contact.id)}
                                    className={`group flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 border-l-4 ${selectedId === contact.id ? 'bg-emerald-600/5 dark:bg-emerald-400/5 border-emerald-600 shadow-[inset_0_0_20px_rgba(16,185,129,0.03)]' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-transparent'}`}
                                >
                                    <div className="relative shrink-0 transition-transform group-hover:scale-105">
                                        <Avatar className={`h-15 w-15 border-2 shadow-md transition-all ${selectedId === contact.id ? 'border-emerald-500 scale-105' : 'border-white dark:border-zinc-800'}`}>
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 font-black text-xl">{contact.title[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0.5 right-0.5 w-4.5 h-4.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-black text-[17px] truncate tracking-tight transition-colors ${selectedId === contact.id ? 'text-emerald-900 dark:text-emerald-50' : 'text-zinc-800 dark:text-zinc-100'}`}>{contact.title}</span>
                                                {contact.title.includes("Wajiha") && <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[9px] font-black uppercase px-2 py-0.5 border-none">Ustazah</Badge>}
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">10:45 AM</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs font-bold truncate max-w-[200px] transition-colors ${selectedId === contact.id ? 'text-emerald-600/70' : 'text-zinc-400'}`}>
                                                {contact.title.includes("Admin") ? "Admin • Support Team" :
                                                    contact.title.includes("Staff") || contact.title.includes("Teachers") ? "🔒 Official • Teachers Only" :
                                                        contact.title.includes("Main") ? "📢 Community • 50+ New" :
                                                            contact.title.includes("Ustazah") ? "🎓 Instructor • Active" : "Student Hub • Group"}
                                            </p>
                                            {contact.id === 1 && <Badge className="h-5 min-w-[22px] rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center p-0 border-none shadow-lg animate-bounce">2</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : activeSidebarTab === 'status' ? (
                            <div className="space-y-1 pt-2">
                                {MOCK_STATUSES.map((status) => (
                                    <div
                                        key={status.id}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl cursor-pointer transition-all mx-2"
                                        onClick={() => {
                                            if (!status.isSelf) {
                                                setSelectedStatus(status);
                                                setIsStatusViewOpen(true);
                                            }
                                        }}
                                    >
                                        <div
                                            className={`relative p-[3px] rounded-full border-2 ${status.isSelf ? 'border-zinc-100' : status.isNew ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-zinc-200'}`}
                                            onClick={() => {
                                                if (status.isSelf) {
                                                    toast({
                                                        title: "Post a Status",
                                                        description: "This feature allows you to share blessed updates with your contacts. Implementation in progress.",
                                                        variant: "default"
                                                    });
                                                }
                                            }}
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-xl">{status.avatar || "👤"}</AvatarFallback>
                                            </Avatar>
                                            {status.isSelf && (
                                                <div className="absolute bottom-0 right-0 bg-emerald-600 rounded-full border-2 border-white dark:border-zinc-950 p-1 shadow-md">
                                                    <Plus className="h-3 w-3 text-white stroke-[4]" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">{status.name}</h4>
                                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tighter">{status.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            MOCK_CALLS.map((call) => (
                                <div
                                    key={call.id}
                                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-all border-l-4 border-transparent"
                                >
                                    <Avatar className="h-14 w-14 border-2 border-white dark:border-zinc-800 shadow-sm shrink-0">
                                        <AvatarFallback className="bg-zinc-100 text-zinc-600 font-black">{call.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100">{call.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {call.status === 'missed' ? <PhoneMissed className="h-3 w-3 text-red-500" /> :
                                                call.type === 'incoming' ? <PhoneIncoming className="h-3 w-3 text-emerald-500" /> :
                                                    <PhoneOutgoing className="h-3 w-3 text-blue-500" />}
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">{call.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="rounded-full text-emerald-600" onClick={(e) => { e.stopPropagation(); startCall(call.callType as 'audio' | 'video'); }}>
                                            {call.callType === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col ${!selectedId ? 'hidden md:flex' : 'flex'} bg-zinc-50 dark:bg-zinc-950 h-full relative`}>
                {/* Abstract Premium Background */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] bg-repeat" />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                {selectedId ? (
                    <>
                        <div className="h-24 p-6 border-b border-white/20 dark:border-zinc-800 flex justify-between items-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl z-20 shrink-0 shadow-sm">
                            <div className="flex items-center gap-5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden rounded-full hover:bg-white/50 dark:hover:bg-zinc-800 transition-colors"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <X className="h-6 w-6 text-emerald-800 dark:text-emerald-100" />
                                </Button>
                                <div className="relative">
                                    <Avatar className="h-14 w-14 md:h-16 md:w-16 border-4 border-white dark:border-zinc-800 shadow-2xl cursor-pointer transition-all hover:scale-110 active:scale-95 ring-2 ring-emerald-500/20">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white font-black text-xl shadow-inner">{activeConv?.title?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full shadow-lg shadow-emerald-500/40 animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="font-black text-2xl text-emerald-950 dark:text-emerald-50 leading-none tracking-tight drop-shadow-sm">{activeConv?.title}</h3>
                                        {activeConv?.title?.includes("Wajiha") && (
                                            <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[9px] font-black uppercase px-2.5 py-1 shadow-lg shadow-amber-500/20 border-none">
                                                Main Teacher
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="flex gap-0.5 items-end h-2.5 mb-0.5">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`w-0.5 bg-emerald-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s`, height: `${40 + (i * 20)}%` }} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                                            {typingStatus === 'Typing...' ? (
                                                <span className="text-emerald-500 animate-pulse italic">typing message...</span>
                                            ) : (
                                                'Online & Secured'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-black/20 p-1.5 rounded-full border border-white/20">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-400 transition-all duration-300" onClick={() => startCall('audio')}><Phone className="h-5 w-5 stroke-[2.5]" /></Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-400 transition-all duration-300" onClick={() => startCall('video')}><Video className="h-5 w-5 stroke-[2.5]" /></Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-12 w-12 rounded-full transition-all ${isInfoOpen ? 'bg-emerald-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-transparent hover:border-emerald-100'}`}
                                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                                >
                                    <MoreVertical className="h-6 w-6 stroke-[2.5]" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea
                            className="flex-1 p-6 lg:p-10 relative z-10"
                            style={{
                                background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(220, 210, 200, 0.4) 100%)`,
                            }}
                        >
                            <div className="space-y-6 max-w-5xl mx-auto">
                                <div className="flex justify-center my-6">
                                    <span className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm text-zinc-500 dark:text-zinc-400">Today</span>
                                </div>

                                {loadingMessages ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-emerald-600 opacity-50" /></div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg: any) => {
                                        const isMe = msg.role === 'user' || msg.role === 'student' || msg.role === user?.firstName;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}>
                                                <div className={`relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%] px-4 py-3 rounded-2xl shadow-md transition-all ${isMe
                                                    ? 'bg-[#dcf8c6] dark:bg-emerald-900/40 text-gray-800 dark:text-emerald-50 rounded-tr-none'
                                                    : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 rounded-tl-none'
                                                    } `}>

                                                    {/* Reply Preview inside bubble */}
                                                    {msg.replyToContent && (
                                                        <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 border-emerald-500 text-xs">
                                                            <p className="font-black text-emerald-600 truncate">{msg.replyToAuthor || "Replied Message"}</p>
                                                            <p className="opacity-60 truncate">{msg.replyToContent}</p>
                                                        </div>
                                                    )}

                                                    {/* Message actions (Hidden until hover) */}
                                                    <div className={`absolute top-2 ${isMe ? '-left-10' : '-right-10'} opacity-0 group-hover/msg:opacity-100 transition-opacity flex flex-col gap-1`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-800/80 shadow-sm text-zinc-500 hover:text-emerald-600"
                                                            onClick={() => setReplyingTo(msg)}
                                                        >
                                                            <Reply className="h-4 w-4" />
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-800/80 shadow-sm text-zinc-500 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align={isMe ? "start" : "end"}>
                                                                <DropdownMenuItem
                                                                    className="text-xs font-bold"
                                                                    onClick={() => deleteMessageMutation.mutate({ messageId: msg.id, conversationId: selectedId!, mode: 'me' })}
                                                                >
                                                                    Delete for me
                                                                </DropdownMenuItem>
                                                                {(isMe || user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') && (
                                                                    <DropdownMenuItem
                                                                        className="text-xs font-bold text-red-600"
                                                                        onClick={() => deleteMessageMutation.mutate({ messageId: msg.id, conversationId: selectedId!, mode: 'everyone' })}
                                                                    >
                                                                        Delete for everyone
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* WhatsApp bubble tail */}
                                                    <div className={`absolute top-0 w-4 h-4 overflow-hidden ${isMe ? '-right-2' : '-left-2'}`}>
                                                        <div className={`w-4 h-4 rotate-45 shadow-sm ${isMe ? 'bg-[#dcf8c6] dark:bg-emerald-800 -translate-x-2' : 'bg-white dark:bg-zinc-800 translate-x-0'}`} />
                                                    </div>

                                                    {msg.fileType === 'voice' ? (
                                                        <VoicePlayer url={msg.fileUrl} id={msg.id} />
                                                    ) : msg.fileType === 'image' ? (
                                                        <div className="space-y-2">
                                                            <div className="rounded-xl overflow-hidden border border-black/5 shadow-inner" onClick={() => window.open(msg.fileUrl, '_blank')}>
                                                                <img src={msg.fileUrl} className="max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" alt="attachment" />
                                                            </div>
                                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[16px] font-medium leading-[1.6] tracking-normal whitespace-pre-wrap">{msg.content}</p>
                                                    )}

                                                    <div className="flex items-center gap-1.5 mt-2 justify-end opacity-60">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mr-1">
                                                            {isMe ? 'Me' : msg.role === 'assistant' ? 'Assistant' : msg.role}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">
                                                            {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                                                        </span>
                                                        {isMe && <span className="text-[10px] text-blue-500 font-black ml-1">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/40 max-w-lg mx-auto shadow-2xl">
                                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                                            <MessageSquare className="h-10 w-10 text-emerald-600 opacity-60" />
                                        </div>
                                        <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-100 mb-2">Assalamu Alaikum!</h4>
                                        <p className="text-sm font-bold text-emerald-900/40 uppercase tracking-widest text-center px-8 leading-relaxed">No messages in this chat yet.<br />Start your journey with a greeting.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-t border-white/20 dark:border-zinc-800 shrink-0 relative z-20">
                            {/* Reply Preview Area */}
                            {replyingTo && (
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 animate-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex items-start justify-between gap-3 max-w-5xl mx-auto">
                                        <div className="flex-1 border-l-4 border-emerald-500 pl-3 py-1 bg-white/50 dark:bg-black/20 rounded-r-lg">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Replying to {replyingTo.role === 'user' ? 'You' : 'Teacher'}</p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{replyingTo.content}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                            onClick={() => setReplyingTo(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="p-4">
                                <form className="flex items-center gap-3 max-w-5xl mx-auto" onSubmit={(e) => handleSendMessage(e)}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 rounded-full h-11 w-11 transition-all"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            <Paperclip className="h-5.5 w-5.5" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 relative flex items-center group">
                                        <Input
                                            placeholder={sendMessageMutation.isPending ? t.sending : t.type}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="bg-white dark:bg-zinc-800 border-none rounded-full h-12 pl-6 pr-12 shadow-sm font-medium text-[15px] focus-visible:ring-emerald-500/20"
                                            disabled={sendMessageMutation.isPending || isRecording}
                                        />
                                        {isRecording && (
                                            <div className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full flex items-center px-6 gap-4 border-2 border-red-500/20 z-10">
                                                <div className="h-3 w-3 bg-red-500 rounded-full animate-ping" />
                                                <span className="text-sm font-black text-red-600 tracking-wider uppercase">{recordingSeconds}s Recording...</span>
                                                <div className="ml-auto flex items-center gap-4">
                                                    <div className="flex items-end gap-0.5 h-3">
                                                        {[1, 2, 3, 4, 1].map((h, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 animate-pulse`}
                                                                style={{ height: `${Math.random() * 100}%` }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        onClick={cancelRecording}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all">
                                                    <Award className="h-6 w-6" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[320px] p-0 rounded-[2rem] border-none shadow-2xl overflow-hidden mb-4" side="top" align="end">
                                                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                            <Trophy className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-lg leading-none">Spiritual Progress</h4>
                                                            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 mt-1">Saut-ul-Quran Achievements</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-xs font-black uppercase tracking-tighter">Points Earned</span>
                                                            <span className="text-2xl font-black tabular-nums">
                                                                {userAchievements?.reduce((sum, ua) => {
                                                                    const a = allAchievements?.find(ac => ac.id === ua.achievementId);
                                                                    return sum + (a?.points ?? 0);
                                                                }, 0) || 0}
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={((userAchievements?.length || 0) / (allAchievements?.length || 1)) * 100}
                                                            className="h-2 bg-white/20"
                                                        />
                                                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest text-right">
                                                            {userAchievements?.length || 0} / {allAchievements?.length || 0} Badges Unlocked
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-zinc-900">
                                                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 px-2">Recent Milestones</h5>
                                                    <div className="space-y-2">
                                                        {userAchievements?.slice(-3).reverse().map((ua) => {
                                                            const a = allAchievements?.find(ac => ac.id === ua.achievementId);
                                                            return (
                                                                <div key={ua.id} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                                        <Star className="h-4 w-4 text-amber-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 truncate">{a?.title}</p>
                                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">+{a?.points} Points Received</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {(!userAchievements || userAchievements.length === 0) && (
                                                            <div className="text-center py-6">
                                                                <Zap className="h-8 w-8 text-zinc-200 mx-auto mb-2" />
                                                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed">No badges yet.<br />Keep learning to earn points!</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full mt-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => window.location.href = '/achievements'}
                                                    >
                                                        View Leaderboard <Crown className="h-3 w-3 ml-2" />
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioPick} />

                                    {inputValue.trim() || isUploading ? (
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 h-12 w-12 shadow-xl shrink-0 transition-transform active:scale-95"
                                            disabled={sendMessageMutation.isPending || isUploading}
                                        >
                                            {sendMessageMutation.isPending || isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Send className="h-6 w-6 text-white translate-x-0.5" />}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="icon"
                                            className={`rounded-full h-12 w-12 shadow-xl shrink-0 transition-all active:scale-90 relative ${isRecording ? 'bg-red-500 animate-pulse' :
                                                micPermission === 'denied' ? 'bg-amber-500 hover:bg-amber-600' :
                                                    'bg-emerald-600 hover:bg-emerald-700'
                                                }`}
                                            onClick={handleVoiceRecord}
                                        >
                                            {isRecording ? <StopCircle className="h-7 w-7 text-white" /> : (
                                                <>
                                                    {micPermission === 'denied' ? <FileText className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-white" />}
                                                    {micPermission === 'denied' && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-400 border-2 border-white rounded-full p-1 shadow-sm">
                                                            <Paperclip className="h-2 w-2 text-white" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400 opacity-[0.03] blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 opacity-[0.03] blur-[100px] rounded-full animate-pulse delay-700" />

                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-emerald-500 opacity-20 blur-3xl rounded-full animate-pulse" />
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-zinc-800 flex items-center justify-center relative z-10 shadow-2xl border-4 border-emerald-50/50 transition-transform hover:scale-105 duration-500 cursor-default">
                                <MessageSquare className="h-16 w-16 text-emerald-600 drop-shadow-sm" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl z-20">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        <div className="text-center z-10">
                            <h2 className="text-5xl font-black text-emerald-950 dark:text-emerald-50 mb-4 tracking-tighter">
                                Saut-ul-Quran <span className="text-emerald-600">Portal</span>
                            </h2>
                            <p className="text-[13px] font-black text-zinc-400 uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed mb-10 mx-auto">
                                Start your secure spiritual journey<br />with a blessed conversation.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Badge variant="outline" className="px-6 py-3 rounded-2xl border-2 bg-white/50 backdrop-blur-md dark:bg-zinc-800/50 text-[11px] font-black uppercase flex gap-3 shadow-sm border-emerald-100/50 transition-all hover:border-emerald-500/50">
                                    <Shield className="h-4 w-4 text-emerald-600" /> End-to-End Encrypted
                                </Badge>
                                <Badge variant="outline" className="px-6 py-3 rounded-2xl border-2 bg-emerald-600 text-white text-[11px] font-black uppercase flex gap-3 shadow-lg shadow-emerald-500/20 border-none transition-transform hover:scale-105">
                                    <Award className="h-4 w-4 text-white" /> High Reliability
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-16 text-zinc-300 dark:text-zinc-700 animate-bounce cursor-pointer" onClick={() => setActiveSidebarTab('chats')}>
                            <Search className="h-6 w-6" />
                        </div>
                    </div>
                )}
                {selectedId && isInfoOpen && (
                    <div className="w-[300px] border-l border-zinc-100 dark:border-zinc-800 bg-[#f8f9fa] dark:bg-zinc-900 p-6 flex flex-col items-center shrink-0 animate-in slide-in-from-right duration-300 overflow-y-auto">
                        <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-800 shadow-2xl mb-6">
                            <AvatarFallback className="bg-emerald-600 text-white text-4xl font-black">{activeConv?.title?.[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 text-center mb-1">{activeConv?.title}</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">+92 300 1234567</p>

                        <div className="w-full space-y-4">
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-sm">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">About & Status</h4>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Dedicated Quran teacher with 10+ years of experience in Tajweed and Hifz.</p>
                            </div>

                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-sm">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Academic Role</h4>
                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-none font-bold uppercase text-[9px]">Lead Ustazah</Badge>
                            </div>

                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-[1.5rem] shadow-sm">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Security</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600">
                                    <Shield className="h-3 w-3" /> E2E ENCRYPTED
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full mt-auto text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest"
                            onClick={() => toast({ title: "Security Action", description: "User blocking is handled by administrative oversight safely.", variant: "destructive" })}
                        >
                            Block User
                        </Button>
                    </div>
                )}
            </div>

            {/* Status View Overlay */}
            {isStatusViewOpen && selectedStatus && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-6 right-6 h-12 w-12 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                        onClick={() => setIsStatusViewOpen(false)}
                    >
                        <X className="h-8 w-8" />
                    </Button>
                    <div className="w-full max-w-lg aspect-[9/16] bg-zinc-900 rounded-[3rem] relative overflow-hidden shadow-2xl border-4 border-white/10">
                        <div className="absolute top-0 left-0 right-0 p-1 flex gap-1">
                            <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white animate-[progress_5s_linear_forwards]" />
                            </div>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                <AvatarFallback className="bg-emerald-600 text-white font-black">{selectedStatus.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-white">
                                <p className="font-black text-sm">{selectedStatus.name}</p>
                                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{selectedStatus.time}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-emerald-600/20 flex items-center justify-center mb-6 mx-auto">
                                    <Star className="h-12 w-12 text-emerald-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">New Lesson Added!</h3>
                                <p className="text-sm font-bold text-white/60 leading-relaxed uppercase tracking-widest">Surah Al-Mulk - Verse 1 to 5 Tafseer is now live in the portal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CallOverlay
                isOpen={isCallOpen}
                onClose={() => setIsCallOpen(false)}
                recipientName={activeConv?.title || "User"}
                callType={callType}
            />

            {/* Mic Help Button - Prominent for better UX */}
            {micPermission === 'denied' && (
                <div className="fixed bottom-24 right-8 z-[50]">
                    <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full shadow-2xl gap-2 font-black text-[10px] uppercase pr-4 animate-bounce border-2 border-white dark:border-zinc-800"
                        onClick={() => setShowMicHelper(true)}
                    >
                        <AlertCircle className="h-4 w-4" /> Unblock Mic
                    </Button>
                </div>
            )}

            {/* Mic Helper Modal */}
            {showMicHelper && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                            <MicOff className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-black text-center text-zinc-900 dark:text-zinc-100 mb-2">Microphone Blocked</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm font-medium mb-8 leading-relaxed">
                            {isIframe
                                ? "You are using the Replit Preview window. For security, browsers block recording here. Please click 'Open in New Tab' to fix this."
                                : "Your browser has blocked the microphone. Click the Lock (🔒) icon in your address bar and set Microphone to 'Allow'."}
                        </p>

                        <div className="space-y-3">
                            {isIframe ? (
                                <>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-800">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                                            <ExternalLink className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Recording is blocked in this preview box. Click the small square icon with an arrow in the top-right of this window or the button below.</p>
                                    </div>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg flex gap-2"
                                        onClick={() => {
                                            const url = window.location.href;
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }}
                                    >
                                        <ExternalLink className="h-5 w-5" /> Open in New Tab to Fix
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase tracking-widest text-[11px]"
                                    onClick={() => setShowMicHelper(false)}
                                >
                                    Got It, I'll Try Now
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full text-zinc-400 font-bold uppercase tracking-widest text-[10px] h-12"
                                onClick={() => {
                                    setShowMicHelper(false);
                                    audioInputRef.current?.click();
                                }}
                            >
                                Send Voice File Instead
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* New Group Dialog */}
            <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                            <Plus className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Create New Group</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-medium">
                            {lang === 'en' ? 'Organize your community with a new chat group.' : 'نئے چیٹ گروپ کے ساتھ اپنی کمیونٹی کو منظم کریں۔'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6 font-primary">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 px-1">Group Name</Label>
                            <Input
                                placeholder="e.g. Hifz Morning Batch"
                                value={newGroupTitle}
                                onChange={(e) => setNewGroupTitle(e.target.value)}
                                className="h-14 rounded-2xl border-none bg-zinc-100 dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500/20 text-base font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 px-1">Group Category</Label>
                            <Select value={newGroupCategory} onValueChange={setNewGroupCategory}>
                                <SelectTrigger className="h-14 rounded-2xl border-none bg-zinc-100 dark:bg-zinc-800 font-bold text-base focus:ring-2 focus:ring-emerald-500/20">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl">
                                    <SelectItem value="general" className="font-bold py-3">General Community (Everyone)</SelectItem>
                                    <SelectItem value="student" className="font-bold py-3">Student Hub (Students Only)</SelectItem>
                                    <SelectItem value="teacher" className="font-bold py-3">Teacher's Lounge (Teachers Only)</SelectItem>
                                    <SelectItem value="parent" className="font-bold py-3">Parent Connect (Parents Only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsNewGroupOpen(false)}
                            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                            disabled={!newGroupTitle.trim() || createConversationMutation.isPending}
                            onClick={() => {
                                createConversationMutation.mutate({
                                    title: newGroupTitle,
                                    category: newGroupCategory
                                }, {
                                    onSuccess: (data) => {
                                        toast({ title: "Group Created! ✅", description: `${newGroupTitle} has been created in ${newGroupCategory} category.` });
                                        setIsNewGroupOpen(false);
                                        setNewGroupTitle("");
                                        setSelectedId(data.id);
                                    }
                                });
                            }}
                        >
                            {createConversationMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
