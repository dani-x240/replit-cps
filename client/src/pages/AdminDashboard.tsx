import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LogOut, Users, CheckCircle, XCircle, Clock,
  FileText, AlertTriangle, Settings, ChevronRight, User,
  RefreshCw, UserPlus, Eye, EyeOff, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/use-reports";
import { useAlerts } from "@/hooks/use-alerts";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const roleLabel: Record<string, string> = {
  citizen:    "Citizen",
  police_io:  "Investigating Officer",
  police_oc:  "Officer-in-Charge",
  police_dpc: "District Commander",
  admin:      "System Admin",
};

const statusColor: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100  text-red-700  border-red-200",
};

const createOfficerSchema = z.object({
  serviceNumber: z.string().min(3, "Service number required (e.g. PO-12345)"),
  fullName: z.string().min(2, "Full name required"),
  role: z.enum(["police_io", "police_oc", "police_dpc", "admin"]),
  password: z.string().min(8, "Minimum 8 characters"),
  phone: z.string().optional(),
  stationId: z.string().optional(),
});

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: reports } = useReports();
  const { data: alerts }  = useAlerts();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: allUsers = [], isLoading: usersLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const pendingUsers = allUsers.filter((u) => u.accountStatus === "pending");

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users/${id}/approve`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User approved", description: "They now have full access." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users/${id}/reject`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User rejected" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const officerForm = useForm({
    resolver: zodResolver(createOfficerSchema),
    defaultValues: { serviceNumber: "", fullName: "", role: "police_io" as const, password: "", phone: "", stationId: "" },
  });

  const createOfficerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createOfficerSchema>) => {
      const res = await fetch("/api/admin/users/create-officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create officer");
      }
      return res.json();
    },
    onSuccess: (u) => {
      toast({ title: "Officer account created", description: `${u.fullName} — Service No: ${u.serviceNumber}` });
      officerForm.reset();
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: Error) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });

  if (!user || user.role !== "admin") return null;

  return (
    <MobileLayout className="bg-gradient-to-br from-purple-50/60 to-indigo-50/30 min-h-screen">
      <div className="w-full min-h-screen flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-purple-100 px-4 sm:px-8 lg:px-14 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CPS" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <p className="text-xs text-purple-600/70 font-medium">System Administrator</p>
              <h1 className="text-base font-display font-bold text-purple-900 leading-tight">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 rounded-xl"
              onClick={() => setShowCreateForm(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Officer</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="text-red-500 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 lg:px-14 pt-6 pb-10 space-y-8">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Users",    value: allUsers.length,      icon: Users,        color: "purple" },
              { label: "Pending Review", value: pendingUsers.length,  icon: Clock,        color: "amber"  },
              { label: "Total Cases",    value: (reports as any[])?.length ?? 0, icon: FileText,  color: "blue"   },
              { label: "Active Alerts",  value: (alerts  as any[])?.length ?? 0, icon: AlertTriangle, color: "red" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-purple-100 p-4 flex flex-col gap-2"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                  ${stat.color === "purple" ? "bg-purple-100 text-purple-600" :
                    stat.color === "amber"  ? "bg-amber-100  text-amber-600"  :
                    stat.color === "blue"   ? "bg-blue-100   text-blue-600"   :
                                              "bg-red-100    text-red-600"    }`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-purple-900">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Create Officer Form (expandable) */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-purple-900">Create Police Officer Account</h3>
                      <p className="text-xs text-muted-foreground">Officer will login with their service number + password</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <form onSubmit={officerForm.handleSubmit(d => createOfficerMutation.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Service Number *</Label>
                        <Input {...officerForm.register("serviceNumber")} placeholder="e.g. PO-12345" className="border-purple-100 focus:border-purple-500" />
                        {officerForm.formState.errors.serviceNumber && <span className="text-red-500 text-xs">{officerForm.formState.errors.serviceNumber.message}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input {...officerForm.register("fullName")} placeholder="e.g. Otim Joshua" className="border-purple-100 focus:border-purple-500" />
                        {officerForm.formState.errors.fullName && <span className="text-red-500 text-xs">{officerForm.formState.errors.fullName.message}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Role *</Label>
                        <select {...officerForm.register("role")} className="w-full h-10 rounded-md border border-purple-100 px-3 text-sm focus:outline-none focus:border-purple-500 bg-white">
                          <option value="police_io">Investigating Officer (IO)</option>
                          <option value="police_oc">Officer-in-Charge (OC)</option>
                          <option value="police_dpc">District Commander (DPC)</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Station ID</Label>
                        <Input {...officerForm.register("stationId")} placeholder="e.g. CPS-KAMPALA" className="border-purple-100 focus:border-purple-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone Number</Label>
                        <Input {...officerForm.register("phone")} placeholder="0701234567" className="border-purple-100 focus:border-purple-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Password *</Label>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...officerForm.register("password")} placeholder="Min 8 characters" className="border-purple-100 focus:border-purple-500 pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {officerForm.formState.errors.password && <span className="text-red-500 text-xs">{officerForm.formState.errors.password.message}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" disabled={createOfficerMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                        {createOfficerMutation.isPending ? "Creating..." : "Create Officer Account"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { officerForm.reset(); setShowCreateForm(false); }}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick links */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-600/70 mb-3">Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Case Management",  icon: FileText,      desc: "View and manage all system cases",      path: "/police/cases" },
                { label: "Community Alerts", icon: AlertTriangle, desc: "Post and manage district-wide alerts",  path: "/citizen/alerts" },
                { label: "Create Officer",   icon: UserPlus,      desc: "Add a new police officer account",      action: () => setShowCreateForm(true) },
              ].map((action, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between group cursor-pointer"
                  onClick={() => (action as any).action ? (action as any).action() : action.path && setLocation(action.path)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-200 group-hover:text-purple-500 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pending approvals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-600/70 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Pending Approvals
                {pendingUsers.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingUsers.length}
                  </span>
                )}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-purple-600 h-7 px-2">
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            </div>

            {usersLoading ? (
              <div className="bg-white rounded-2xl border border-purple-100 p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-purple-100 p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {pendingUsers.map((u: any) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-2xl border border-amber-100 p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-purple-900 text-sm truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">@{u.username} · {roleLabel[u.role] || u.role}</p>
                        {u.stationId && <p className="text-xs text-blue-600 mt-0.5">Station: {u.stationId}</p>}
                        {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 text-xs"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(u.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-3 text-xs"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(u.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* All users */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-600/70 mb-3">
              All Users ({allUsers.length})
            </h2>
            <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
              {allUsers.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No users found</p>
              ) : (
                <div className="divide-y divide-purple-50">
                  {allUsers.map((u: any) => (
                    <div key={u.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        {u.role === "citizen"
                          ? <User className="w-4 h-4 text-green-500" />
                          : <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-900 truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.serviceNumber ? `SN: ${u.serviceNumber}` : `📞 ${u.username}`} · {roleLabel[u.role] || u.role}
                        </p>
                      </div>
                      <Badge className={`text-xs border shrink-0 ${statusColor[u.accountStatus] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {u.accountStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admin credentials reminder */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm">
            <p className="font-semibold text-blue-900 mb-1">First-time Admin Access</p>
            <p className="text-blue-700">Phone: <strong>0700000001</strong> · Password: <strong>Admin@CPS2026</strong></p>
            <p className="text-blue-600 text-xs mt-1">All logins use phone number + password. Create officer accounts from this dashboard.</p>
          </div>
        </main>
      </div>
    </MobileLayout>
  );
}
