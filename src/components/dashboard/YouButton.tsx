
import { useNavigate } from "react-router-dom";
import { SmoothButton } from "@/components/ui/smooth-button";
import { User } from "lucide-react";

const YouButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent p-4 pt-8">
      <div className="max-w-md mx-auto">
        <SmoothButton
          onClick={() => navigate('/profile')}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
        >
          <User className="w-5 h-5" />
          <span>You</span>
        </SmoothButton>
      </div>
    </div>
  );
};

export default YouButton;
