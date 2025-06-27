import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, TrendingUp, Brain, Zap, Target, ChevronRight, Settings, User, Bell, Menu, Library, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useNavigate } from "react-router-dom";
import { useModules } from "@/contexts/ModulesContext";
import { useAuth } from "@/contexts/AuthContext";
import AIModuleCard from "./dashboard/AIModuleCard";
import UpgradeSection from "./dashboard/UpgradeSection";
import DashboardSkeleton from "./dashboard/DashboardSkeleton";
import FooterLinks from "./dashboard/FooterLinks";
import YouButton from "./dashboard/YouButton";
import { AnimatedCard } from "@/components/ui/animated-card";
import { SmoothButton } from "@/components/ui/smooth-button";
import { PageTransition } from "@/components/ui/page-transition";
import { playSuccessSound } from "@/utils/soundEffects";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star } from "lucide-react";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [showModule, setShowModule] = useState(false);
  const [isFullyInitialized, setIsFullyInitialized] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [favoriteModules, setFavoriteModules] = useState<string[]>([]);
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const { currentUsage, loading: usageLoading } = useUsageTracking();
  const { modules, isInitialized: modulesInitialized } = useModules();

  useEffect(() => {
    const allSystemsReady = modulesInitialized && !subscriptionLoading && !usageLoading;
    
    if (allSystemsReady && !isFullyInitialized) {
      const timer = setTimeout(() => {
        setIsFullyInitialized(true);
        playSuccessSound();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modulesInitialized, subscriptionLoading, usageLoading, isFullyInitialized]);

  useEffect(() => {
    if (user) {
      loadFavoriteModules();
    }
  }, [user]);

  const loadFavoriteModules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('favorite_modules')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading favorites:', error);
        return;
      }

      if (data?.favorite_modules) {
        setFavoriteModules(data.favorite_modules);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (moduleId: string) => {
    if (!user) return;

    const isFavorited = favoriteModules.includes(moduleId);
    const newFavorites = isFavorited
      ? favoriteModules.filter(id => id !== moduleId)
      : [...favoriteModules, moduleId];

    setFavoriteModules(newFavorites);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating favorites:', error);
      setFavoriteModules(favoriteModules);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(moduleId);
      setShowModule(true);
    }
  };

  const handleBackToDashboard = () => {
    setShowModule(false);
    setSelectedModule("");
  };

  if (!isFullyInitialized) {
    return <DashboardSkeleton />;
  }

  if (showModule && selectedModule) {
    const module = modules.find(m => m.id === selectedModule);
    if (module) {
      const ModuleComponent = module.component;
      return (
        <PageTransition>
          <ModuleComponent onBack={handleBackToDashboard} />
        </PageTransition>
      );
    }
  }

  const totalUsage = Object.values(currentUsage).reduce((sum, val) => sum + val, 0);
  const displayedModules = favoriteModules.length > 0 
    ? modules.filter(m => favoriteModules.includes(m.id))
    : [];

  const displayTier = currentTier === 'free' ? 'Free' : 
                     currentTier === 'basic' ? 'Basic' : 
                     currentTier === 'premium' ? 'Premium' : 'Free';

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-2 sm:p-4 md:p-6 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Enhanced Header Section with Navigation */}
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 sm:mb-6">
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent px-2 sm:px-0">
                  Welcome back, <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{user?.email?.split('@')[0] || 'User'}</span>!
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg px-2 sm:px-0">
                  Science-backed fitness guidance powered by AI
                </p>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/account')}
                  className="text-white hover:bg-gray-800 hover:text-orange-400"
                >
                  <User className="w-5 h-5 mr-2" />
                  Account
                </SmoothButton>
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/settings')}
                  className="text-white hover:bg-gray-800 hover:text-orange-400"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </SmoothButton>
                {!isSubscribed && (
                  <SmoothButton
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
                  </SmoothButton>
                )}
              </div>

              {/* Mobile Menu Button and Notifications */}
              <div className="flex items-center space-x-2 md:hidden justify-end px-2">
                {/* Mobile Notifications Button */}
                <SmoothButton
                  variant="ghost"
                  className="text-white hover:bg-gray-800 hover:text-orange-400 p-2"
                >
                  <Bell className="w-5 h-5" />
                </SmoothButton>
                
                <SmoothButton
                  variant="ghost"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-white hover:bg-gray-800 p-2"
                >
                  <Menu className="w-5 h-5" />
                </SmoothButton>
              </div>
            </div>

            {/* Desktop Notifications Button */}
            <div className="hidden md:block fixed top-4 right-4 z-40">
              <SmoothButton
                variant="ghost"
                className="text-white hover:bg-gray-800 hover:text-orange-400 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50"
              >
                <Bell className="w-5 h-5" />
              </SmoothButton>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="md:hidden mb-4 sm:mb-6 p-4 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-gray-800 animate-fade-in mx-2 sm:mx-0">
                <div className="flex flex-col space-y-2">
                  <SmoothButton
                    variant="ghost"
                    onClick={() => {
                      navigate('/account');
                      setShowMobileMenu(false);
                    }}
                    className="text-white hover:bg-gray-800 justify-start"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Account
                  </SmoothButton>
                  <SmoothButton
                    variant="ghost"
                    onClick={() => {
                      navigate('/settings');
                      setShowMobileMenu(false);
                    }}
                    className="text-white hover:bg-gray-800 justify-start"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </SmoothButton>
                  {!isSubscribed && (
                    <SmoothButton
                      onClick={() => {
                        navigate('/pricing');
                        setShowMobileMenu(false);
                      }}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 justify-start"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </SmoothButton>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Updated Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-0">
            {[
              { value: totalUsage, label: "Total Interactions", color: "text-orange-500", delay: 0 },
              { value: displayTier, label: "Current Plan", color: "text-blue-500", delay: 100 },
              { value: "24/7", label: "AI Support", color: "text-purple-500", delay: 200 }
            ].map((stat, index) => (
              <AnimatedCard key={index} className="bg-gray-900/40 backdrop-blur-sm border-gray-800 hover:bg-gray-800/50 transition-all duration-300" delay={stat.delay}>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className={`text-lg sm:text-2xl font-bold ${stat.color} mb-1 transition-all duration-300 hover:scale-110`}>
                    {stat.value}
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>

          {/* Favorites Section */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold">Your Favorites</h2>
              <Dialog open={showFavoritesDialog} onOpenChange={setShowFavoritesDialog}>
                <DialogTrigger asChild>
                  <SmoothButton
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-sm sm:text-base"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    Add Favorites
                  </SmoothButton>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md sm:max-w-2xl max-h-[80vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">Choose Your Favorite Modules</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto max-h-[60vh] pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {modules.map((module) => (
                        <div 
                          key={module.id}
                          className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                          onClick={() => toggleFavorite(module.id)}
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${module.gradient}`}>
                            <module.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium text-white truncate">{module.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">{module.description}</p>
                          </div>
                          <button
                            className={`p-1 rounded-full transition-all duration-200 ${
                              favoriteModules.includes(module.id)
                                ? 'text-yellow-400' 
                                : 'text-gray-500 hover:text-yellow-400'
                            }`}
                          >
                            <Star 
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                favoriteModules.includes(module.id) ? 'fill-current' : ''
                              }`} 
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Favorite Modules Display */}
            {displayedModules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {displayedModules.map((module, index) => (
                  <AnimatedCard
                    key={module.id}
                    delay={600 + index * 100}
                    hoverEffect={false}
                    className="p-0 border-0 bg-transparent"
                  >
                    <AIModuleCard
                      id={module.id}
                      title={module.title}
                      description={module.description}
                      icon={module.icon}
                      gradient={module.gradient}
                      isPremium={module.isPremium}
                      onClick={() => handleModuleSelect(module.id)}
                    />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2">No favorites yet</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">Add your favorite modules to access them quickly from here</p>
              </div>
            )}
          </div>

          {/* Module Library Section */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold">AI Modules</h2>
              {!isSubscribed && (
                <SmoothButton
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </SmoothButton>
              )}
            </div>

            {/* Module Library Card */}
            <AnimatedCard className="bg-gradient-to-br from-orange-500/20 to-orange-600/30 backdrop-blur-sm border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300" delay={500}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Library className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl text-white mb-2">Module Library</CardTitle>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Explore all AI-powered fitness modules. Browse, discover, and favorite the tools that work best for you.
                      </p>
                    </div>
                  </div>
                  <SmoothButton
                    onClick={() => navigate('/modules')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto flex-shrink-0"
                  >
                    <span className="mr-2">Browse Modules</span>
                    <ChevronRight className="w-4 h-4" />
                  </SmoothButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-orange-500/20">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-400">{modules.length}</div>
                    <div className="text-xs sm:text-sm text-gray-300">Total Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">{favoriteModules.length}</div>
                    <div className="text-xs sm:text-sm text-gray-300">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">4</div>
                    <div className="text-xs sm:text-sm text-gray-300">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{displayTier}</div>
                    <div className="text-xs sm:text-sm text-gray-300">Access</div>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Upgrade Section - Only show for non-subscribers */}
          {!isSubscribed && (
            <div className="animate-fade-in px-2 sm:px-0" style={{ animationDelay: '600ms' }}>
              <UpgradeSection />
            </div>
          )}

          {/* Enhanced Quick Actions */}
          <AnimatedCard className="bg-gray-900/40 backdrop-blur-sm border-gray-800 hover:bg-gray-800/30 transition-all duration-300 mx-2 sm:mx-0" delay={700}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Zap className="w-5 h-5 mr-2 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { id: 'coach-gpt', icon: Brain, title: 'Ask CoachGPT', subtitle: 'Get instant answers', color: 'text-blue-500' },
                  { id: 'meal-plan-ai', icon: Target, title: 'Create Meal Plan', subtitle: 'Nutrition planning', color: 'text-green-500' },
                  { id: 'physique-ai', icon: TrendingUp, title: 'Track Progress', subtitle: 'Workout analysis', color: 'text-indigo-500' }
                ].map((action, index) => (
                  <SmoothButton
                    key={action.id}
                    variant="ghost"
                    className="h-auto p-3 sm:p-4 justify-start hover:bg-gray-800/50 backdrop-blur-sm transform transition-all duration-200 hover:scale-105 group"
                    onClick={() => handleModuleSelect(action.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <action.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${action.color} group-hover:scale-110 transition-transform flex-shrink-0`} />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{action.title}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">{action.subtitle}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1 flex-shrink-0" />
                    </div>
                  </SmoothButton>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Footer Links */}
          <div className="animate-fade-in px-2 sm:px-0" style={{ animationDelay: '800ms' }}>
            <FooterLinks />
          </div>
        </div>
      </div>
      
      {/* Progress Hub Button */}
      <YouButton />
    </PageTransition>
  );
};

export default Dashboard;
