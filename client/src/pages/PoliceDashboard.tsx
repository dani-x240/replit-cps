import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { 
  Shield, 
  FileText, 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Settings,
  BarChart,
  LogOut,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/hooks/use-reports";
import { useAlerts } from "@/hooks/use-alerts";
import { motion } from "framer-motion";

export default function PoliceDashboard() {
  const { user, logoutMutation } = useAuth();
  const { reports } = useReports();
  const { alerts } = useAlerts();

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    police_io: "Investigating Officer",
    police_oc: "Officer-in-Charge",
    police_dpc: "District Commander",
    admin: "System Admin"
  };

  const getDashboardConfig = (role: string) => {
    switch (role) {
      case "police_io":
        return {
          stats: [
            { label: "My Cases", value: reports?.length || 0, icon: FileText, color: "blue" },
            { label: "Pending Evidence", value: 3, icon: ClipboardCheck, color: "amber" },
          ],
          actions: [
            { label: "Assigned Cases", icon: FileText, description: "Review and update investigation status" },
            { label: "Citizen Chat", icon: MessageSquare, description: "Direct communication with reporters" },
            { label: "Evidence Review", icon: ClipboardCheck, description: "Validate uploaded media and files" },
          ]
        };
      case "police_oc":
        return {
          stats: [
            { label: "Station Cases", value: reports?.length || 0, icon: Users, color: "blue" },
            { label: "Active Officers", value: 8, icon: Shield, color: "green" },
          ],
          actions: [
            { label: "Case Assignment", icon: UserPlus, description: "Assign investigations to IOs" },
            { label: "Station Alerts", icon: AlertTriangle, description: "Broadcast localized safety alerts" },
            { label: "Performance", icon: BarChart, description: "Monitor officer and case metrics" },
          ]
        };
      case "police_dpc":
        return {
          stats: [
            { label: "District Crime Rate", value: "-12%", icon: BarChart, color: "green" },
            { label: "Total Stations", value: 14, icon: MapPin, color: "blue" },
          ],
          actions: [
            { label: "District Analytics", icon: BarChart, description: "Deep dive into crime heatmaps" },
            { label: "Resource Allocation", icon: Users, description: "Manage district-wide personnel" },
            { label: "Policy Approval", icon: ClipboardCheck, description: "Digital form and PF sign-offs" },
          ]
        };
      case "admin":
        return {
          stats: [
            { label: "Total Users", value: 1250, icon: Users, color: "blue" },
            { label: "System Status", value: "Optimal", icon: Shield, color: "green" },
          ],
          actions: [
            { label: "User Management", icon: Users, description: "Provision and verify accounts" },
            { label: "System Config", icon: Settings, description: "Update app parameters and keys" },
            { label: "Security Logs", icon: Shield, description: "Monitor access and audit trails" },
          ]
        };
      default:
        return { stats: [], actions: [] };
    }
  };

  const config = getDashboardConfig(user.role);

  return (
    <MobileLayout className="bg-blue-50/30 min-h-screen">
      <div className="p-6 pt-12 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-blue-900">Hello, {user.fullName.split(' ')[0]}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {roleLabels[user.role]}
              </Badge>
              {user.stationId && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.stationId}
                </span>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logoutMutation.mutate()}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-6 h-6" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {config.stats.map((stat, i) => (
            <Card key={i} className="border-blue-100 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <stat.icon className={`w-5 h-5 mb-2 text-${stat.color}-600`} />
                <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alerts Strip */}
        {alerts && alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Recent Alerts
            </h2>
            <div className="space-y-3">
              {alerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-white p-3 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">{alert.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{alert.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-blue-900">Management Tools</h2>
          {config.actions.map((action, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
