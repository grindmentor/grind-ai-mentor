
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, ArrowLeft, Zap, Brain, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModules } from "@/contexts/ModulesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SmoothButton } from "@/components/ui/smooth-button";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

const ModuleLibrary = () => {
  const navigate = useNavigate();
  const { modules } = useModules();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [showModule, setShowModule] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage (matching Dashboard behavior)
    try {
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const newFavorites = favorites.includes(moduleId)
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];

      setFavorites(newFavorites);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));

      toast({
        title: favorites.includes(moduleId) ? "Removed from favorites" : "Added to favorites",
        description: `Module ${favorites.includes(moduleId) ? 'removed from' : 'added to'} your dashboard`,
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error updating favorites",
        description: "Please try again",
        variant: "destructive"
      });
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

  // Get module-specific background color based on gradient
  const getModuleBackgroundColor = (gradient: string) => {
    const colorMap: { [key: string]: string } = {
      'from-blue-500 to-blue-700': 'bg-blue-500/20 border-blue-500/30',
      'from-purple-500 to-purple-700': 'bg-purple-500/20 border-purple-500/30',
      'from-rose-500 to-rose-700': 'bg-rose-500/20 border-rose-500/30',
      'from-green-500 to-green-700': 'bg-green-500/20 border-green-500/30',
      'from-orange-500 to-orange-700': 'bg-orange-500/20 border-orange-500/30',
      'from-red-500 to-red-700': 'bg-red-500/20 border-red-500/30',
      'from-pink-500 to-pink-700': 'bg-pink-500/20 border-pink-500/30',
      'from-emerald-500 to-emerald-700': 'bg-emerald-500/20 border-emerald-500/30',
      'from-cyan-500 to-cyan-700': 'bg-cyan-500/20 border-cyan-500/30',
      'from-indigo-500 to-indigo-700': 'bg-indigo-500/20 border-indigo-500/30',
      'from-teal-500 to-teal-700': 'bg-teal-500/20 border-teal-500/30',
      'from-violet-500 to-violet-700': 'bg-violet-500/20 border-violet-500/30',
      'from-yellow-500 to-yellow-700': 'bg-yellow-500/20 border-yellow-500/30'
    };
    return colorMap[gradient] || 'bg-gray-500/20 border-gray-500/30';
  };

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

  // Filter out Progress Hub from module library display
  const displayModules = modules.filter(module => module.id !== 'progress-hub');

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white animate-fade-in">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
              <SmoothButton 
                variant="ghost" 
                onClick={() => navigate('/app')} 
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm w-fit text-sm sm:text-base"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </SmoothButton>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500/20 to-orange-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-orange-400/20">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                    AI Module Library
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-400">Discover all available fitness modules</p>
                </div>
              </div>
            </div>

            {/* Recent Scientific Studies */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/20 backdrop-blur-sm border-blue-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Brain className="w-5 h-5 mr-2 text-blue-400" />
                  Latest Scientific Insights
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Evidence-based fitness research powering our AI recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold text-blue-200 mb-1">Progressive Overload Optimization</h4>
                  <p className="text-sm text-blue-300/80">Recent studies show 2.5-5% weekly load increases maximize strength gains while minimizing injury risk.</p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold text-blue-200 mb-1">Recovery Window Analysis</h4>
                  <p className="text-sm text-blue-300/80">New research indicates optimal protein synthesis occurs 24-48h post-workout, informing our training schedules.</p>
                </div>
              </CardContent>
            </Card>

            {/* User Data Insights */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/20 backdrop-blur-sm border-green-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Your Fitness Journey
                </CardTitle>
                <CardDescription className="text-green-200">
                  Personalized insights based on your activity and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-1">0</div>
                  <div className="text-sm text-green-300">Workouts Logged</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-1">{favorites.length}</div>
                  <div className="text-sm text-green-300">Favorite Modules</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-1">0</div>
                  <div className="text-sm text-green-300">Days Active</div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Subscription Ad */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/20 backdrop-blur-sm border-yellow-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                  Unlock Pro Features
                </CardTitle>
                <CardDescription className="text-yellow-200">
                  Get unlimited access to premium AI modules and advanced analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-4 mb-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Smart Training
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Meal Plan Generator
                      </Badge>
                    </div>
                    <p className="text-sm text-yellow-300">Plus unlimited usage on all modules</p>
                  </div>
                  <SmoothButton className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    Upgrade to Pro
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </SmoothButton>
                </div>
              </CardContent>
            </Card>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {displayModules.map((module) => {
                const isFavorited = favorites.includes(module.id);
                const moduleBackgroundColor = getModuleBackgroundColor(module.gradient);
                
                return (
                  <Card 
                    key={module.id} 
                    className={`${moduleBackgroundColor} backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-gray-900/20 hover:scale-[1.02] sm:hover:scale-105 min-h-0`}
                    onClick={() => handleModuleSelect(module.id)}
                  >
                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10 bg-gradient-to-r ${module.gradient}`}>
                          <module.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <button
                            onClick={(e) => toggleFavorite(module.id, e)}
                            className={`p-1 sm:p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                              isFavorited 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-gray-500 hover:text-yellow-400'
                            }`}
                          >
                            <Star 
                              className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                                isFavorited ? 'fill-current' : ''
                              }`} 
                            />
                          </button>
                          {module.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                              <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                              {isMobile ? "PRO" : "PRO"}
                            </Badge>
                          )}
                          {module.isNew && (
                            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <CardTitle className="text-sm sm:text-lg md:text-xl text-white group-hover:text-gray-100 transition-colors leading-tight">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors leading-relaxed">
                          {module.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-3 sm:p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                          {module.usageKey.replace(/_/g, ' ')}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                            <ArrowLeft className="w-2 h-2 sm:w-3 sm:h-3 rotate-180 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="mt-8 sm:mt-12 text-center">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
                  🔬 Science-Backed Training
                </h2>
                <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  Each module uses evidence-based methodologies from exercise science research. 
                  Our AI provides recommendations backed by peer-reviewed studies and proven training principles. 
                  Click the star to add modules to your dashboard favorites.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;
