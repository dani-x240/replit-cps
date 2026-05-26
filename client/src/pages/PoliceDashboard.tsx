import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Shield, FileText, Users, AlertTriangle, Settings,
  BarChart, LogOut, ChevronRight, ClipboardCheck, MapPin, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/hooks/use-reports";
import { useAlerts } from "@/hooks/use-alerts";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function PoliceDashboard() {
  const { user, logout } = useAuth();
  const { data: reports } = useReports();
  const { data: alerts } = useAlerts();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    police_io:  "Investigating Officer",
    police_oc:  "Officer-in-Charge",
    police_dpc: "District Commander",
    admin:      "System Administrator",
  };

  const getDashboardConfig = (role: string) => {
    const totalReports = reports?.length ?? 0;
    const submitted = (reports as any[])?.filter((r: any) => r.status === "submitted").length ?? 0;
    const active    = (reports as any[])?.filter((r: any) => r.status === "under_investigation").length ?? 0;

    switch (role) {
      case "police_io":
        return {
          stats: [
            { label: "Total Cases",  value: totalReports, icon: FileText,      color: "blue"  },
            { label: "New Reports",  value: submitted,    icon: ClipboardCheck, color: "amber" },
            { label: "Active",       value: active,       icon: Shield,         color: "green" },
          ],
          actions: [
            { label: "Case Management",   icon: FileText,       description: "View, update and close cases",       path: "/police/cases" },
            { label: "Community Alerts",  icon: AlertTriangle,  description: "View police bulletins",              path: "/citizen/alerts" },
            { label: "Evidence Review",   icon: ClipboardCheck, description: "Review uploaded evidence files",     path: "/police/cases" },
          ],
        };
      case "police_oc":
        return {
          stats: [
            { label: "All Cases",       value: totalReports, icon: Users,  color: "blue"  },
            { label: "Active Officers", value: 8,            icon: Shield, color: "green" },
            { label: "New Reports",     value: submitted,    icon: FileText, color: "amber" },
          ],
          actions: [
            { label: "Case Assignment",  icon: UserPlus,      description: "Assign cases to officers",            path: "/police/cases" },
            { label: "All Cases",        icon: FileText,      description: "View and manage station cases",        path: "/police/cases" },
            { label: "Community Alerts", icon: AlertTriangle, description: "View and post alerts",                path: "/citizen/alerts" },
          ],
        };
      case "police_dpc":
        return {
          stats: [
            { label: "District Cases", value: totalReports, icon: BarChart, color: "green" },
            { label: "Stations",       value: 14,           icon: MapPin,   color: "blue"  },
            { label: "New Reports",    value: submitted,    icon: FileText, color: "amber" },
          ],
          actions: [
            { label: "All Cases",        icon: FileText,      description: "District-wide case overview",         path: "/police/cases" },
            { label: "Community Alerts", icon: AlertTriangle, description: "Manage district bulletins",           path: "/citizen/alerts" },
            { label: "Policy Approval",  icon: ClipboardCheck,description: "Digital form and PF sign-offs",      path: "/police/cases" },
          ],
        };
      default: // admin
        return {
          stats: [
            { label: "Total Cases",   value: totalReports, icon: Users,    color: "blue"  },
            { label: "System Status", value: "OK",         icon: Shield,   color: "green" },
            { label: "New Reports",   value: submitted,    icon: FileText, color: "amber" },
          ],
          actions: [
            { label: "All Cases",        icon: FileText,      description: "System-wide case management",         path: "/police/cases" },
            { label: "Community Alerts", icon: AlertTriangle, description: "Post system-wide alerts",             path: "/citizen/alerts" },
            { label: "Security Logs",    icon: Settings,      description: "Monitor access and audit trails",     path: "/police/cases" },
          ],
        };
    }
  };

  const config = getDashboardConfig(user.role);
  const colorMap: Record<string, string> = {
    blue:  "bg-blue-50  text-blue-600  border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <MobileLayout className="bg-gradient-to-br from-blue-50/60 to-indigo-50/30 min-h-screen">
      <div className="w-full min-h-screen flex flex-col">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-blue-100 px-4 sm:px-8 lg:px-14 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600/70 font-medium">{roleLabels[user.role]}</p>
              <h1 className="text-base font-display font-bold text-blue-900 leading-tight">
                Hello, {user.fullName.split(" ")[0]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.stationId && (
              <Badge variant="secondary" className="hidden sm:flex bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <MapPin className="w-3 h-3" /> {user.stationId}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 lg:px-14 pt-6 pb-10 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {config.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-white rounded-2xl border p-4 flex flex-col gap-2 ${colorMap[stat.color].split(" ").slice(2).join(" ")}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[stat.color].split(" ").slice(0, 2).join(" ")}`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
                <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Alerts */}
          {alerts && alerts.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Recent Alerts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {(alerts as any[]).slice(0, 6).map((alert: any) => (
                  <div key={alert.id} className="bg-white p-3.5 rounded-2xl border border-blue-100 flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-900 truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{alert.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Management Tools */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 mb-3">Management Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.actions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between group cursor-pointer"
                  onClick={() => action.path && setLocation(action.path)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-200 group-hover:text-blue-500 transition-colors shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </MobileLayout>
  );
}
