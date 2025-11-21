
import { SmoothButton } from "@/components/ui/smooth-button";
import { TrendingUp, Sparkles } from "lucide-react";

interface YouButtonProps {
  onProgressHubClick: () => void;
}

const YouButton = ({ onProgressHubClick }: YouButtonProps) => {
  const handleClick = () => {
    onProgressHubClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-4 px-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-md mx-auto">
        <SmoothButton
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group min-h-[56px] touch-manipulation"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <TrendingUp className="w-5 h-5 relative z-10" />
          <span className="relative z-10 text-base">Progress Hub</span>
          <Sparkles className="w-4 h-4 relative z-10 opacity-75" />
        </SmoothButton>
      </div>
    </div>
  );
};

export default YouButton;
