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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const menuItems = [
    { label: "Report Crime", icon: FileEdit, color: "green", path: "/citizen/report" },
    { label: "My Cases", icon: Briefcase, color: "green", path: "/citizen/cases" },
    { label: "Evidence Vault", icon: ShieldCheck, color: "green", path: "/citizen/vault" },
    { label: "Safety Map", icon: Map, color: "green", path: "/citizen/map" },
    { label: "Alerts Feed", icon: Bell, color: "green", path: "/citizen/alerts" },
    { label: "Police Forms", icon: FileText, color: "green", path: "/citizen/forms" },
    { label: "Chat Portal", icon: MessageSquare, color: "green", path: "/citizen/chat" },
    { label: "Settings", icon: Settings, color: "green", path: "/citizen/settings" },
  ];

  return (
    <MobileLayout className="bg-green-50/30 min-h-screen">
      <div className="p-6 pt-12 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-green-900">Hello, {user.fullName.split(' ')[0]}</h1>
            <p className="text-sm text-green-700/70">Keep Uganda Safe</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-6 h-6" />
          </Button>
        </div>

        {/* SOS Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="mb-8"
        >
          <Button 
            className="w-full h-32 rounded-3xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 flex flex-col gap-2 group"
            onClick={() => setLocation("/citizen/sos")}
          >
            <Siren className="w-12 h-12 text-white group-hover:animate-pulse" />
            <span className="text-xl font-bold text-white uppercase tracking-wider">Emergency SOS</span>
          </Button>
        </motion.div>

        {/* Grid Menu */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="border-green-100 shadow-sm cursor-pointer hover:border-green-300 transition-colors"
                onClick={() => setLocation(item.path)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-green-900">{item.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
