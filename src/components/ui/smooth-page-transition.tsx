import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 10,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: -10,
    scale: 0.98
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.3
};

export const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  routeKey,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [routeKey]);

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
        onAnimationComplete={() => setIsVisible(true)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};