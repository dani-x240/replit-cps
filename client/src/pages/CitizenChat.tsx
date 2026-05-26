import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Bot, Wifi } from "lucide-react";
import { AICrimeAssistant } from "@/components/crime/AICrimeAssistant";

export default function CitizenChat() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout className="bg-white min-h-screen">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="shrink-0 border-b border-green-100 bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-green-50 text-green-700"
            onClick={() => setLocation("/citizen/dashboard")}
            data-testid="button-back-chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-green-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-base leading-tight text-green-900">AI Crime Assistant</h1>
            <p className="text-xs text-green-600/70 flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Online · Replies instantly
            </p>
          </div>
        </header>

        {/* Chat body fills remaining height */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AICrimeAssistant />
        </div>
      </div>
    </MobileLayout>
  );
}
