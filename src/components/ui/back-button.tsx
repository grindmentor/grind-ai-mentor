import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onBack: () => void;
  text?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
}

export const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  text = "Back",
  className,
  variant = "ghost",
  size = "sm"
}) => {
  return (
    <Button
      onClick={onBack}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors",
        "mobile-nav-button", // From mobile optimizations
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{text}</span>
    </Button>
  );
};