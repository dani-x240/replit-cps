import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ArrowLeft, Loader2, Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPolice() {
  const [, setLocation] = useLocation();
  const { login, isLoggingIn } = useAuth();
  const form = useForm({ resolver: zodResolver(loginSchema) });

  return (
    <MobileLayout>
      <div className="min-h-screen bg-blue-50/50">
        <div className="p-6 pt-8">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => setLocation("/role-selection")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="flex flex-col items-center mt-8 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-700">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-display font-bold text-blue-900 text-center">Police Portal</h1>
            <p className="text-muted-foreground text-center">Restricted Access System</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <form onSubmit={form.handleSubmit((d) => login(d))} className="space-y-4">
              <div className="space-y-2">
                <Label>Badge Number / Username</Label>
                <Input {...form.register("username")} className="h-12 rounded-xl border-blue-100 focus:border-blue-500 focus:ring-blue-500/20" />
                {form.formState.errors.username && <span className="text-red-500 text-xs">{String(form.formState.errors.username.message)}</span>}
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...form.register("password")} className="h-12 rounded-xl border-blue-100 focus:border-blue-500 focus:ring-blue-500/20" />
                {form.formState.errors.password && <span className="text-red-500 text-xs">{String(form.formState.errors.password.message)}</span>}
              </div>
              <Button disabled={isLoggingIn} className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-lg font-semibold shadow-lg shadow-blue-700/20">
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            Unauthorized access is a criminal offense under the Computer Misuse Act.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
