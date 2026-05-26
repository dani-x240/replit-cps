import { useLocation } from "wouter";
import { User, ShieldAlert, ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RoleCard } from "@/components/ui/RoleCard";
import { motion } from "framer-motion";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout className="min-h-screen flex items-center justify-center p-6 lg:p-16 bg-gradient-to-br from-slate-50 to-slate-100/60">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12"
        >
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-muted-foreground hover:text-foreground font-medium mb-6 inline-flex items-center gap-1.5 transition-colors"
            data-testid="button-back-welcome"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-2">
            Who are you?
          </h1>
          <p className="text-muted-foreground lg:text-lg">
            Select your role to access the appropriate portal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <RoleCard
              title="Citizen"
              description="Report a crime, check case status, view community alerts, or get emergency help."
              icon={User}
              color="citizen"
              onClick={() => setLocation("/auth/citizen")}
            />
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <RoleCard
              title="Police Force"
              description="Restricted access for authorized Uganda Police Force personnel only."
              icon={ShieldAlert}
              color="police"
              onClick={() => setLocation("/police/roles")}
            />
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
}
