import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  enableSafeArea?: boolean;
}

export const MobileResponsiveLayout: React.FC<MobileResponsiveLayoutProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName,
  enableSafeArea = true,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "w-full min-h-screen",
        enableSafeArea && "pb-safe-bottom",
        isMobile ? mobileClassName : desktopClassName,
        className
      )}
      style={{
        paddingTop: enableSafeArea ? 'max(env(safe-area-inset-top), 0px)' : undefined,
        paddingBottom: enableSafeArea ? 'max(env(safe-area-inset-bottom), 16px)' : undefined,
        paddingLeft: enableSafeArea ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: enableSafeArea ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {children}
    </div>
  );
};