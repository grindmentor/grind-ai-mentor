
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';

const ModuleLibrary = () => {
  const { user } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState(null);

  // Filter out Progress Hub from module library
  const availableModules = modules.filter(m => m.id !== 'progress-hub');

  // Load favorites from localStorage
  React.useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('module-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const toggleFavorite = (moduleId: string) => {
    try {
      const newFavorites = favorites.includes(moduleId) 
        ? favorites.filter(id => id !== moduleId)
        : [...favorites, moduleId];
      
      setFavorites(newFavorites);
      localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-white hover:text-orange-400 transition-colors font-medium"
              >
                ← Back to Library
              </button>
              <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
                {selectedModule.title}
              </h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <ModuleComponent onBack={() => setSelectedModule(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/app')}
              className="text-white hover:text-orange-400 transition-colors font-medium flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-lg font-semibold">AI Module Library</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Latest Scientific Insights */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
                Latest Scientific Insights
              </CardTitle>
              <CardDescription className="text-blue-200">
                Stay updated with the latest fitness research and evidence-based training methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-800/20 rounded-lg">
                  <h4 className="text-white font-medium">High-Intensity Interval Training Benefits</h4>
                  <p className="text-blue-200 text-sm">Recent studies show HIIT improves cardiovascular health 40% more effectively than steady-state cardio</p>
                </div>
                <div className="p-3 bg-blue-800/20 rounded-lg">
                  <h4 className="text-white font-medium">Protein Timing for Muscle Growth</h4>
                  <p className="text-blue-200 text-sm">New research indicates protein distribution throughout the day is more important than post-workout timing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Fitness Journey */}
          <Card className="bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                Your Fitness Journey
              </CardTitle>
              <CardDescription className="text-green-200">
                Track your progress and see how far you've come
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-green-200 text-sm">Workouts</div>
                </div>
                <div className="text-center p-3 bg-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-green-200 text-sm">Days Active</div>
                </div>
                <div className="text-center p-3 bg-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-green-200 text-sm">Goals Achieved</div>
                </div>
                <div className="text-center p-3 bg-green-800/20 rounded-lg">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-green-200 text-sm">Modules Used</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Subscription Ad */}
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-800/20 border-purple-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Crown className="w-6 h-6 mr-3 text-yellow-400" />
                Upgrade to Premium
              </CardTitle>
              <CardDescription className="text-purple-200">
                Unlock advanced AI features and personalized coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">Advanced AI Personal Trainer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">Unlimited Module Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">Personalized Meal Plans</span>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Modules */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Available Modules
            </h2>
            <ModuleGrid
              modules={availableModules}
              favorites={favorites}
              onModuleClick={handleModuleClick}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleLibrary;
