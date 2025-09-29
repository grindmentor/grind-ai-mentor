
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileModuleWrapperProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileModuleWrapper: React.FC<MobileModuleWrapperProps> = ({
  title,
  onBack,
  children,
  className = ""
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white ${className}`}>
      {/* Mobile-optimized header with back button above title */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          {/* Back button positioned above title on mobile */}
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center space-x-4'}`}>
            <Button
              onClick={onBack}
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {/* Title spans full width and stays on single line */}
            <h1 className={`font-bold text-white truncate ${
              isMobile 
                ? 'text-xl w-full' 
                : 'text-2xl flex-1'
            }`}>
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Module content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
