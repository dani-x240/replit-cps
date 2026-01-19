import { useAlerts } from "@/hooks/use-alerts";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export function AlertFeed() {
  const { data: alerts, isLoading } = useAlerts();

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading alerts...</div>;
  }

  if (!alerts?.length) {
    return <div className="p-8 text-center text-muted-foreground">No active alerts in your area.</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {alerts.map((alert, idx) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`
            p-4 rounded-xl border shadow-sm relative overflow-hidden
            ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-white border-border'}
          `}
        >
          {alert.severity === 'critical' && (
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          )}
          
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className={`
                p-1.5 rounded-lg 
                ${alert.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}
              `}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {alert.type.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {alert.createdAt && formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <h3 className="font-display font-bold text-lg mb-1">{alert.title}</h3>
          <p className="text-sm text-neutral-600 mb-3">{alert.content}</p>
          
          {alert.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/50 w-fit px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3" />
              {alert.location}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
