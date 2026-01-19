import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Loader2, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVoiceRecorder, useVoiceStream } from "../../../replit_integrations/audio";
import { useCreateReport } from "@/hooks/use-reports";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export function AICrimeAssistant({ onReportReady }: { onReportReady?: (data: any) => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", text: "Hello. I'm your AI Crime Assistant. Please describe what happened, and I'll help you file a report." }
  ]);
  const [inputText, setInputText] = useState("");
  
  const { createReport } = useCreateReport(); // Placeholder for actual usage if needed
  const recorder = useVoiceRecorder();
  
  // Audio playback setup
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/audio-playback-worklet.js"; // Ensure this exists in public
    document.body.appendChild(script);
  }, []);

  const stream = useVoiceStream({
    onUserTranscript: (text) => {
      addMessage("user", text);
    },
    onTranscript: (_, full) => {
      // Update last assistant message or add new one
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant" && last.id === "streaming") {
          return [...prev.slice(0, -1), { ...last, text: full }];
        }
        return [...prev, { id: "streaming", role: "assistant", text: full }];
      });
    },
    onComplete: (fullText) => {
      // Analyze text to auto-fill report (mock logic)
      if (onReportReady && fullText.length > 20) {
        onReportReady({
          description: fullText,
          type: fullText.toLowerCase().includes("stole") ? "theft" : "other",
        });
      }
    }
  });

  const addMessage = (role: "user" | "assistant", text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text }]);
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    addMessage("user", inputText);
    setInputText("");
    // In a real app, you'd send text to an endpoint that returns a stream/response
    // For now, we simulate a response since the voice hook expects audio for input
    setTimeout(() => {
      addMessage("assistant", "I understand. Can you tell me exactly where this happened?");
    }, 1000);
  };

  const toggleRecording = async () => {
    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      // Use a dummy conversation ID for now
      await stream.streamVoiceResponse("/api/conversations/1/messages", blob);
    } else {
      await recorder.startRecording();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-green-50 flex items-center gap-2">
        <Bot className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">AI Assistant</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${msg.role === "user" ? "bg-neutral-200" : "bg-green-100"}
                `}>
                  {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-green-600" />}
                </div>
                <div className={`
                  p-3 rounded-2xl text-sm max-w-[80%]
                  ${msg.role === "user" ? "bg-neutral-100 text-neutral-800" : "bg-green-50 text-green-900"}
                `}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background flex items-center gap-2">
        <Button
          size="icon"
          variant={recorder.state === "recording" ? "destructive" : "outline"}
          className={`rounded-full transition-all ${recorder.state === "recording" ? "animate-pulse" : ""}`}
          onClick={toggleRecording}
        >
          {recorder.state === "recording" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        <input
          className="flex-1 bg-neutral-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          placeholder="Type or speak..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
        />

        <Button size="icon" className="rounded-full bg-green-600 hover:bg-green-700" onClick={handleSendText}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
