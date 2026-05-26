import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Clock, Shield, LogOut, RefreshCw, Phone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    const fresh = queryClient.getQueryData<any>([api.auth.me.path]);
    if (fresh?.accountStatus === "approved") {
      if (fresh.role === "admin") setLocation("/admin/dashboard");
      else setLocation(`/police/dashboard/${fresh.role}`);
    }
  };

  return (
    <MobileLayout className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50/40 flex items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          {/* Icon */}
          <div className="w-28 h-28 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center shadow-lg">
            <Clock className="w-14 h-14 text-amber-600" />
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-amber-900 mb-2">
              Awaiting Approval
            </h1>
            <p className="text-amber-800/70 text-base leading-relaxed">
              {user
                ? `Hello ${user.fullName.split(" ")[0]}, your ${user.role.replace(/_/g, " ")} account is pending admin review.`
                : "Your account is pending admin review."}
            </p>
          </div>

          {/* Status card */}
          <div className="w-full bg-white rounded-2xl border border-amber-200 p-5 text-left space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Account Status</p>
                <p className="text-xs text-amber-700">Pending Admin Approval</p>
              </div>
            </div>

            <div className="border-t border-amber-100 pt-3 text-sm text-amber-800/80 space-y-1">
              <p>✓ Your registration was submitted successfully</p>
              <p>✓ An admin will review your credentials</p>
              <p>✓ You will gain full access once approved</p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button
              onClick={handleRefresh}
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Approval Status
            </Button>

            <a href="tel:999" className="block">
              <Button variant="outline" className="w-full h-12 rounded-xl border-amber-200 text-amber-800 hover:bg-amber-50">
                <Phone className="w-4 h-4 mr-2" />
                Call Uganda Police: 999
              </Button>
            </a>

            <Button
              variant="ghost"
              onClick={() => logout()}
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-amber-700/60">
            If you need urgent access, contact your station commander or system administrator.
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
