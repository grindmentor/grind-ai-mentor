import React, { forwardRef, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useMobileEnhancements } from '@/hooks/useMobileEnhancements';

const nativeButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation no-tap-highlight gpu-accelerated",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        native: "bg-accent/10 text-foreground border border-border/20 hover:bg-accent/20 active:bg-accent/30 backdrop-blur-sm",
        primary: "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 active:from-orange-700 active:to-red-800 shadow-lg",
        premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 shadow-lg"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl"
      },
      haptic: {
        none: "",
        light: "",
        medium: "",
        heavy: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      haptic: "light"
    }
  }
);

export interface NativeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof nativeButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  pressEffect?: boolean;
}

const NativeButton = forwardRef<HTMLButtonElement, NativeButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    haptic, 
    asChild = false, 
    loading = false,
    pressEffect = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [isPressed, setIsPressed] = useState(false);
    const { hapticFeedback } = useMobileEnhancements();

    const handleTouchStart = () => {
      if (pressEffect) {
        setIsPressed(true);
      }
    };

    const handleTouchEnd = () => {
      if (pressEffect) {
        setIsPressed(false);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      if (haptic && haptic !== 'none') {
        hapticFeedback(haptic);
      }
      
      // Call original onClick
      if (onClick && !loading && !props.disabled) {
        onClick(e);
      }
    };

    return (
      <Comp
        className={cn(
          nativeButtonVariants({ variant, size, className }),
          isPressed && pressEffect && "scale-95 opacity-80",
          loading && "opacity-70 pointer-events-none"
        )}
        ref={ref}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
NativeButton.displayName = "NativeButton";

export { NativeButton, nativeButtonVariants };