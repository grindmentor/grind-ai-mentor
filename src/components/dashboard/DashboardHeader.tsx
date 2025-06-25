
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { currentTier, isSubscribed } = useSubscription();
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Badge className={`w-fit ${isSubscribed ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
              {currentTier === 'free' ? 'Free Plan' : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
            </Badge>
            <p className="text-gray-400 text-sm md:text-base">
              Choose an AI module to get started with your fitness journey.
            </p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/notifications')}
            className="text-white hover:bg-gray-800"
          >
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/account')}
            className="text-white hover:bg-gray-800"
          >
            <User className="w-5 h-5 mr-2" />
            Account
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-white hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/notifications');
                setShowMobileMenu(false);
              }}
              className="text-white hover:bg-gray-800 justify-start"
            >
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/account');
                setShowMobileMenu(false);
              }}
              className="text-white hover:bg-gray-800 justify-start"
            >
              <User className="w-5 h-5 mr-2" />
              Account
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/settings');
                setShowMobileMenu(false);
              }}
              className="text-white hover:bg-gray-800 justify-start"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
