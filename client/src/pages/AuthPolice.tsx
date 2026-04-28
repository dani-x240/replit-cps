import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft, Loader2, Shield, UserPlus, LogIn, Eye, EyeOff, BadgeCheck, Lock } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  stationId: z.string().min(1, "Station ID is required"),
});

export default function AuthPolice() {
  const [location, setLocation] = useLocation();
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  
  // Get role from query param
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "police_io";

  const loginForm = useForm({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });
  
  const signupForm = useForm({ 
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      stationId: "",
    }
  });

  const roleLabels: Record<string, string> = {
    police_io: "Investigating Officer",
    police_oc: "Officer-in-Charge",
    police_dpc: "District Commander",
    admin: "System Admin"
  };

  const sidePanel = (
    <div className="w-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
          <Shield className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-4xl font-display font-bold leading-tight mb-3">
          Uganda Police Force
        </h2>
        <p className="text-blue-100/90 text-lg">
          Secure command center for {roleLabels[role] || "officers"}.
        </p>
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

      <p className="relative text-xs text-blue-200/70 mt-12">
        © Uganda Police Force · CPS Mobile
      </p>
    </div>
  );

  return (
    <MobileLayout sidePanel={sidePanel}>
      <div className="min-h-screen bg-blue-50/50 lg:bg-transparent lg:min-h-0">
        <div className="p-6 pt-8 pb-20">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => setLocation("/police/roles")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="flex flex-col items-center mt-8 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-700">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-display font-bold text-blue-900 text-center">{roleLabels[role] || "Police Portal"}</h1>
            <p className="text-muted-foreground text-center">Authorized Access Only</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-blue-100/50 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                <form onSubmit={loginForm.handleSubmit((d) => login(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Username / Badge ID</Label>
                    <Input {...loginForm.register("username")} className="h-12 rounded-xl border-blue-100 focus:border-blue-500" />
                    {loginForm.formState.errors.username && <span className="text-red-500 text-xs">{loginForm.formState.errors.username.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...loginForm.register("password")} className="h-12 rounded-xl border-blue-100 focus:border-blue-500 pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && <span className="text-red-500 text-xs">{loginForm.formState.errors.password.message}</span>}
                  </div>
                  <Button disabled={isLoggingIn} className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-lg font-semibold">
                    {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                <form onSubmit={signupForm.handleSubmit((d) => register({ ...d, role }))} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...signupForm.register("fullName")} className="h-12 rounded-xl border-blue-100" />
                    {signupForm.formState.errors.fullName && <span className="text-red-500 text-xs">{signupForm.formState.errors.fullName.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Username / Badge ID</Label>
                    <Input {...signupForm.register("username")} className="h-12 rounded-xl border-blue-100" />
                    {signupForm.formState.errors.username && <span className="text-red-500 text-xs">{signupForm.formState.errors.username.message}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input {...signupForm.register("phone")} className="h-12 rounded-xl border-blue-100" />
                      {signupForm.formState.errors.phone && <span className="text-red-500 text-xs">{signupForm.formState.errors.phone.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Station ID</Label>
                      <Input {...signupForm.register("stationId")} className="h-12 rounded-xl border-blue-100" />
                      {signupForm.formState.errors.stationId && <span className="text-red-500 text-xs">{signupForm.formState.errors.stationId.message}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" {...signupForm.register("email")} className="h-12 rounded-xl border-blue-100" />
                    {signupForm.formState.errors.email && <span className="text-red-500 text-xs">{signupForm.formState.errors.email.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" {...signupForm.register("password")} className="h-12 rounded-xl border-blue-100" />
                    {signupForm.formState.errors.password && <span className="text-red-500 text-xs">{signupForm.formState.errors.password.message}</span>}
                  </div>
                  <Button disabled={isRegistering} className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-lg font-semibold">
                    {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Access"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            Unauthorized access is a criminal offense under the Computer Misuse Act.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
