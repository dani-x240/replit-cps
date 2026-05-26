import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Welcome from "@/pages/Welcome";
import RoleSelection from "@/pages/RoleSelection";
import SignupRoleSelection from "@/pages/SignupRoleSelection";
import PoliceRoles from "@/pages/PoliceRoles";
import AuthCitizen from "@/pages/AuthCitizen";
import AuthPolice from "@/pages/AuthPolice";
import PendingApproval from "@/pages/PendingApproval";
import AdminDashboard from "@/pages/AdminDashboard";
import CitizenDashboard from "@/pages/CitizenDashboard";
import CitizenReport from "@/pages/CitizenReport";
import CitizenSOS from "@/pages/CitizenSOS";
import CitizenChat from "@/pages/CitizenChat";
import CitizenMyCases from "@/pages/CitizenMyCases";
import CitizenCaseDetail from "@/pages/CitizenCaseDetail";
import CitizenEvidenceVault from "@/pages/CitizenEvidenceVault";
import CitizenAlertsFeed from "@/pages/CitizenAlertsFeed";
import CitizenPoliceForms from "@/pages/CitizenPoliceForms";
import PoliceDashboard from "@/pages/PoliceDashboard";
import PoliceIOCases from "@/pages/PoliceIOCases";

function Router() {
  return (
    <Switch>
      {/* Welcome & Role selection */}
      <Route path="/" component={Welcome} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/signup-role" component={SignupRoleSelection} />
      <Route path="/police/roles" component={PoliceRoles} />

      {/* Auth */}
      <Route path="/auth/citizen" component={AuthCitizen} />
      <Route path="/auth/police" component={AuthPolice} />

      {/* Pending / rejected */}
      <Route path="/pending-approval" component={PendingApproval} />

      {/* Admin dashboard */}
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* Citizen */}
      <Route path="/citizen/dashboard" component={CitizenDashboard} />
      <Route path="/citizen/report" component={CitizenReport} />
      <Route path="/citizen/sos" component={CitizenSOS} />
      <Route path="/citizen/chat" component={CitizenChat} />
      <Route path="/citizen/cases" component={CitizenMyCases} />
      <Route path="/citizen/cases/:id" component={CitizenCaseDetail} />
      <Route path="/citizen/evidence" component={CitizenEvidenceVault} />
      <Route path="/citizen/alerts" component={CitizenAlertsFeed} />
      <Route path="/citizen/forms" component={CitizenPoliceForms} />

      {/* Police */}
      <Route path="/police/dashboard/:role" component={PoliceDashboard} />
      <Route path="/police/cases" component={PoliceIOCases} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
