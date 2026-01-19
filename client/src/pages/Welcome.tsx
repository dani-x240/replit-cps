import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/layout/MobileLayout";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <MobileLayout>
      <div className="h-screen flex flex-col items-center justify-between p-8 bg-[url('https://pixabay.com/get/g2e99c6c34a1968be53afad47cd468def7c5305206977625285d13233c51384cfc87a5e1812263093a319e8609891cc000a2254582e75bc9995e7d56c1f8b9f0b_1280.jpg')] bg-cover bg-center relative">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-20 w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl mb-8"
          >
            <Shield className="w-12 h-12 text-yellow-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-display font-bold text-white text-center mb-2"
          >
            CPS Mobile
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-400 text-center text-lg max-w-xs"
          >
            Safety & Security for Every Citizen
          </motion.p>
        </div>

        <div className="relative z-10 w-full space-y-4 pb-12">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-neutral-100 rounded-xl"
              onClick={() => setLocation("/role-selection")}
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/40 text-sm"
          >
            Uganda Police Force © 2025
          </motion.p>
        </div>
      </div>
    </MobileLayout>
  );
}
