interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeMap = {
    sm: { logo: "w-10 h-10", text: "text-sm" },
    md: { logo: "w-12 h-12", text: "text-lg" },
    lg: { logo: "w-16 h-16", text: "text-xl" },
    xl: { logo: "w-24 h-24", text: "text-2xl" }
  };

  const sizes = sizeMap[size];

  // Use the clean bicep + brain logo
  const logoSrc = "/lovable-uploads/myotopia-logo-clean.png";

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`${sizes.logo} shadow-2xl shadow-orange-500/25 rounded-xl overflow-hidden`}>
        <img 
          src={logoSrc}
          alt="Myotopia Logo"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 32 : 24}
          height={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 32 : 24}
        />
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
