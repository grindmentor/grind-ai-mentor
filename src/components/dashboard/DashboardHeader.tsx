
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Settings, Crown, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/logo';

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Logo size="sm" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={() => navigate('/modules')}
              variant="ghost"
              size="sm"
              className="text-orange-400 hover:bg-orange-500/10 border border-orange-500/30"
            >
              <Library className="w-4 h-4 mr-2" />
              {isMobile ? 'Modules' : 'Module Library'}
            </Button>
            {!isMobile && (
              <>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800/50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800/50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </>
            )}
            <Button
              onClick={() => navigate('/pricing')}
              variant="ghost"
              size="sm"
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30"
            >
              <Crown className="w-4 h-4 mr-2" />
              {isMobile ? 'Pro' : 'Upgrade'}
            </Button>
            {isMobile ? (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-900/20"
              >
                Exit
              </Button>
            ) : (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-900/20"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
