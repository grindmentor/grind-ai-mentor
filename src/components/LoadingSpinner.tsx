
import { Dumbbell } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-sm" },
    md: { container: "w-12 h-12", icon: "w-7 h-7", text: "text-xl" },
    lg: { container: "w-16 h-16", icon: "w-9 h-9", text: "text-2xl" }
  };

  const sizes = sizeMap[size];

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className={`${sizes.container} bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse`}>
        <Dumbbell className={`${sizes.icon} text-white`} />
      </div>
      <div className={`${sizes.text} text-white font-medium`}>{text}</div>
    </div>
  );
};

export default LoadingSpinner;
