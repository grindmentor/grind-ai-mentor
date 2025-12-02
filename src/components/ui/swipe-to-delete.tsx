import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { Trash2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  onUndo?: () => void;
  deleteThreshold?: number;
  className?: string;
  disabled?: boolean;
  deleteLabel?: string;
}

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  children,
  onDelete,
  onUndo,
  deleteThreshold = 100,
  className,
  disabled = false,
  deleteLabel = 'Delete'
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const hasTriggeredHaptic = useRef(false);
  
  // Transform values for the delete background
  const deleteOpacity = useTransform(x, [-deleteThreshold, -deleteThreshold / 2, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-deleteThreshold, -deleteThreshold / 2, 0], [1, 0.8, 0.5]);
  const iconRotation = useTransform(x, [-deleteThreshold, 0], [0, 45]);
  
  // Background color intensity based on swipe distance
  const bgOpacity = useTransform(x, [-deleteThreshold * 1.5, -deleteThreshold, 0], [1, 0.8, 0]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const shouldDelete = info.offset.x < -deleteThreshold;
    
    if (shouldDelete && !disabled) {
      // Trigger strong haptic for delete confirmation
      triggerHapticFeedback('heavy');
      
      setIsDeleting(true);
      
      // Animate out completely
      animate(x, -window.innerWidth, {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        onComplete: () => {
          onDelete();
          if (onUndo) {
            setShowUndo(true);
            // Auto-hide undo after 5 seconds
            setTimeout(() => setShowUndo(false), 5000);
          }
        }
      });
    } else {
      // Snap back
      animate(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 30
      });
    }
    
    hasTriggeredHaptic.current = false;
  }, [x, deleteThreshold, disabled, onDelete, onUndo]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    // Trigger haptic when crossing threshold
    if (info.offset.x < -deleteThreshold && !hasTriggeredHaptic.current) {
      triggerHapticFeedback('medium');
      hasTriggeredHaptic.current = true;
    } else if (info.offset.x > -deleteThreshold && hasTriggeredHaptic.current) {
      triggerHapticFeedback('light');
      hasTriggeredHaptic.current = false;
    }
  }, [deleteThreshold]);

  const handleUndo = useCallback(() => {
    triggerHapticFeedback('light');
    setIsDeleting(false);
    setShowUndo(false);
    onUndo?.();
  }, [onUndo]);

  if (isDeleting && showUndo) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border border-border/50"
      >
        <span className="text-sm text-muted-foreground">Item deleted</span>
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
      </motion.div>
    );
  }

  if (isDeleting) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-lg", className)}
    >
      {/* Delete background */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-end px-6 bg-gradient-to-l from-destructive to-destructive/80 rounded-lg"
        style={{ opacity: bgOpacity }}
      >
        <motion.div 
          className="flex items-center gap-2 text-destructive-foreground"
          style={{ opacity: deleteOpacity, scale: deleteScale }}
        >
          <motion.div style={{ rotate: iconRotation }}>
            <Trash2 className="w-5 h-5" />
          </motion.div>
          <span className="font-medium text-sm">{deleteLabel}</span>
        </motion.div>
      </motion.div>
      
      {/* Draggable content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -deleteThreshold * 1.5, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-card rounded-lg touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Simpler variant for lists with less emphasis
export const SwipeableListItem: React.FC<SwipeToDeleteProps & { showHint?: boolean }> = ({
  children,
  showHint = false,
  ...props
}) => {
  return (
    <SwipeToDelete {...props}>
      <div className="relative">
        {children}
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, delay: 1 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1"
          >
            <span>← Swipe to delete</span>
          </motion.div>
        )}
      </div>
    </SwipeToDelete>
  );
};

export default SwipeToDelete;
