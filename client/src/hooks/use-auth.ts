import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser, type LoginRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

function routeAfterAuth(user: any, setLocation: (path: string) => void) {
  if (user.role === "citizen") {
    setLocation("/citizen/dashboard");
    return;
  }
  if (user.accountStatus === "pending") {
    setLocation("/pending-approval");
    return;
  }
  if (user.accountStatus === "rejected") {
    setLocation("/");
    return;
  }
  if (user.role === "admin") {
    setLocation("/admin/dashboard");
    return;
  }
  setLocation(`/police/dashboard/${user.role}`);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (!res.ok) return null;
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      if (user.accountStatus === "pending") {
        toast({ title: "Account pending", description: "Waiting for admin approval." });
      } else {
        toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
      }
      routeAfterAuth(user, setLocation);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(error.message);
      }
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      if (user.accountStatus === "pending") {
        toast({ title: "Account created!", description: "Awaiting admin approval before you can access the system." });
        setLocation("/pending-approval");
      } else {
        toast({ title: "Account created!", description: "Welcome to CPS Mobile" });
        routeAfterAuth(user, setLocation);
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Registration failed", description: error.message });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { method: api.auth.logout.method, credentials: "include" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/");
      toast({ title: "Logged out", description: "See you next time" });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
