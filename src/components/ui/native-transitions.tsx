import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NativeTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  direction?: 'forward' | 'backward';
  type?: 'slide' | 'fade' | 'scale' | 'modal';
  className?: string;
}

const transitionVariants = {
  slide: {
    initial: (direction: string) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0.8
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0.8
    })
  },
  fade: {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: -20
    }
  },
  scale: {
    initial: {
      scale: 0.9,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1
    },
    exit: {
      scale: 0.9,
      opacity: 0
    }
  },
  modal: {
    initial: {
      scale: 0.8,
      opacity: 0,
      y: 50
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 50
    }
  }
};

const transitionConfig = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.4
};

const reducedMotionConfig = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15
};

export const NativeTransition: React.FC<NativeTransitionProps> = ({
  children,
  routeKey,
  direction = 'forward',
  type = 'slide',
  className
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [routeKey]);

  const variants = transitionVariants[type];
  const config = shouldReduceMotion ? reducedMotionConfig : transitionConfig;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={routeKey}
        custom={direction}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={config}
        className={cn(
          "w-full h-full",
          "gpu-accelerated",
          className
        )}
        style={{
          transformOrigin: 'center',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity'
        }}
        onAnimationComplete={() => setIsVisible(true)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface NativePageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  type?: 'slide-up' | 'slide-down' | 'fade' | 'scale';
  delay?: number;
}

export const NativePageTransition: React.FC<NativePageTransitionProps> = ({
  children,
  isVisible,
  type = 'slide-up',
  delay = 0
}) => {
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = {
    'slide-up': {
      hidden: { y: 30, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    'slide-down': {
      hidden: { y: -30, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={pageVariants[type]}
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: "easeOut",
        delay: shouldReduceMotion ? 0 : delay
      }}
      className="w-full h-full gpu-accelerated"
      style={{
        backfaceVisibility: 'hidden',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </motion.div>
  );
};

export const NativeSlideTransition: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, isOpen, direction = 'up' }) => {
  const shouldReduceMotion = useReducedMotion();

  const slideVariants = {
    up: {
      closed: { y: '100%', opacity: 0 },
      open: { y: 0, opacity: 1 }
    },
    down: {
      closed: { y: '-100%', opacity: 0 },
      open: { y: 0, opacity: 1 }
    },
    left: {
      closed: { x: '100%', opacity: 0 },
      open: { x: 0, opacity: 1 }
    },
    right: {
      closed: { x: '-100%', opacity: 0 },
      open: { x: 0, opacity: 1 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={slideVariants[direction]}
          transition={{
            duration: shouldReduceMotion ? 0.1 : 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="gpu-accelerated"
          style={{
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};