import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Siren,
  FileEdit,
  Briefcase,
  ShieldCheck,
  Map,
  Bell,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  EyeOff,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [invisibleMode, setInvisibleMode] = useState(false);

  if (!user) return null;

  const menuItems = [
    { label: "Report Crime", icon: FileEdit, path: "/citizen/report" },
    { label: "My Cases", icon: Briefcase, path: "/citizen/cases" },
    { label: "Evidence Vault", icon: ShieldCheck, path: "/citizen/vault" },
    { label: "Safety Map", icon: Map, path: "/citizen/map" },
    { label: "Alerts Feed", icon: Bell, path: "/citizen/alerts" },
    { label: "Police Forms", icon: FileText, path: "/citizen/forms" },
    { label: "AI Assistant", icon: MessageSquare, path: "/citizen/chat" },
    { label: "Settings", icon: Settings, path: "/citizen/settings" },
  ];

  const handleSwipe = (_: any, info: PanInfo) => {
    // Swipe up gesture (negative offsetY) toggles invisible mode
    if (info.offset.y < -120) {
      setInvisibleMode(true);
      toast({
        title: "Invisible Mode Activated",
        description: "Your identity will be hidden in reports.",
      });
    } else if (info.offset.y > 120) {
      setInvisibleMode(false);
      toast({
        title: "Invisible Mode Off",
        description: "Reports will use your verified identity.",
      });
    }
  };

  const accent = invisibleMode ? "neutral" : "green";
  const bgClass = invisibleMode ? "bg-neutral-900 text-white" : "bg-green-50/30";

  return (
    <MobileLayout
      phoneFrame={false}
      className={`${bgClass} min-h-screen transition-colors duration-500`}
    >
      <motion.div
        className="p-6 pt-12 pb-24 lg:p-12 max-w-6xl mx-auto w-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipe}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className={`text-2xl font-display font-bold ${
                invisibleMode ? "text-white" : "text-green-900"
              }`}
              data-testid="text-greeting"
            >
              {invisibleMode ? "Anonymous Citizen" : `Hello, ${user.fullName.split(" ")[0]}`}
            </h1>
            <p
              className={`text-sm ${
                invisibleMode ? "text-neutral-400" : "text-green-700/70"
              }`}
            >
              {invisibleMode ? "Identity hidden · Swipe down to disable" : "Keep Uganda Safe"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className={
              invisibleMode
                ? "text-red-400 hover:text-red-300 hover:bg-white/10"
                : "text-red-500 hover:text-red-600 hover:bg-red-50"
            }
            data-testid="button-logout"
          >
            <LogOut className="w-6 h-6" />
          </Button>
        </div>

        {/* Invisible mode banner / hint */}
        <AnimatePresence>
          {invisibleMode ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2 text-sm"
            >
              <EyeOff className="w-4 h-4" />
              <span>Anonymous reporting enabled</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-center gap-1 text-xs text-neutral-400"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Swipe up for Invisible Mode</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Button */}
        <motion.div whileTap={{ scale: 0.95 }} className="mb-8 lg:max-w-2xl lg:mx-auto">
          <Button
            className="w-full h-32 lg:h-40 rounded-3xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 flex flex-col gap-2 group"
            onClick={() => setLocation("/citizen/sos")}
            data-testid="button-sos"
          >
            <Siren className="w-12 h-12 lg:w-16 lg:h-16 text-white group-hover:animate-pulse" />
            <span className="text-xl lg:text-2xl font-bold text-white uppercase tracking-wider">
              Emergency SOS
            </span>
          </Button>
        </motion.div>

        {/* Grid Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-colors ${
                  invisibleMode
                    ? "bg-white/5 border-white/10 hover:border-white/30"
                    : "border-green-100 shadow-sm hover:border-green-300"
                }`}
                onClick={() => setLocation(item.path)}
                data-testid={`card-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      invisibleMode
                        ? "bg-white/10 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      invisibleMode ? "text-white" : "text-green-900"
                    }`}
                  >
                    {item.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MobileLayout>
  );
}
