import { useState } from "react";
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

export default function Tutor() {
  const { user } = useAuth();
  const { lang } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'en' ? 'Assalamu Alaikum! How can I help you with your studies today?' : 'السلام علیکم! آج میں آپ کی پڑھائی میں کس طرح مدد کر سکتا ہوں؟' }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const recorder = useVoiceRecorder();
  const stream = useVoiceStream({
    onUserTranscript: (text) => {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    },
    onTranscript: (_, full) => {
      // Update the last assistant message or add a new one
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
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    // Simulate chat response for text input (since voice stream endpoint expects audio)
    // In a real app, you'd hit a text-only chat endpoint here
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "I am an AI tutor. Currently I am optimized for voice interaction. Try clicking the microphone!" }]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleMicClick = async () => {
    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      setIsProcessing(true);
      // Hardcoded conversation ID 1 for demo
      await stream.streamVoiceResponse(`/api/conversations/1/messages`, blob);
    } else {
      await recorder.startRecording();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lang === 'en' ? 'AI Tutor' : 'اے آئی ٹیوٹر'}</h1>
          <p className="text-muted-foreground">{lang === 'en' ? 'Practice Arabic conversation or ask questions.' : 'عربی گفتگو کی مشق کریں یا سوالات پوچھیں۔'}</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
          Powered by GPT-4o
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
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`rounded-2xl p-4 max-w-[80%] ${
                    msg.role === 'user' 
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

        <div className="p-4 bg-background border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en' ? "Type your question..." : "اپنا سوال لکھیں..."}
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
          </div>
        </div>
      </Card>
    </div>
  );
}
