import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  sidePanel?: ReactNode;
  phoneFrame?: boolean;
}

export function MobileLayout({
  children,
  className = "",
  sidePanel,
}: MobileLayoutProps) {
  // Auth pages: brand panel on left, form on right (desktop split)
  if (sidePanel) {
    return (
      <div className="min-h-screen w-full flex">
        <aside className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden flex-shrink-0">
          {sidePanel}
        </aside>
        <div className="flex-1 flex justify-center lg:items-center min-h-screen overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-lg lg:max-w-xl bg-background min-h-screen lg:min-h-0 relative ${className}`}
          >
            {children}
          </motion.div>
        </div>
      </div>
    );
  }

  // Default: true full-screen auto-fit — fills the entire viewport on any device
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`min-h-screen w-full bg-background ${className}`}
    >
      {children}
    </motion.div>
  );
}
