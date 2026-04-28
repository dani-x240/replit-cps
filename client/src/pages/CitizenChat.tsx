import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Bot } from "lucide-react";
import { AICrimeAssistant } from "@/components/crime/AICrimeAssistant";

export default function CitizenChat() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout className="bg-white min-h-screen">
      <div className="flex flex-col min-h-screen">
        <div className="p-4 border-b flex items-center gap-2 sticky top-0 bg-white z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/citizen/dashboard")}
            data-testid="button-back-chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">AI Assistant</h1>
              <p className="text-xs text-neutral-500">Online · Replies instantly</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <AICrimeAssistant />
        </div>
      </div>
    </MobileLayout>
  );
}
