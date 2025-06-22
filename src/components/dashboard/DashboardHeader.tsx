
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { currentTier, isSubscribed } = useSubscription();
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between mb-12">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <div className="flex items-center space-x-3">
          <Badge className={`${isSubscribed ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
            {currentTier === 'free' ? 'Free Plan' : `${currentTier} Plan`}
          </Badge>
          <p className="text-gray-400">
            Choose an AI module to get started with your fitness journey.
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="text-white hover:bg-gray-800"
        >
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="text-white hover:bg-gray-800"
        >
          <User className="w-5 h-5 mr-2" />
          Profile
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="text-white hover:bg-gray-800"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
