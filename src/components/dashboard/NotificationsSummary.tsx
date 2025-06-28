
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, Trophy, Target, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsSummary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Sample quick stats for the compact view
  const quickStats = {
    activeGoals: 3,
    recentAchievements: 2,
    pendingReminders: 1
  };

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
              <p className="text-blue-200/80 text-xs">
                {quickStats.activeGoals} goals, {quickStats.recentAchievements} achievements
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs">
              <Target className="w-3 h-3 text-orange-400" />
              <span className="text-gray-300">{quickStats.activeGoals}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-300">{quickStats.recentAchievements}</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
              onClick={handleViewAll}
            >
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSummary;
