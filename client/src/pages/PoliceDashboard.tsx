import { useAuth } from "@/hooks/use-auth";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/use-reports";
import { useLocation, useRoute } from "wouter";
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Users, 
  ShieldAlert,
  ChevronRight,
  Clock,
  MapPin
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function PoliceDashboard() {
  const { user, logout } = useAuth();
  const { data: reports, isLoading } = useReports();
  const [, params] = useRoute("/police/dashboard/:role");
  const role = params?.role || "io";

  if (!user) return null;

  return (
    <MobileLayout>
      <div className="bg-blue-700 text-white p-6 pb-24 rounded-b-[2.5rem] shadow-xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider font-semibold">
                {role === 'dpc' ? 'District Commander' : role === 'oc' ? 'OC Station' : 'Investigating Officer'}
              </p>
              <h2 className="font-display font-bold text-xl">{user.fullName}</h2>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full" onClick={() => logout()}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-800/50 backdrop-blur-md p-3 rounded-xl border border-blue-500/30">
            <div className="text-2xl font-bold mb-1">12</div>
            <div className="text-xs text-blue-200">New Cases</div>
          </div>
          <div className="bg-blue-800/50 backdrop-blur-md p-3 rounded-xl border border-blue-500/30">
            <div className="text-2xl font-bold mb-1">5</div>
            <div className="text-xs text-blue-200">Pending</div>
          </div>
          <div className="bg-blue-800/50 backdrop-blur-md p-3 rounded-xl border border-blue-500/30">
            <div className="text-2xl font-bold mb-1">28</div>
            <div className="text-xs text-blue-200">Resolved</div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20 pb-20">
        <h3 className="font-display font-bold text-lg mb-4 text-white">Recent Reports</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-4 bg-white rounded-xl shadow-sm text-center text-muted-foreground">Loading cases...</div>
          ) : reports?.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  px-2 py-1 rounded-md text-xs font-medium uppercase
                  ${report.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}
                `}>
                  {report.type}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.createdAt && formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-900 mb-1">{report.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{report.description}</p>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {report.location || "Unknown"}
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 p-0">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
