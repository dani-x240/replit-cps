import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Loader2, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVoiceRecorder, useVoiceStream } from "../../../replit_integrations/audio";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
  streaming?: boolean;
}

export function AICrimeAssistant({ onReportReady }: { onReportReady?: (data: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      text: "Hello. I'm your AI Crime Assistant. Please describe what happened, and I'll help you file an official report.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recorder = useVoiceRecorder();

  const stream = useVoiceStream({
    onUserTranscript: (text) => addMessage("user", text),
    onTranscript: (_, full) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant" && last.streaming) {
          return [...prev.slice(0, -1), { ...last, text: full }];
        }
        return [...prev, { id: "streaming", role: "assistant", text: full, streaming: true }];
      });
    },
    onComplete: (fullText) => {
      setMessages((prev) =>
        prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
      );
      if (onReportReady && fullText.length > 20) {
        onReportReady({
          description: fullText,
          type: fullText.toLowerCase().includes("stole") || fullText.toLowerCase().includes("theft")
            ? "theft"
            : fullText.toLowerCase().includes("assault") || fullText.toLowerCase().includes("attack")
            ? "assault"
            : "other",
        });
      }
    },
  });

  // Create a conversation on first render
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: "Crime Report Chat" }),
        });
        if (res.ok) {
          const data = await res.json();
          setConversationId(data.id);
        }
      } catch {
        // Conversation creation failed — text chat will be disabled
      }
    };
    init();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: "user" | "assistant", text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role, text }]);
  };

  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText("");
    addMessage("user", text);

    if (!conversationId) {
      // Fallback if conversation wasn't created
      setTimeout(() => addMessage("assistant", "I understand. Can you tell me exactly where this happened and when?"), 600);
      return;
    }

    setIsSending(true);
    const streamingId = `stream-${Date.now()}`;

    // Add empty streaming message
    setMessages((prev) => [
      ...prev,
      { id: streamingId, role: "assistant", text: "", streaming: true },
    ]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) break;
            if (json.content) {
              fullText += json.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? { ...m, text: fullText } : m
                )
              );
            }
          } catch {
            // Partial JSON — skip
          }
        }
      }

      // Finalise streaming message
      setMessages((prev) =>
        prev.map((m) => (m.id === streamingId ? { ...m, streaming: false } : m))
      );

      if (onReportReady && fullText.length > 30) {
        onReportReady({
          description: text,
          type: text.toLowerCase().includes("stole") || text.toLowerCase().includes("theft")
            ? "theft"
            : text.toLowerCase().includes("assault")
            ? "assault"
            : "other",
        });
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? { ...m, text: "Sorry, I couldn't connect right now. Please try again.", streaming: false }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecording = async () => {
    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      if (blob && conversationId) {
        await stream.streamVoiceResponse(
          `/api/conversations/${conversationId}/messages`,
          blob
        );
      }
    } else {
      await recorder.startRecording();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-green-50 flex items-center gap-2 shrink-0">
        <Bot className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">AI Crime Assistant</span>
        {isSending && <Loader2 className="w-4 h-4 text-green-500 animate-spin ml-auto" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-neutral-200" : "bg-green-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-green-50 text-green-900"
                  }`}
                >
                  {msg.text || (
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                  {msg.streaming && msg.text && (
                    <span className="inline-block w-0.5 h-3.5 bg-green-500 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Input bar */}
      <div className="p-4 border-t bg-background flex items-center gap-2 shrink-0">
        <Button
          size="icon"
          variant={recorder.state === "recording" ? "destructive" : "outline"}
          className={`rounded-full transition-all shrink-0 ${
            recorder.state === "recording" ? "animate-pulse" : ""
          }`}
          onClick={toggleRecording}
          data-testid="button-voice-toggle"
        >
          {recorder.state === "recording" ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>

        <input
          className="flex-1 bg-neutral-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          placeholder="Describe what happened..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendText()}
          data-testid="input-chat-message"
          disabled={isSending}
        />

        <Button
          size="icon"
          className="rounded-full bg-green-600 hover:bg-green-700 shrink-0"
          onClick={handleSendText}
          disabled={isSending || !inputText.trim()}
          data-testid="button-send-message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
