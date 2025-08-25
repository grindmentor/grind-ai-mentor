
import { OptimizedImage } from './optimized-image';

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeMap = {
    sm: { logo: "w-6 h-6", text: "text-sm", pixels: 24 },
    md: { logo: "w-8 h-8", text: "text-lg", pixels: 32 },
    lg: { logo: "w-12 h-12", text: "text-xl", pixels: 48 },
    xl: { logo: "w-16 h-16", text: "text-2xl", pixels: 64 }
  };

  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`${sizes.logo} shadow-2xl shadow-orange-500/25 rounded-xl overflow-hidden`}>
        <picture>
          <source 
            srcSet="/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.webp" 
            type="image/webp" 
          />
          <OptimizedImage
            src="/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png" 
            alt="Myotopia Logo"
            width={sizes.pixels}
            height={sizes.pixels}
            className="w-full h-full object-cover"
            priority={size === "lg" || size === "xl"}
          />
        </picture>
      </div>
      {showText && (
        <span className={`${sizes.text} font-bold text-transparent bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text font-orbitron tracking-wide`}>
          Myotopia
        </span>
      )}
    </div>
  );
};

export default Logo;
