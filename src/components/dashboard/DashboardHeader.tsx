import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Bell, Grid3X3 } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface DashboardHeaderProps {
  user: any;
  onSignOut: () => void;
  isMobile: boolean;
  onNotificationsClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  onSignOut, 
  isMobile,
  onNotificationsClick 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Logo size={isMobile ? "sm" : "md"} />
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/modules')}
                  className="text-white hover:text-orange-400 hover:bg-gray-800/50"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Module Library
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  className="text-white hover:text-orange-400 hover:bg-gray-800/50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationsClick}
              className="relative text-white hover:text-orange-400 hover:bg-gray-800/50"
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-gray-400 text-xs">Free Plan</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {(user?.user_metadata?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end">
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/modules')}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700 md:hidden"
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Module Library
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={onSignOut}
                    className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
