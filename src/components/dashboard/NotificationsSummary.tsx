
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsSummary = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/notifications');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/30 backdrop-blur-sm border-blue-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-indigo-500/40 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Bell className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Notifications</h3>
              <p className="text-blue-200/80 text-xs">Configure your preferences</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
            onClick={handleViewAll}
          >
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSummary;
