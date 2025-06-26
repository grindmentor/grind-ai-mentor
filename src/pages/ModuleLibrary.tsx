
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModules } from "@/contexts/ModulesContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SmoothButton } from "@/components/ui/smooth-button";
import { PageTransition } from "@/components/ui/page-transition";
import { playSuccessSound, playClickSound } from "@/utils/soundEffects";
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
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
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
        setFavorites(data.favorite_modules);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (moduleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;

    const isFavorited = favorites.includes(moduleId);
    const newFavorites = isFavorited
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];

    setFavorites(newFavorites);
    playSuccessSound();

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_modules: newFavorites
        });

      if (error) throw error;

      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: `Module ${isFavorited ? 'removed from' : 'added to'} your dashboard`,
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      setFavorites(favorites);
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
      playClickSound();
    }
  };

  const handleBackToDashboard = () => {
    setShowModule(false);
    setSelectedModule("");
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-gray-800 text-white p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <SmoothButton variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isMobile ? "Back" : "Back to Dashboard"}
            </SmoothButton>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500/20 to-pink-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-purple-400/20">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Module Library
                </h1>
                <p className="text-sm md:text-base text-gray-400">Discover all available fitness modules</p>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {modules.map((module) => {
              const isFavorited = favorites.includes(module.id);
              
              return (
                <Card 
                  key={module.id} 
                  className="bg-gray-900/40 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/60 transition-all duration-300 cursor-pointer group hover:border-gray-600/70 hover:shadow-lg hover:shadow-gray-900/20"
                  onClick={() => handleModuleSelect(module.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10`} 
                           style={{background: module.gradient.replace('from-', 'from-').replace('to-', 'to-').replace('/20', '/30').replace('/40', '/50')}}>
                        <module.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => toggleFavorite(module.id, e)}
                          className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                            isFavorited 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gray-500 hover:text-yellow-400'
                          }`}
                        >
                          <Star 
                            className={`w-4 h-4 md:w-5 md:h-5 ${
                              isFavorited ? 'fill-current' : ''
                            }`} 
                          />
                        </button>
                        {module.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-xs px-2 py-1">
                            <Crown className="w-3 h-3 mr-1" />
                            PRO
                          </Badge>
                        )}
                        {module.isNew && (
                          <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg md:text-xl text-white group-hover:text-gray-100 transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {module.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {module.usageKey.replace(/_/g, ' ')}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          <ArrowLeft className="w-3 h-3 rotate-180 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                🔬 Science-Backed Modules
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Each module uses the best available information from scientific research. 
                Our AI provides recommendations based on evidence, though it can make mistakes. 
                Click the star to add modules to your dashboard favorites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;
