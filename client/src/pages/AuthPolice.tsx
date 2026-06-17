import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft, Loader2, Shield, Eye, EyeOff, BadgeCheck, Lock, BadgeInfo } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

const loginSchema = z.object({
  phone: z.string().min(9, "Enter your phone number"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPolice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "police_io";

  const roleLabels: Record<string, string> = {
    police_io: "Investigating Officer",
    police_oc: "Officer-in-Charge",
    police_dpc: "District Commander",
    admin: "System Admin",
  };

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.phone.replace(/\s+/g, "").trim(), password: data.password }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      if (user.accountStatus === "pending") {
        toast({ title: "Account pending approval", description: "Contact your administrator." });
        setLocation("/pending-approval");
      } else if (user.role === "admin") {
        toast({ title: "Welcome, Admin" });
        setLocation("/admin/dashboard");
      } else {
        toast({ title: "Welcome!", description: user.fullName });
        setLocation(`/police/dashboard/${user.role}`);
      }
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Login failed", description: err.message }),
  });

  const sidePanel = (
    <div className="w-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="relative">
        <img src="/logo.png" alt="CPS" className="w-16 h-16 rounded-2xl object-cover mb-8" />
        <h2 className="text-4xl font-display font-bold leading-tight mb-3">Uganda Police Force</h2>
        <p className="text-blue-100/90 text-lg">Secure command center for {roleLabels[role] || "officers"}.</p>
      </div>
      <div className="relative space-y-4 mt-12">
        <div className="flex items-start gap-3">
          <BadgeCheck className="w-5 h-5 mt-0.5 text-blue-200 shrink-0" />
          <div>
            <p className="font-semibold">Role-based access</p>
            <p className="text-sm text-blue-100/80">Cases, alerts, and tools tailored to your rank.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 mt-0.5 text-blue-200 shrink-0" />
          <div>
            <p className="font-semibold">Encrypted sessions</p>
            <p className="text-sm text-blue-100/80">Every login is logged and audited.</p>
          </div>
        </div>
      </div>
      <p className="relative text-xs text-blue-200/70 mt-12">© Uganda Police Force · CPS Mobile</p>
    </div>
  );

  return (
    <MobileLayout sidePanel={sidePanel}>
      <div className="min-h-screen bg-blue-50/50 lg:bg-transparent lg:min-h-0">
        <div className="p-6 pt-8 pb-20">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => setLocation("/police/roles")}>
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Button>

          <div className="flex flex-col items-center mt-8 mb-8">
            <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-blue-900 text-center">{roleLabels[role] || "Police Portal"}</h1>
            <p className="text-muted-foreground text-center text-sm mt-1">Authorized Access Only</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <form onSubmit={loginForm.handleSubmit(d => loginMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4 text-blue-600" />
                  Phone Number
                </Label>
                <Input
                  {...loginForm.register("phone")}
                  placeholder="e.g. 0701234567"
                  className="h-12 rounded-xl border-blue-100 focus:border-blue-500"
                />
                {loginForm.formState.errors.phone && <span className="text-red-500 text-xs">{loginForm.formState.errors.phone.message}</span>}
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password")}
                    className="h-12 rounded-xl border-blue-100 focus:border-blue-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && <span className="text-red-500 text-xs">{loginForm.formState.errors.password.message}</span>}
              </div>
              <Button disabled={loginMutation.isPending} className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-lg font-semibold">
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
              </Button>
            </form>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Note:</strong> Police officer accounts are created by the admin. If you don't have an account, contact your station commander or call HQ.
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Unauthorized access is a criminal offense under the Computer Misuse Act.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
