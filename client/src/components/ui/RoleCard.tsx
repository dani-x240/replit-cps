import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  color: "citizen" | "police";
  selected?: boolean;
  onClick: () => void;
}

export function RoleCard({ title, icon: Icon, description, color, selected, onClick }: RoleCardProps) {
  const isCitizen = color === "citizen";
  const borderColor = selected 
    ? (isCitizen ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50")
    : "border-border bg-card";
    
  const iconColor = isCitizen ? "text-green-600" : "text-blue-600";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full p-6 rounded-2xl border-2 text-left transition-all duration-200
        ${borderColor} hover:shadow-lg
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isCitizen ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold font-display mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}
