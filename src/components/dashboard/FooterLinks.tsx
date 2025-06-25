
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SmoothButton } from "@/components/ui/smooth-button";

export const FooterLinks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/about')}
          className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
        >
          About
        </SmoothButton>
        <SmoothButton
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/privacy')}
          className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
        >
          Privacy Policy
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm" 
          onClick={() => navigate('/terms')}
          className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
        >
          Terms of Service
        </SmoothButton>
        <SmoothButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/support')}
          className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
        >
          Support
        </SmoothButton>
      </div>
      <div className="text-center mt-4 text-xs text-gray-500">
        © 2025 GrindMentor. All rights reserved.
      </div>
    </div>
  );
};

export default FooterLinks;
