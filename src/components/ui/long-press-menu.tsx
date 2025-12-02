import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Share2, Trash2, MoreVertical, Copy, Star, Archive, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

export interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface LongPressMenuProps {
  children: React.ReactNode;
  actions: MenuAction[];
  disabled?: boolean;
  longPressDuration?: number;
  className?: string;
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  children,
  actions,
  disabled = false,
  longPressDuration = 500,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    isLongPress.current = false;
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      triggerHapticFeedback('medium');
      
      // Calculate menu position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.min(touch.clientX, window.innerWidth - 200);
        const y = Math.min(touch.clientY, window.innerHeight - 250);
        setMenuPosition({ x, y });
      }
      
      setIsOpen(true);
    }, longPressDuration);
  }, [disabled, longPressDuration]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleActionClick = useCallback((action: MenuAction) => {
    if (action.disabled) return;
    
    triggerHapticFeedback('light');
    setIsOpen(false);
    action.onClick();
  }, []);

  const handleClose = useCallback(() => {
    triggerHapticFeedback('light');
    setIsOpen(false);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      setIsOpen(false);
    };
    
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={cn("touch-none select-none", className)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!disabled) {
            triggerHapticFeedback('medium');
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setIsOpen(true);
          }
        }}
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="fixed z-50 min-w-[180px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
                transformOrigin: 'top left'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    action.variant === 'destructive' 
                      ? "text-destructive hover:bg-destructive/10" 
                      : "text-foreground hover:bg-muted",
                    action.disabled && "opacity-50 cursor-not-allowed",
                    index !== actions.length - 1 && "border-b border-border/50"
                  )}
                >
                  <span className="w-5 h-5">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Pre-built action creators for common actions
export const createEditAction = (onClick: () => void): MenuAction => ({
  id: 'edit',
  label: 'Edit',
  icon: <Edit className="w-5 h-5" />,
  onClick
});

export const createDeleteAction = (onClick: () => void): MenuAction => ({
  id: 'delete',
  label: 'Delete',
  icon: <Trash2 className="w-5 h-5" />,
  onClick,
  variant: 'destructive'
});

export const createShareAction = (onClick: () => void): MenuAction => ({
  id: 'share',
  label: 'Share',
  icon: <Share2 className="w-5 h-5" />,
  onClick
});

export const createCopyAction = (onClick: () => void): MenuAction => ({
  id: 'copy',
  label: 'Copy',
  icon: <Copy className="w-5 h-5" />,
  onClick
});

export const createFavoriteAction = (onClick: () => void, isFavorite: boolean): MenuAction => ({
  id: 'favorite',
  label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
  icon: <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />,
  onClick
});

export const createArchiveAction = (onClick: () => void): MenuAction => ({
  id: 'archive',
  label: 'Archive',
  icon: <Archive className="w-5 h-5" />,
  onClick
});

export default LongPressMenu;
