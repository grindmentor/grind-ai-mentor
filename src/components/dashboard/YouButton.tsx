
import { useNavigate } from "react-router-dom";
import { SmoothButton } from "@/components/ui/smooth-button";
import { User, Sparkles } from "lucide-react";

const YouButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/98 to-transparent p-4 pt-12">
      <div className="max-w-md mx-auto">
        <SmoothButton
          onClick={() => navigate('/profile')}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl border-0 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center space-x-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <User className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Your Profile</span>
          <Sparkles className="w-4 h-4 relative z-10 opacity-75" />
        </SmoothButton>
      </div>
    </div>
  );
};

export default YouButton;
