import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Siren, FileEdit, Briefcase, ShieldCheck,
  Bell, FileText, MessageSquare, LogOut, EyeOff, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAlerts } from "@/hooks/use-alerts";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [invisibleMode, setInvisibleMode] = useState(false);
  const { data: alerts } = useAlerts();

  if (!user) return null;

  const menuItems = [
    { label: "Report Crime",   icon: FileEdit,      path: "/citizen/report",   color: "bg-green-100 text-green-700" },
    { label: "My Cases",       icon: Briefcase,     path: "/citizen/cases",    color: "bg-blue-100 text-blue-700" },
    { label: "Evidence Vault", icon: ShieldCheck,   path: "/citizen/evidence", color: "bg-purple-100 text-purple-700" },
    { label: "Alerts Feed",    icon: Bell,          path: "/citizen/alerts",   color: "bg-amber-100 text-amber-700" },
    { label: "Police Forms",   icon: FileText,      path: "/citizen/forms",    color: "bg-cyan-100 text-cyan-700" },
    { label: "AI Assistant",   icon: MessageSquare, path: "/citizen/chat",     color: "bg-emerald-100 text-emerald-700" },
  ];

  const handleSwipe = (_: any, info: PanInfo) => {
    if (info.offset.y < -120) {
      setInvisibleMode(true);
      toast({ title: "Invisible Mode Activated", description: "Your identity is hidden." });
    } else if (info.offset.y > 120) {
      setInvisibleMode(false);
      toast({ title: "Invisible Mode Off", description: "Reports will use your identity." });
    }
  };

  const bg    = invisibleMode ? "bg-neutral-900"  : "bg-gradient-to-br from-green-50 to-emerald-50/40";
  const text  = invisibleMode ? "text-white"      : "text-green-900";
  const sub   = invisibleMode ? "text-neutral-400": "text-green-700/60";
  const card  = invisibleMode ? "bg-white/5 border-white/10 hover:border-white/30" : "border-green-100/80 shadow-sm hover:shadow-md hover:border-green-300";
  const icon  = invisibleMode ? "bg-white/10 text-white" : "";

  return (
    <MobileLayout className={`${bg} min-h-screen transition-colors duration-500`}>
      <motion.div
        className="w-full min-h-screen flex flex-col"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleSwipe}
      >
        {/* ── Top bar ── */}
        <header className={`sticky top-0 z-30 ${invisibleMode ? "bg-neutral-900/95" : "bg-white/80"} backdrop-blur-md border-b ${invisibleMode ? "border-white/10" : "border-green-100"} px-4 sm:px-8 lg:px-14 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${invisibleMode ? "bg-white/10" : "bg-green-600"}`}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-medium ${sub}`}>
                {invisibleMode ? "Anonymous · Swipe down to disable" : "Keep Uganda Safe"}
              </p>
              <h1 className={`text-base font-display font-bold leading-tight ${text}`} data-testid="text-greeting">
                {invisibleMode ? "Anonymous Citizen" : `Hello, ${user.fullName.split(" ")[0]}`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {invisibleMode && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-medium"
                >
                  <EyeOff className="w-3 h-3" /> Hidden
                </motion.span>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className={invisibleMode ? "text-red-400 hover:bg-white/10" : "text-red-500 hover:bg-red-50"}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* ── Swipe hint ── */}
        <AnimatePresence>
          {!invisibleMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-1 py-1.5 text-xs text-neutral-400"
            >
              <ChevronUp className="w-3 h-3" /> Swipe up for Invisible Mode
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 px-4 sm:px-8 lg:px-14 pt-6 pb-10">

          {/* SOS Button — full width, scales in height via aspect ratio trick */}
          <motion.div whileTap={{ scale: 0.98 }} className="mb-8">
            <Button
              className="w-full rounded-2xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/25 flex flex-col gap-1.5 group py-8 lg:py-10"
              onClick={() => setLocation("/citizen/sos")}
              data-testid="button-sos"
            >
              <Siren className="w-10 h-10 lg:w-14 lg:h-14 text-white group-hover:animate-pulse" />
              <span className="text-lg lg:text-2xl font-bold text-white uppercase tracking-widest">Emergency SOS</span>
              <span className="text-red-100/80 text-xs font-normal normal-case tracking-normal">Press &amp; hold 3 seconds</span>
            </Button>
          </motion.div>

          {/* Quick-action grid — auto-fits columns to available width */}
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${sub}`}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
            {menuItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 h-full ${card}`}
                  onClick={() => setLocation(item.path)}
                  data-testid={`card-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2.5 text-center">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${invisibleMode ? "bg-white/10 text-white" : item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-semibold leading-tight ${text}`}>{item.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Community alerts strip */}
          {alerts && alerts.length > 0 && (
            <div>
              <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${sub}`}>Community Alerts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {alerts.slice(0, 6).map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border flex gap-3 items-start ${
                      invisibleMode ? "bg-white/5 border-white/10" : "bg-white border-amber-100"
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${text}`}>{alert.title}</p>
                      <p className={`text-xs ${sub} line-clamp-2 mt-0.5`}>{alert.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </motion.div>
    </MobileLayout>
  );
}
