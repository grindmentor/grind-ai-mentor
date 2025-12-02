import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
  showHandle?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  className,
  showHandle = true,
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const y = useMotionValue(0);
  const hasTriggeredHaptic = useRef(false);
  
  // Calculate snap positions in pixels from bottom
  const snapPositions = snapPoints.map(point => windowHeight * (1 - point));
  const initialY = snapPositions[initialSnap] || snapPositions[0];
  
  // Transforms for visual effects
  const overlayOpacity = useTransform(y, [windowHeight, 0], [0, 0.5]);
  const sheetScale = useTransform(y, [windowHeight, 0], [0.95, 1]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      triggerHapticFeedback('light');
      animate(y, initialY, { type: 'spring', stiffness: 400, damping: 30 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialY, y]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    // Haptic feedback when crossing snap points
    const currentY = y.get();
    for (const snapY of snapPositions) {
      if (Math.abs(currentY - snapY) < 20 && !hasTriggeredHaptic.current) {
        triggerHapticFeedback('light');
        hasTriggeredHaptic.current = true;
        break;
      }
    }
    
    if (Math.abs(currentY - snapPositions[0]) > 30) {
      hasTriggeredHaptic.current = false;
    }
  }, [y, snapPositions]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const currentY = y.get();
    const velocity = info.velocity.y;
    
    // If dragging down fast or past threshold, close
    if (velocity > 500 || currentY > windowHeight * 0.7) {
      triggerHapticFeedback('medium');
      animate(y, windowHeight, { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        onComplete: onClose
      });
      return;
    }
    
    // Find nearest snap point
    let nearestSnap = snapPositions[0];
    let minDistance = Math.abs(currentY - nearestSnap);
    
    for (const snapY of snapPositions) {
      const distance = Math.abs(currentY - snapY);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = snapY;
      }
    }
    
    // Consider velocity for snap decision
    if (velocity > 100 && snapPositions.indexOf(nearestSnap) < snapPositions.length - 1) {
      nearestSnap = snapPositions[snapPositions.indexOf(nearestSnap) + 1];
    } else if (velocity < -100 && snapPositions.indexOf(nearestSnap) > 0) {
      nearestSnap = snapPositions[snapPositions.indexOf(nearestSnap) - 1];
    }
    
    triggerHapticFeedback('light');
    animate(y, nearestSnap, { type: 'spring', stiffness: 400, damping: 30 });
    hasTriggeredHaptic.current = false;
  }, [y, windowHeight, snapPositions, onClose]);

  const handleClose = useCallback(() => {
    triggerHapticFeedback('light');
    animate(y, windowHeight, { 
      type: 'spring', 
      stiffness: 400, 
      damping: 30,
      onComplete: onClose
    });
  }, [y, windowHeight, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? handleClose : undefined}
          />
          
          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: windowHeight }}
            animate={{ y: initialY }}
            exit={{ y: windowHeight }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            drag="y"
            dragConstraints={{ top: snapPositions[snapPositions.length - 1], bottom: windowHeight }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ y, scale: sheetScale }}
            className={cn(
              "fixed left-0 right-0 bottom-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden",
              "max-h-[90vh]",
              className
            )}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
            )}
            
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                {title && (
                  <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {children}
            </div>
            
            {/* Safe area padding for iOS */}
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Action sheet variant for quick actions
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }[];
  title?: string;
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  actions,
  title,
  cancelLabel = 'Cancel'
}) => {
  const handleActionClick = (action: ActionSheetProps['actions'][0]) => {
    if (action.disabled) return;
    triggerHapticFeedback('light');
    action.onClick();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.4]}
      showCloseButton={false}
      title={title}
    >
      <div className="p-4 space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-colors",
              action.variant === 'destructive' 
                ? "text-destructive hover:bg-destructive/10" 
                : "text-foreground hover:bg-muted",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {action.icon && <span className="w-5 h-5">{action.icon}</span>}
            <span className="text-base font-medium">{action.label}</span>
          </button>
        ))}
        
        <button
          onClick={onClose}
          className="w-full px-4 py-4 rounded-xl text-muted-foreground hover:bg-muted transition-colors mt-2"
        >
          <span className="text-base font-medium">{cancelLabel}</span>
        </button>
      </div>
    </BottomSheet>
  );
};

export default BottomSheet;
