
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/contexts/ModulesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Settings, User, Crown, Zap, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-card';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  gradient: string;
  usageKey: string;
  isPremium: boolean;
  isNew: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { modules } = useModules();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('module-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (moduleId: string) => {
    const newFavorites = favorites.includes(moduleId) 
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    
    setFavorites(newFavorites);
    localStorage.setItem('module-favorites', JSON.stringify(newFavorites));
  };

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
          {/* Header with back button */}
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
          
          {/* Module Content */}
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
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              onClick={toggleMenu}
              variant="outline"
              size="icon"
              className="bg-black/80 backdrop-blur-md border-gray-700 text-white hover:bg-gray-800/80"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        )}

        {/* Mobile Slide-out Menu */}
        {isMobile && (
          <div className={`fixed inset-y-0 right-0 z-40 w-80 bg-black/95 backdrop-blur-md transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } border-l border-gray-800/50`}>
            <div className="p-6 pt-20">
              <div className="flex flex-col space-y-4">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="justify-start text-white hover:bg-gray-800/50"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Button>
                <Button
                  onClick={() => navigate('/settings')}
                  variant="ghost"
                  className="justify-start text-white hover:bg-gray-800/50"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                <Button
                  onClick={() => navigate('/pricing')}
                  variant="ghost"
                  className="justify-start text-white hover:bg-gray-800/50"
                >
                  <Crown className="w-5 h-5 mr-3" />
                  Upgrade
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="justify-start text-red-400 hover:bg-red-900/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <div className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    GrindMentor
                  </div>
                </div>
                <div className="flex items-center space-x-4">
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
                  <Button
                    onClick={() => navigate('/pricing')}
                    variant="ghost"
                    size="sm"
                    className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade
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
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome back, {user?.user_metadata?.name || 'Champion'}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Your Favorites
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules
                  .filter(module => favorites.includes(module.id))
                  .map((module, index) => {
                    const IconComponent = module.icon;
                    return (
                      <AnimatedCard
                        key={module.id}
                        className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                        delay={index * 100}
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
                          <CardTitle className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
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
                              className="text-yellow-500 hover:bg-yellow-500/10"
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    );
                  })}
              </div>
            </div>
          )}

          {/* All Modules Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              All Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((module, index) => {
                const IconComponent = module.icon;
                const isFavorited = favorites.includes(module.id);
                
                return (
                  <AnimatedCard
                    key={module.id}
                    className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                    delay={index * 50}
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
                  </AnimatedCard>
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
