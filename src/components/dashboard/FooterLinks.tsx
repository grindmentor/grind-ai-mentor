
import React from "react";
import { useNavigate } from "react-router-dom";
import { SmoothButton } from "@/components/ui/smooth-button";

export const FooterLinks: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/about')}
          className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer"
        >
          About
        </SmoothButton>
        <SmoothButton
          variant="ghost" 
          size="sm"
          onClick={() => handleNavigation('/privacy')}
          className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer"
        >
          Privacy Policy
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm" 
          onClick={() => handleNavigation('/terms')}
          className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer"
        >
          Terms of Service
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => handleNavigation('/support')}
          className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/50 transition-colors p-2 h-auto font-normal cursor-pointer"
        >
          Support
        </SmoothButton>
      </div>
      <div className="text-center mt-4 text-xs text-gray-500">
        © 2025 Myotopia. All rights reserved.
      </div>
    </div>
  );
};

export default FooterLinks;
