
import React from "react";
import { useNavigate } from "react-router-dom";
import { SmoothButton } from "@/components/ui/smooth-button";
import { useIsMobile } from "@/hooks/use-mobile";

export const FooterLinks: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 ${isMobile ? 'pb-safe-bottom' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-wrap justify-center gap-6'} text-sm`}>
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/about')}
          className={`${isMobile ? 'w-full justify-start' : ''} text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer`}
        >
          About Myotopia
        </SmoothButton>
        <SmoothButton
          variant="ghost" 
          size="sm"
          onClick={() => handleNavigation('/privacy')}
          className={`${isMobile ? 'w-full justify-start' : ''} text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer`}
        >
          Privacy Policy
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm" 
          onClick={() => handleNavigation('/terms')}
          className={`${isMobile ? 'w-full justify-start' : ''} text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer`}
        >
          Terms of Service
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/support')}
          className={`${isMobile ? 'w-full justify-start' : ''} text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer`}
        >
          Support & Help
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/faq')}
          className={`${isMobile ? 'w-full justify-start' : ''} text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer`}
        >
          FAQ
        </SmoothButton>
      </div>
      <div className={`text-center mt-4 text-xs text-gray-500 ${isMobile ? 'pb-4' : ''}`}>
        © 2025 Myotopia. All rights reserved. • <button onClick={() => handleNavigation('/privacy')} className="hover:text-orange-400 underline underline-offset-2">Privacy Policy</button> • <button onClick={() => handleNavigation('/terms')} className="hover:text-orange-400 underline underline-offset-2">Terms</button>
      </div>
    </div>
  );
};

export default FooterLinks;
