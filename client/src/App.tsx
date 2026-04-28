import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Welcome from "@/pages/Welcome";
import RoleSelection from "@/pages/RoleSelection";
import PoliceRoles from "@/pages/PoliceRoles";
import AuthCitizen from "@/pages/AuthCitizen";
import AuthPolice from "@/pages/AuthPolice";
import CitizenDashboard from "@/pages/CitizenDashboard";
import CitizenReport from "@/pages/CitizenReport";
import CitizenSOS from "@/pages/CitizenSOS";
import CitizenChat from "@/pages/CitizenChat";
import PoliceDashboard from "@/pages/PoliceDashboard";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Welcome} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/police/roles" component={PoliceRoles} />
      
      {/* Auth Routes */}
      <Route path="/auth/citizen" component={AuthCitizen} />
      <Route path="/auth/police" component={AuthPolice} />
      
      {/* Protected Citizen Routes */}
      <Route path="/citizen/dashboard" component={CitizenDashboard} />
      <Route path="/citizen/report" component={CitizenReport} />
      <Route path="/citizen/sos" component={CitizenSOS} />
      <Route path="/citizen/chat" component={CitizenChat} />
      
      {/* Protected Police Routes */}
      <Route path="/police/dashboard/:role" component={PoliceDashboard} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
