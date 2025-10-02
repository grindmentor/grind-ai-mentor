
import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/utils/soundEffects";

interface SmoothButtonProps extends React.ComponentProps<typeof Button> {
  ripple?: boolean;
  soundEnabled?: boolean;
}

export const SmoothButton = forwardRef<HTMLButtonElement, SmoothButtonProps>(
  ({ className, onClick, ripple = true, soundEnabled = true, children, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Play sound effect if enabled
      if (soundEnabled) {
        playClickSound();
      }

      // Create ripple effect
      if (ripple) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const rippleElement = document.createElement('span');
        rippleElement.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(rippleElement);
        
        setTimeout(() => {
          if (rippleElement.parentNode) {
            rippleElement.parentNode.removeChild(rippleElement);
          }
        }, 600);
      }

      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transform transition-all duration-150 ease-out",
          "hover:scale-[1.02] active:scale-[0.98]",
          "hover:shadow-lg active:shadow-sm",
          "focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2",
          "touch-manipulation select-none cursor-pointer",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

SmoothButton.displayName = "SmoothButton";
