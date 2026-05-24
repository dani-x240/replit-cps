import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { Report } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  submitted:    { label: "Submitted",    color: "bg-yellow-100 text-yellow-800 border-yellow-200",  dot: "bg-yellow-500" },
  assigned:     { label: "Assigned",     color: "bg-blue-100 text-blue-800 border-blue-200",         dot: "bg-blue-500" },
  investigating:{ label: "Investigating",color: "bg-orange-100 text-orange-800 border-orange-200",   dot: "bg-orange-500" },
  resolved:     { label: "Resolved",     color: "bg-green-100 text-green-800 border-green-200",      dot: "bg-green-500" },
  escalated:    { label: "Escalated",    color: "bg-red-100 text-red-800 border-red-200",            dot: "bg-red-500" },
};

export default function CitizenMyCases() {
  const [, setLocation] = useLocation();
  const { data: cases = [], isLoading } = useQuery<Report[]>({ queryKey: ["/api/reports"] });

  return (
    <MobileLayout phoneFrame={false} className="bg-green-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto w-full p-6 pt-12 pb-24 lg:p-12">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/citizen/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Cases</h1>
            <p className="text-sm text-muted-foreground">Track your submitted reports</p>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700"
            onClick={() => setLocation("/citizen/report")}
            data-testid="button-new-report"
          >
            <Plus className="w-4 h-4 mr-1" /> New Report
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-green-100" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-foreground mb-1">No cases yet</p>
            <p className="text-sm text-muted-foreground mb-4">Your submitted crime reports will appear here.</p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation("/citizen/report")}>
              Report a Crime
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c, i) => {
              const cfg = statusConfig[c.status || "submitted"] || statusConfig.submitted;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/citizen/cases/${c.id}`)}
                  data-testid={`card-case-${c.id}`}
                >
                  <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        {c.caseNumber || `#${c.id}`}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {c.type.replace(/_/g," ")} · {c.location || "Location not set"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {c.createdAt ? format(new Date(c.createdAt), "MMM d") : ""}
                    </p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
