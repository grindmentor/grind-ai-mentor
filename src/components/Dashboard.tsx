import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap,
  BarChart3,
  Clock,
  Award,
  Settings,
  Library,
  User,
  Bell,
  ChevronRight,
  Flame,
  Droplets,
  Moon,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SmoothButton } from "@/components/ui/smooth-button";
import { MobileOptimized } from "@/components/ui/mobile-optimized";
import { useMobileEnhancements } from "@/hooks/useMobileEnhancements";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import GoalsAchievementsHubOptimized from './GoalsAchievementsHubOptimized';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { hapticFeedback, safeArea } = useMobileEnhancements();
  const performanceMetrics = usePerformanceMonitor();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [quickStats, setQuickStats] = useState({
    workoutsThisWeek: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    streak: 0
  });

  useEffect(() => {
    // Simulate loading user stats
    const loadStats = async () => {
      // In a real app, this would fetch from your backend
      setQuickStats({
        workoutsThisWeek: 4,
        caloriesBurned: 1250,
        activeMinutes: 180,
        streak: 7
      });
    };
    
    if (user) {
      loadStats();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const quickActions = [
    {
      title: "Start Workout",
      description: "Begin your training session",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      action: () => {
        hapticFeedback('medium');
        navigate('/workout');
      }
    },
    {
      title: "Log Nutrition",
      description: "Track your meals",
      icon: Droplets,
      color: "from-green-500 to-emerald-500",
      action: () => {
        hapticFeedback('light');
        navigate('/nutrition');
      }
    },
    {
      title: "View Progress",
      description: "Check your stats",
      icon: TrendingUp,
      color: "from-blue-500 to-purple-500",
      action: () => {
        hapticFeedback('light');
        navigate('/progress');
      }
    },
    {
      title: "Recovery",
      description: "Rest and recover",
      icon: Moon,
      color: "from-indigo-500 to-blue-500",
      action: () => {
        hapticFeedback('light');
        navigate('/recovery');
      }
    }
  ];

  const todaySchedule = [
    {
      time: "9:00 AM",
      title: "Morning Cardio",
      type: "Workout",
      duration: "30 min",
      completed: true
    },
    {
      time: "1:00 PM",
      title: "Protein Shake",
      type: "Nutrition",
      duration: "5 min",
      completed: true
    },
    {
      time: "6:00 PM",
      title: "Strength Training",
      type: "Workout",
      duration: "45 min",
      completed: false
    },
    {
      time: "9:00 PM",
      title: "Evening Stretch",
      type: "Recovery",
      duration: "15 min",
      completed: false
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-orange-500/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Myotopia</h2>
            <p className="text-gray-400 mb-6">Sign in to access your personalized fitness dashboard</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MobileOptimized className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
      <div 
        className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6"
        style={{ 
          paddingTop: `max(${safeArea.top}px, 1rem)`,
          paddingBottom: `max(${safeArea.bottom}px, 1rem)`
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete'}!
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SmoothButton
              onClick={() => navigate('/module-library')}
              variant="outline"
              className="text-orange-400 border-orange-500/40 hover:bg-orange-500/20 backdrop-blur-sm"
              size={isMobile ? "sm" : "default"}
            >
              <Library className="w-4 h-4 mr-2" />
              Modules
            </SmoothButton>
            
            <SmoothButton
              onClick={() => navigate('/profile')}
              variant="outline"
              className="text-orange-400 border-orange-500/40 hover:bg-orange-500/20 backdrop-blur-sm"
              size={isMobile ? "sm" : "default"}
            >
              <Settings className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Settings</span>}
            </SmoothButton>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/30 backdrop-blur-sm border-orange-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/30 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-orange-200/80">Workouts</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{quickStats.workoutsThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/30 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-green-200/80">Calories</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{quickStats.caloriesBurned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/30 backdrop-blur-sm border-blue-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-blue-200/80">Active Min</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{quickStats.activeMinutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/30 backdrop-blur-sm border-yellow-500/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-yellow-200/80">Streak</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{quickStats.streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-gray-900/40 to-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg sm:text-xl flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <SmoothButton
                    key={index}
                    onClick={action.action}
                    className={`p-3 sm:p-4 h-auto bg-gradient-to-r ${action.color} bg-opacity-20 hover:bg-opacity-30 border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200`}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs sm:text-sm">{action.title}</p>
                        <p className="text-white/70 text-xs">{action.description}</p>
                      </div>
                    </div>
                  </SmoothButton>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-200 text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-200 text-xs sm:text-sm"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-orange-500/30 data-[state=active]:text-orange-200 text-xs sm:text-sm"
            >
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Goals & Achievements */}
            <GoalsAchievementsHubOptimized />

            {/* Recent Activity */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/30 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Completed Upper Body Workout</p>
                      <p className="text-purple-300/70 text-xs">2 hours ago • 45 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                    <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Logged Protein Shake</p>
                      <p className="text-green-300/70 text-xs">4 hours ago • 25g protein</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Morning Cardio Session</p>
                      <p className="text-blue-300/70 text-xs">Yesterday • 30 minutes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card className="bg-gradient-to-r from-indigo-900/20 to-blue-900/30 backdrop-blur-sm border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        item.completed 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500/30' : 'bg-gray-500/30'
                      }`}>
                        {item.completed ? (
                          <Award className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${
                            item.completed ? 'text-green-200 line-through' : 'text-white'
                          }`}>
                            {item.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {item.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{item.time} • {item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card className="bg-gradient-to-r from-teal-900/20 to-cyan-900/30 backdrop-blur-sm border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-teal-400" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-teal-200">Workout Goal</span>
                      <span className="text-teal-400">4/5 sessions</span>
                    </div>
                    <div className="w-full bg-teal-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-teal-200">Nutrition Tracking</span>
                      <span className="text-teal-400">6/7 days</span>
                    </div>
                    <div className="w-full bg-teal-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-teal-200">Sleep Quality</span>
                      <span className="text-teal-400">7.2/10 avg</span>
                    </div>
                    <div className="w-full bg-teal-900/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Debug (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-900/20 backdrop-blur-sm border-gray-700/30">
            <CardHeader>
              <CardTitle className="text-gray-400 text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>Load Time: {performanceMetrics.loadTime.toFixed(2)}ms</div>
                <div>Render Time: {performanceMetrics.renderTime.toFixed(2)}ms</div>
                <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
                <div>Frame Drops: {performanceMetrics.frameDrops.toFixed(0)}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileOptimized>
  );
};

export default Dashboard;
