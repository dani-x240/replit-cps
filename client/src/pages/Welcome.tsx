import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Siren, Bell, ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { EmergencyNotification } from "@/components/EmergencyNotification";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout>
      <EmergencyNotification />
      <div
        className="min-h-screen w-full flex flex-col lg:flex-row"
        style={{ background: "linear-gradient(180deg, #2A2D2F 0%, #0B0C10 100%)" }}
      >
        {/* ── Left / hero panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 lg:py-0 relative overflow-hidden">
          {/* subtle glow blobs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(255,204,0,0.08) 0%, transparent 70%)" }} />

          {/* Logo with gold border */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl mb-8"
            style={{ border: "2px solid #FFCC00", boxShadow: "0 0 32px rgba(255,204,0,0.25)" }}
          >
            <img src="/logo.png" alt="CPS Mobile" className="w-full h-full object-cover" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-5xl lg:text-6xl font-display font-bold text-center mb-3"
            style={{ color: "#FFFFFF" }}
          >
            CPS Mobile
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-center text-lg lg:text-xl max-w-sm mb-12"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Safety &amp; Security for Every Citizen of Uganda
          </motion.p>

          {/* Feature list — desktop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden lg:flex flex-col gap-4 w-full max-w-sm"
          >
            {[
              { icon: Siren,       label: "One-tap SOS emergency alert with live GPS" },
              { icon: Bell,        label: "Real-time community alerts from police" },
              { icon: ShieldCheck, label: "Secure, verified crime reporting" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,204,0,0.3)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#FFCC00" }} />
                </div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right / CTA panel ── */}
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col justify-end lg:justify-center px-8 pb-12 pt-0 lg:py-16 gap-3">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* Sign In — white CTA */}
            <Button
              size="lg"
              className="w-full h-14 text-base lg:text-lg font-semibold rounded-2xl shadow-xl"
              style={{ background: "#FFFFFF", color: "#0B0C10" }}
              onClick={() => setLocation("/role-selection")}
              data-testid="button-signin"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            {/* Create Account — red accent */}
            <Button
              size="lg"
              className="w-full h-14 text-base lg:text-lg font-semibold rounded-2xl"
              style={{
                background: "transparent",
                border: "2px solid #E50914",
                color: "#FFFFFF",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(229,9,20,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => setLocation("/signup-role")}
              data-testid="button-create-account"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm mt-2"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Uganda Police Force © 2025
          </motion.p>
        </div>
      </div>
    </MobileLayout>
  );
}
