import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { AlertFeed } from "@/components/alerts/AlertFeed";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Bell, 
  LogOut, 
  Map, 
  FileText, 
  Siren, 
  Shield, 
  Upload, 
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSOS = () => {
    // In a real app, this would trigger an immediate geolocation-tagged alert
    toast({ 
      title: "SOS TRIGGERED", 
      description: "Police units in your area have been alerted with your location.",
      variant: "destructive",
      duration: 5000
    });
  };

  if (!user) return null;

  const menuItems = [
    { label: "Report Crime", icon: Siren, color: "text-red-500", bg: "bg-red-50", onClick: () => setLocation("/citizen/report") },
    { label: "My Cases", icon: FileText, color: "text-blue-500", bg: "bg-blue-50", onClick: () => setLocation("/citizen/cases") },
    { label: "Evidence", icon: Upload, color: "text-purple-500", bg: "bg-purple-50", onClick: () => {} },
    { label: "Safety Map", icon: Map, color: "text-green-500", bg: "bg-green-50", onClick: () => {} },
    { label: "Police Chat", icon: MessageSquare, color: "text-orange-500", bg: "bg-orange-50", onClick: () => {} },
    { label: "Settings", icon: Shield, color: "text-gray-500", bg: "bg-gray-50", onClick: () => {} },
  ];

  return (
    <MobileLayout>
      <div className="bg-green-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg font-bold">
              {user.fullName?.[0] || "U"}
            </div>
            <div>
              <p className="text-green-100 text-xs uppercase tracking-wider font-semibold">Welcome Back</p>
              <h2 className="font-display font-bold text-xl">{user.username}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full" onClick={() => logout()}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* SOS Button */}
        <div className="flex justify-center mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-32 h-32 rounded-full bg-red-600 shadow-[0_0_0_8px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center text-white border-4 border-red-400"
            onClick={handleSOS}
          >
            <span className="text-3xl font-black">SOS</span>
            <span className="text-[10px] font-bold mt-1 uppercase">Press & Hold</span>
          </motion.button>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 grid grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.onClick}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-xs font-medium text-neutral-600 text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <h3 className="font-display font-bold text-lg mb-4 text-neutral-800">Community Alerts</h3>
        <AlertFeed />
      </div>
    </MobileLayout>
  );
}
