import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
  /** Optional branded panel shown on the left at lg+ screens (desktop). */
  sidePanel?: ReactNode;
  /** When true (default), constrains content to a phone-like column on large screens.
   *  Set to false to let pages spread to full width on desktop (e.g. police dashboards). */
  phoneFrame?: boolean;
}

export function MobileLayout({
  children,
  className = "",
  sidePanel,
  phoneFrame = true,
}: MobileLayoutProps) {
  // Desktop split layout: brand panel on the left, content card on the right.
  if (sidePanel) {
    return (
      <div className="min-h-screen bg-neutral-100 lg:flex">
        {/* Brand side panel — only visible on lg+ */}
        <aside className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
          {sidePanel}
        </aside>

        {/* Content side */}
        <div className="flex-1 flex justify-center lg:items-center min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full sm:max-w-lg lg:max-w-xl bg-background min-h-screen lg:min-h-0 lg:my-8 lg:rounded-2xl lg:shadow-xl relative ${className}`}
          >
            {children}
          </motion.div>
        </div>
      </div>
    );
  }

  // Default responsive layout (no side panel).
  // - Phone (<sm): full width, edge-to-edge
  // - Tablet (sm–lg): centered card, max-w-lg
  // - Desktop (lg+): wider centered card with shadow OR full width depending on phoneFrame
  const widthClasses = phoneFrame
    ? "w-full sm:max-w-lg md:max-w-xl"
    : "w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl";

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${widthClasses} bg-background min-h-screen sm:shadow-xl relative ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
