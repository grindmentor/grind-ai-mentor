
import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  rippleDuration = 600,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, rippleDuration);

    // Call original onClick
    onClick?.(event);
  };

  return (
    <Button
      {...props}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            backgroundColor: rippleColor,
            transform: 'translate(-50%, -50%)',
            animationDuration: `${rippleDuration}ms`,
          }}
        />
      ))}
    </Button>
  );
};
