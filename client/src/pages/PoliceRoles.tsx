import { useLocation } from "wouter";
import { User, ShieldCheck, ClipboardList, BarChart3, Settings2 } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RoleCard } from "@/components/ui/RoleCard";
import { motion } from "framer-motion";

export default function PoliceRoles() {
  const [, setLocation] = useLocation();

  const roles = [
    {
      id: "police_io",
      title: "Investigating Officer (IO)",
      description: "Handles individual cases, communicates with citizens, and updates status.",
      icon: ShieldCheck,
    },
    {
      id: "police_oc",
      title: "Officer-in-Charge (OC)",
      description: "Manages the police station, assigns cases, and monitors performance.",
      icon: ClipboardList,
    },
    {
      id: "police_dpc",
      title: "District Commander (DPC)",
      description: "Oversees multiple stations and views district-wide crime data.",
      icon: BarChart3,
    },
    {
      id: "admin",
      title: "System Admin",
      description: "Manages user accounts, system configuration, and security.",
      icon: Settings2,
    },
  ];

  return (
    <MobileLayout className="p-6 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button 
          onClick={() => setLocation("/role-selection")}
          className="text-sm text-police font-medium mb-4 flex items-center gap-1"
        >
          ← Back to Role Selection
        </button>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Police Roles</h1>
        <p className="text-muted-foreground">Select your specific department role to login.</p>
      </motion.div>

      <div className="space-y-4 pb-8">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <RoleCard
              title={role.title}
              description={role.description}
              icon={role.icon}
              color="police"
              onClick={() => setLocation(`/auth/police?role=${role.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </MobileLayout>
  );
}
