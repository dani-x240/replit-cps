import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Send } from "lucide-react";
import { AICrimeAssistant } from "@/components/crime/AICrimeAssistant";
import { useCreateReport } from "@/hooks/use-reports";
import { useAuth } from "@/hooks/use-auth";

export default function CitizenReport() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { mutate: createReport } = useCreateReport();
  const [reportData, setReportData] = useState<any>(null);

  const handleReportReady = (data: any) => {
    setReportData(data);
  };

  const submitReport = () => {
    if (!reportData || !user) return;
    
    createReport({
      title: "Incident Report", // In real app, generate from AI summary
      description: reportData.description,
      type: reportData.type,
      createdById: user.id,
      status: "pending",
      priority: "medium",
      location: user.district || "Unknown Location",
    });
    
    setLocation("/citizen/dashboard");
  };

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 sticky top-0 bg-white z-10">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/citizen/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Report a Crime</h1>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            <strong>AI Assistant Active:</strong> Describe the incident naturally. You can speak or type. The assistant will help categorize and format your report.
          </div>

          <AICrimeAssistant onReportReady={handleReportReady} />

          {reportData && (
            <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-xl animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-green-900 mb-2">Report Summary</h3>
              <p className="text-sm text-green-800 mb-1"><strong>Type:</strong> {reportData.type}</p>
              <p className="text-sm text-green-800 mb-4"><strong>Description:</strong> {reportData.description}</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={submitReport}>
                Submit Report <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
