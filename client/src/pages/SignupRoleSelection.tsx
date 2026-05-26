import { useLocation } from "wouter";
import { User, ShieldAlert, Settings2, ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";

interface RoleOptionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  color: "green" | "blue" | "purple";
  onClick: () => void;
}

function RoleOption({ icon: Icon, title, description, badge, color, onClick }: RoleOptionProps) {
  const colorMap = {
    green:  { bg: "bg-green-50  hover:bg-green-100  border-green-200  hover:border-green-400",  icon: "bg-green-100  text-green-700",  text: "text-green-900" },
    blue:   { bg: "bg-blue-50   hover:bg-blue-100   border-blue-200   hover:border-blue-400",   icon: "bg-blue-100   text-blue-700",   text: "text-blue-900"  },
    purple: { bg: "bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400", icon: "bg-purple-100 text-purple-700", text: "text-purple-900" },
  };
  const c = colorMap[color];

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${c.bg} flex items-start gap-4`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-base font-bold ${c.text}`}>{title}</h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{badge}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
}

export default function SignupRoleSelection() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout className="min-h-screen flex items-center justify-center p-6 lg:p-16 bg-gradient-to-br from-slate-50 to-slate-100/60">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-muted-foreground hover:text-foreground font-medium mb-6 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
            Create an Account
          </h1>
          <p className="text-muted-foreground lg:text-lg">
            Choose your role to get started.
          </p>
        </motion.div>

        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <RoleOption
              icon={User}
              title="Citizen"
              description="Report crimes, get emergency SOS help, track your cases, and view community alerts. Access is immediate after signup."
              color="green"
              onClick={() => setLocation("/auth/citizen?tab=signup")}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
            <RoleOption
              icon={ShieldAlert}
              title="Police Officer"
              description="IO, OC, or DPC — join the Uganda Police Force portal. Your account will require admin approval before access is granted."
              badge="Requires approval"
              color="blue"
              onClick={() => setLocation("/police/roles?mode=signup")}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.26 }}>
            <RoleOption
              icon={Settings2}
              title="System Admin"
              description="Manage user accounts, approve police registrations, and oversee the system. Additional admins require approval from an existing admin."
              badge="Restricted"
              color="purple"
              onClick={() => setLocation("/auth/police?role=admin&tab=signup")}
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Already have an account?{" "}
          <button onClick={() => setLocation("/role-selection")} className="text-green-600 font-semibold hover:underline">
            Sign In
          </button>
        </motion.p>
      </div>
    </MobileLayout>
  );
}
