import { useLocation } from "wouter";
import { User, ShieldAlert } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RoleCard } from "@/components/ui/RoleCard";
import { motion } from "framer-motion";

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout phoneFrame={false} className="p-6 pt-12 lg:p-12 lg:pt-20">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12 text-center lg:text-left"
        >
          <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-2">
            Who are you?
          </h1>
          <p className="text-muted-foreground lg:text-lg">
            Select your role to continue to the appropriate portal.
          </p>
        </motion.div>

        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
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
            title="Police Force"
            description="Restricted access for authorized personnel only."
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
