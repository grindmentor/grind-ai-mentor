
interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeMap = {
    sm: { logo: "w-6 h-6", text: "text-sm" },
    md: { logo: "w-8 h-8", text: "text-lg" },
    lg: { logo: "w-12 h-12", text: "text-xl" },
    xl: { logo: "w-16 h-16", text: "text-2xl" }
  };

  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`${sizes.logo} shadow-2xl shadow-orange-500/25 rounded-xl overflow-hidden`}>
        <img 
          src="/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png" 
          alt="Myotopia Logo"
          className="w-full h-full object-cover"
        />
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
