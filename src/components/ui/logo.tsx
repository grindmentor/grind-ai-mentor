
import { Dumbbell } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeMap = {
    sm: { icon: "w-6 h-6", container: "w-8 h-8", text: "text-sm" },
    md: { icon: "w-6 h-6", container: "w-10 h-10", text: "text-lg" },
    lg: { icon: "w-7 h-7", container: "w-12 h-12", text: "text-xl" },
    xl: { icon: "w-8 h-8", container: "w-16 h-16", text: "text-2xl" }
  };

  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizes.container} bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center`}>
        <Dumbbell className={`${sizes.icon} text-white`} />
      </div>
      {showText && (
        <span className={`${sizes.text} font-bold text-white logo-text`}>
          Myotopia
        </span>
      )}
    </div>
  );
};

export default Logo;
