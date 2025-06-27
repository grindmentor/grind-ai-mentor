
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Settings, User, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage safely
  useEffect(() => {
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

  // Save favorites to localStorage
  const toggleFavorite = (moduleId) => {
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

  const handleModuleClick = (module) => {
    console.log('Module clicked:', module.id);
    setSelectedModule(module);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle case where modules might not be loaded yet
  if (!modules || modules.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading modules...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Button
                  onClick={handleBackToDashboard}
                  variant="ghost"
                  className="text-white hover:bg-gray-800/50"
                >
                  ← Back to Dashboard
                </Button>
                <h1 className="text-lg font-semibold text-center flex-1">
                  {selectedModule.title}
                </h1>
                <div className="w-32"></div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ModuleComponent />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Myotopia
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800/50 hidden sm:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800/50 hidden sm:flex"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="ghost"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {isMobile ? 'Pro' : 'Upgrade'}
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-900/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Champion'}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Modules Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              All Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((module) => {
                const IconComponent = module.icon;
                const isFavorited = favorites.includes(module.id);
                
                return (
                  <Card
                    key={module.id}
                    className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleModuleClick(module)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${module.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          {module.isPremium && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                          {module.isNew && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                              <Zap className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {module.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(module.id);
                          }}
                          className={`${isFavorited ? 'text-yellow-500' : 'text-gray-500'} hover:bg-yellow-500/10`}
                        >
                          <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
