
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Settings, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Myotopia
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              onClick={() => navigate('/settings')}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
