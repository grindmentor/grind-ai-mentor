import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  className?: string;
}

// Simple fade - no sliding for "strong" feel
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15
};

export const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  routeKey,
  className = ""
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={`w-full h-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};