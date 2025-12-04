import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation active:scale-[0.97] select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-border/60 bg-background hover:bg-muted hover:border-border",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80 shadow-sm",
        ghost: "hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md",
      },
      size: {
        default: "min-h-[44px] h-11 px-5 py-2.5 text-sm",
        sm: "min-h-[36px] h-9 px-3 py-2 text-xs",
        lg: "min-h-[48px] h-12 px-6 py-3 text-base",
        icon: "min-h-[44px] min-w-[44px] h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Lightweight haptic feedback
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(8); } catch {}
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  haptic?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) triggerHaptic();
      onClick?.(e);
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
