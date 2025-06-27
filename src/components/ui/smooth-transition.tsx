
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothTransitionProps {
  children: ReactNode;
  show: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
  className?: string;
}

const transitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  }
};

export const SmoothTransition: React.FC<SmoothTransitionProps> = ({
  children,
  show,
  type = 'fade',
  duration = 0.3,
  className = ''
}) => {
  const transition = transitions[type];

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={transition.initial}
          animate={transition.animate}
          exit={transition.exit}
          transition={{ duration, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SmoothLayoutTransition: React.FC<{ children: ReactNode }> = ({ children }) => (
  <motion.div
    layout
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
