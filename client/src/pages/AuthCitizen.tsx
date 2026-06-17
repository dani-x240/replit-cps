import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck, Bell, Siren, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

const loginSchema = z.object({
  phone: z.string().min(9, "Enter your phone number"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  phone: z.string().min(9, "Enter a valid phone number (e.g. 0701234567)"),
  nin: z.string().min(10, "Enter your NIN (e.g. CM010825OGW001)"),
  district: z.string().optional(),
  parish: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthCitizen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const defaultTab = params.get("tab") === "signup" ? "signup" : "login";

  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { phone: "", password: "" } });
  const signupForm = useForm({ resolver: zodResolver(signupSchema), defaultValues: { phone: "", nin: "", district: "", parish: "", password: "", confirmPassword: "" } });

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
      toast({ title: "Welcome back!", description: user.fullName });
      setLocation("/citizen/dashboard");
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Login failed", description: err.message }),
  });

  const signupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signupSchema>) => {
      const res = await fetch("/api/auth/register/citizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone.replace(/\s+/g, "").trim(),
          nin: data.nin.toUpperCase().trim(),
          district: data.district || "",
          parish: data.parish || "",
          password: data.password,
          fullName: data.nin,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      toast({ title: "Account created!", description: `Welcome, ${user.fullName}` });
      setLocation("/citizen/dashboard");
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Registration failed", description: err.message }),
  });

  const sidePanel = (
    <div className="w-full bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-green-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-4xl font-display font-bold leading-tight mb-3">Keep Uganda Safe</h2>
        <p className="text-green-50/90 text-lg">Report crimes, get instant SOS help, and stay informed in your community.</p>
      </div>
      <div className="relative space-y-4 mt-12">
        <div className="flex items-start gap-3">
          <Siren className="w-5 h-5 mt-0.5 text-green-200 shrink-0" />
          <div>
            <p className="font-semibold">One-tap SOS</p>
            <p className="text-sm text-green-50/80">Press & hold to alert police with your live GPS.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 mt-0.5 text-green-200 shrink-0" />
          <div>
            <p className="font-semibold">Community alerts</p>
            <p className="text-sm text-green-50/80">Real-time notices from your district police.</p>
          </div>
        </div>
      </div>
      <p className="relative text-xs text-green-100/70 mt-12">Crime Prevention System · Citizen Portal</p>
    </div>
  );

  return (
    <MobileLayout sidePanel={sidePanel}>
      <div className="min-h-screen bg-green-50/50 lg:bg-transparent lg:min-h-0">
        <div className="p-6 pt-8 pb-20">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => setLocation("/role-selection")}>
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Button>

          <div className="flex items-center gap-3 mt-6 mb-2">
            <img src="/logo.png" alt="CPS" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <h1 className="text-2xl font-display font-bold text-green-900">Citizen Portal</h1>
              <p className="text-muted-foreground text-sm">Access emergency services and community safety tools.</p>
            </div>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-green-100/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                <form onSubmit={loginForm.handleSubmit(d => loginMutation.mutate(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" />Phone Number</Label>
                    <Input
                      {...loginForm.register("phone")}
                      placeholder="0701234567"
                      className="h-12 rounded-xl bg-white border-green-100 focus:border-green-500"
                    />
                    {loginForm.formState.errors.phone && <span className="text-red-500 text-xs">{String(loginForm.formState.errors.phone.message)}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...loginForm.register("password")}
                        className="h-12 rounded-xl bg-white border-green-100 focus:border-green-500 pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && <span className="text-red-500 text-xs">{String(loginForm.formState.errors.password.message)}</span>}
                  </div>
                  <Button disabled={loginMutation.isPending} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold shadow-lg shadow-green-600/20">
                    {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                <div className="mb-4 p-3 bg-green-50 rounded-xl text-sm text-green-800 border border-green-100">
                  <strong>Registration requires a valid NIN.</strong> Your name will be automatically filled from the national citizens register.
                </div>
                <form onSubmit={signupForm.handleSubmit(d => signupMutation.mutate(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" />Phone Number</Label>
                    <Input {...signupForm.register("phone")} placeholder="0701234567" className="h-12 bg-white border-green-100 focus:border-green-500" />
                    {signupForm.formState.errors.phone && <span className="text-red-500 text-xs">{String(signupForm.formState.errors.phone.message)}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>NIN (National ID Number)</Label>
                    <Input {...signupForm.register("nin")} placeholder="CM010825OGW001" className="h-12 bg-white border-green-100 focus:border-green-500 uppercase" />
                    {signupForm.formState.errors.nin && <span className="text-red-500 text-xs">{String(signupForm.formState.errors.nin.message)}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Input {...signupForm.register("district")} placeholder="Kampala" className="bg-white border-green-100 focus:border-green-500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parish</Label>
                      <Input {...signupForm.register("parish")} placeholder="Central" className="bg-white border-green-100 focus:border-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...signupForm.register("password")} className="h-12 bg-white border-green-100 focus:border-green-500 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && <span className="text-red-500 text-xs">{String(signupForm.formState.errors.password.message)}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" {...signupForm.register("confirmPassword")} className="h-12 bg-white border-green-100 focus:border-green-500" />
                    {signupForm.formState.errors.confirmPassword && <span className="text-red-500 text-xs">{String(signupForm.formState.errors.confirmPassword.message)}</span>}
                  </div>
                  <Button disabled={signupMutation.isPending} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold shadow-lg shadow-green-600/20">
                    {signupMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
