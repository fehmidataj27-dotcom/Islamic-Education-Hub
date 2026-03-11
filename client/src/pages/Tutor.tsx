import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Bot, User } from "lucide-react";
import { useVoiceRecorder, useVoiceStream } from "@/replit_integrations/audio";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

import { AlertCircle, ExternalLink, MicOff, X } from "lucide-react";

export default function Tutor() {
  const { user } = useAuth();
  const { lang } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'en' ? 'Assalamu Alaikum! I am your Islamic Studies AI Tutor. Ask me about Tajweed, Salah, Quran, the Pillars of Islam, Duas, or any Islamic topic!' : 'السلام علیکم! میں آپ کا اسلامی تعلیم کا AI ٹیوٹر ہوں۔ تجوید، نماز، قرآن، اسلام کے ارکان، دعاؤں یا کسی بھی اسلامی موضوع کے بارے میں پوچھیں!' }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermission, setMicPermission] = useState<PermissionState | 'unknown'>('unknown');
  const [showMicHelper, setShowMicHelper] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  useState(() => {
    setIsIframe(window !== window.parent);
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(status => {
        setMicPermission(status.state);
        status.onchange = () => setMicPermission(status.state);
      });
    }
  });

  const recorder = useVoiceRecorder();
  const stream = useVoiceStream({
    onUserTranscript: (text) => {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    },
    onTranscript: (_, full) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: full }];
        }
        return [...prev, { role: 'assistant', content: full }];
      });
    },
    onComplete: () => setIsProcessing(false),
    onError: () => setIsProcessing(false),
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "JazakAllah Khair for your question. Please try again or ask about a specific Islamic topic." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I could not connect. Please check the server and try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleMicClick = async () => {
    if ((micPermission as any) === 'denied') {
      audioInputRef.current?.click();
      return;
    }

    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      setIsProcessing(true);
      await stream.streamVoiceResponse(`/api/conversations/1/messages`, blob);
    } else {
      try {
        await recorder.startRecording();
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError' || micPermission === 'denied') {
          audioInputRef.current?.click();
        }
      }
    }
  };

  const handleAudioPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      // Send as a message to the tutor
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Sent an audio file: " + file.name }),
      });
      const chatData = await response.json();
      setMessages(prev => [...prev,
      { role: 'user', content: "🎤 Sent voice note: " + file.name },
      { role: 'assistant', content: chatData.answer }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick question chips
  const quickQuestions = [
    "What is Tajweed?",
    "Explain the 5 pillars of Islam",
    "How do I perform Wudu?",
    "What is Zakat?",
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lang === 'en' ? 'AI Islamic Tutor' : 'اسلامی AI ٹیوٹر'}</h1>
          <p className="text-muted-foreground">{lang === 'en' ? 'Ask about Tajweed, Salah, Quran, Islamic history and more.' : 'تجوید، نماز، قرآن، اسلامی تاریخ اور مزید پوچھیں۔'}</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          Islamic Knowledge Base
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-xl bg-background/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 h-10">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Quick question chips */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border/50">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 bg-background border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en' ? "Ask about Islam, Tajweed, Salah..." : "اسلام، تجوید، نماز کے بارے میں پوچھیں..."}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              variant={recorder.state === 'recording' ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleMicClick}
              className={`transition-all duration-200 ${recorder.state === 'recording' ? 'animate-pulse' : ''}`}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button onClick={handleSend} disabled={!input.trim() || isProcessing}>
              <Send className="h-5 w-5" />
            </Button>
            <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioPick} />
          </div>
        </div>
      </Card>

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
                <Button
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg flex gap-2"
                  onClick={() => window.open(window.location.href, '_blank')}
                >
                  <ExternalLink className="h-5 w-5" /> Open in New Tab to Fix
                </Button>
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
                onClick={() => setShowMicHelper(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
