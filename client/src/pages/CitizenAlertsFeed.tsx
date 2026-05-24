import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Car, PersonStanding, ShieldAlert, Traffic } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@shared/schema";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  missing_person:  { icon: PersonStanding, color: "text-orange-600", bg: "bg-orange-100" },
  stolen_vehicle:  { icon: Car,            color: "text-red-600",    bg: "bg-red-100" },
  wanted_criminal: { icon: ShieldAlert,    color: "text-red-700",    bg: "bg-red-100" },
  traffic:         { icon: AlertTriangle,  color: "text-yellow-600", bg: "bg-yellow-100" },
  riot:            { icon: AlertTriangle,  color: "text-red-700",    bg: "bg-red-100" },
  safety_tip:      { icon: ShieldAlert,    color: "text-blue-600",   bg: "bg-blue-100" },
};

const severityBadge: Record<string, string> = {
  info:     "bg-blue-100 text-blue-800 border-blue-200",
  warning:  "bg-yellow-100 text-yellow-800 border-yellow-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function CitizenAlertsFeed() {
  const [, setLocation] = useLocation();
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({ queryKey: ["/api/alerts"] });

  return (
    <MobileLayout phoneFrame={false} className="bg-green-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto w-full p-6 pt-12 pb-24 lg:p-12">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/citizen/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Community Alerts</h1>
            <p className="text-sm text-muted-foreground">Live safety bulletins from Uganda Police</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-green-100" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-green-200" />
            <p className="font-semibold">No alerts right now</p>
            <p className="text-sm text-muted-foreground mt-1">Police bulletins and safety notices appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => {
              const tc = typeConfig[alert.type] || typeConfig.safety_tip;
              const Icon = tc.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden"
                  data-testid={`alert-card-${alert.id}`}
                >
                  {alert.severity === "critical" && (
                    <div className="h-1 bg-red-500 w-full" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${tc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{alert.title}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${severityBadge[alert.severity || "info"]}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{alert.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {alert.location && (
                            <span className="text-xs text-muted-foreground">📍 {alert.location}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
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
