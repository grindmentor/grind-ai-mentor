
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

  const toggleFavorite = async (moduleId: string) => {
    if (!user) return;

    const newFavorites = favorites.includes(moduleId)
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
        title: favorites.includes(moduleId) ? "Removed from favorites" : "Added to favorites",
        description: `Module ${favorites.includes(moduleId) ? 'removed from' : 'added to'} your dashboard`,
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      setFavorites(favorites); // Revert on error
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
      <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <SmoothButton variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isMobile ? "Back" : "Back to Dashboard"}
            </SmoothButton>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Module Library</h1>
                <p className="text-gray-400 text-sm md:text-base">Discover AI modules</p>
              </div>
            </div>
          </div>

          {/* Modules Grid - Improved mobile layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {modules.map((module) => {
              const IconComponent = module.icon;
              const isFavorited = favorites.includes(module.id);

              return (
                <Card 
                  key={module.id}
                  className={`bg-gradient-to-br ${module.gradient} border-0 text-white cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20 group relative min-h-[140px] md:min-h-[160px]`}
                >
                  {/* Star Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(module.id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-all duration-200"
                  >
                    <Star
                      className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-200 ${
                        isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-white/60 hover:text-yellow-400'
                      }`}
                    />
                  </button>

                  <div onClick={() => handleModuleSelect(module.id)} className="h-full">
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-start justify-between pr-8">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {module.isNew && (
                            <Badge className="bg-white/20 text-white text-xs animate-pulse">New</Badge>
                          )}
                          {module.isPremium && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 text-xs border-yellow-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-white text-base md:text-lg leading-tight transition-all duration-300 group-hover:text-orange-100">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-white/80 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                        {module.description}
                      </CardDescription>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;
