import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = "" }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`w-full max-w-[480px] bg-background min-h-screen shadow-2xl relative ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
