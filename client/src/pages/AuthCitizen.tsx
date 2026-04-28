import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck, Bell, Siren } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export default function AuthCitizen() {
  const [, setLocation] = useLocation();
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm({ 
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'citizen', isVerified: false }
  });

  const onLogin = (data: any) => {
    login(data);
  };

  const onSignup = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = data;
    register(rest);
  };

  const sidePanel = (
    <div className="w-full bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-green-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-4xl font-display font-bold leading-tight mb-3">
          Keep Uganda Safe
        </h2>
        <p className="text-green-50/90 text-lg">
          Report crimes, get instant SOS help, and stay informed in your community.
        </p>
      </div>

      <div className="relative space-y-4 mt-12">
        <div className="flex items-start gap-3">
          <Siren className="w-5 h-5 mt-0.5 text-green-200 shrink-0" />
          <div>
            <p className="font-semibold">One-tap SOS</p>
            <p className="text-sm text-green-50/80">Press &amp; hold to alert police with your live GPS.</p>
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

      <p className="relative text-xs text-green-100/70 mt-12">
        Crime Prevention System · Citizen Portal
      </p>
    </div>
  );

  return (
    <MobileLayout sidePanel={sidePanel}>
      <div className="min-h-screen bg-green-50/50 lg:bg-transparent lg:min-h-0">
        <div className="p-6 pt-8">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => setLocation("/role-selection")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-display font-bold text-green-900 mt-4 mb-2">Citizen Portal</h1>
          <p className="text-muted-foreground mb-8">Access emergency services and community safety tools.</p>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-green-100/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-green-700">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input {...loginForm.register("username")} className="h-12 rounded-xl bg-white border-green-100 focus:border-green-500 focus:ring-green-500/20" />
                  {loginForm.formState.errors.username && <span className="text-red-500 text-xs">{String(loginForm.formState.errors.username.message)}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} {...loginForm.register("password")} className="h-12 rounded-xl bg-white border-green-100 focus:border-green-500 focus:ring-green-500/20 pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <span className="text-red-500 text-xs">{String(loginForm.formState.errors.password.message)}</span>}
                </div>
                <Button disabled={isLoggingIn} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold shadow-lg shadow-green-600/20">
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input {...signupForm.register("username")} className="bg-white border-green-100 focus:border-green-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...signupForm.register("fullName")} className="bg-white border-green-100 focus:border-green-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input {...signupForm.register("email")} className="bg-white border-green-100 focus:border-green-500" />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...signupForm.register("phone")} className="bg-white border-green-100 focus:border-green-500" />
                </div>

                <div className="space-y-2">
                  <Label>NIN (National ID)</Label>
                  <Input {...signupForm.register("nin")} className="bg-white border-green-100 focus:border-green-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input {...signupForm.register("district")} className="bg-white border-green-100 focus:border-green-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Parish</Label>
                    <Input {...signupForm.register("parish")} className="bg-white border-green-100 focus:border-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} {...signupForm.register("password")} className="bg-white border-green-100 focus:border-green-500 pr-10" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && <span className="text-red-500 text-xs">{String(signupForm.formState.errors.password.message)}</span>}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type={showPassword ? "text" : "password"} {...signupForm.register("confirmPassword")} className="bg-white border-green-100 focus:border-green-500" />
                </div>

                <Button disabled={isRegistering} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold shadow-lg shadow-green-600/20 mt-4">
                   {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
