
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
  touchOptimized?: boolean;
  preventOverscroll?: boolean;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className,
  touchOptimized = true,
  preventOverscroll = true
}) => {
  return (
    <div 
      className={cn(
        "relative",
        touchOptimized && "touch-manipulation",
        preventOverscroll && "overscroll-none",
        className
      )}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </div>
  );
};

export const TouchButton: React.FC<{
  children: ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "touch-manipulation select-none",
        "transform transition-all duration-150 ease-out",
        "active:scale-95 active:brightness-90",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </button>
  );
};
