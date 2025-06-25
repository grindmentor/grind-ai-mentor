
import React, { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  hoverEffect?: boolean;
  slideUp?: boolean;
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverEffect = true, slideUp = true, delay = 0, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-out",
          slideUp && "animate-fade-in",
          hoverEffect && [
            "hover:scale-[1.01] hover:shadow-xl hover:shadow-orange-500/10",
            "hover:-translate-y-1"
          ],
          "transform-gpu", // Enable GPU acceleration
          className
        )}
        style={{
          animationDelay: `${delay}ms`,
          animationFillMode: 'both'
        }}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
