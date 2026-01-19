import { useLocation } from "wouter";
import { User, ShieldAlert } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RoleCard } from "@/components/ui/RoleCard";
import { motion } from "framer-motion";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout className="p-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Who are you?</h1>
        <p className="text-muted-foreground">Select your role to continue to the appropriate portal.</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <RoleCard
            title="Citizen"
            description="I want to report a crime, check case status, or view alerts."
            icon={User}
            color="citizen"
            onClick={() => setLocation("/auth/citizen")}
          />
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RoleCard
            title="Police Officer"
            description="Restricted access for authorized personnel only."
            icon={ShieldAlert}
            color="police"
            onClick={() => setLocation("/auth/police")}
          />
        </motion.div>
      </div>
    </MobileLayout>
  );
}
