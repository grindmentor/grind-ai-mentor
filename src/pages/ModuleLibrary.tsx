import React, { useState, useMemo, useCallback } from 'react';
import { useModules } from '@/contexts/ModulesContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const ModuleLibrary = () => {
  const { modules } = useModules();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleModuleClick = useCallback((module: any) => {
    setSelectedModuleId(module.id);
  }, []);

  const selectedModule = useMemo(() => {
    return modules.find(m => m.id === selectedModuleId) || null;
  }, [modules, selectedModuleId]);

  if (selectedModule) {
    const ModuleComponent = selectedModule.component;
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-4 sm:p-6 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedModuleId(null)}
            className="mb-4"
          >
            &larr; Back to Module Library
          </Button>
          <ErrorBoundary>
            <ModuleComponent onBack={() => setSelectedModuleId(null)} />
          </ErrorBoundary>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Module Library</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.id}
              className={`bg-gradient-to-br ${module.gradient} backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden border-opacity-30`}
              onClick={() => handleModuleClick(module)}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
              </div>
              
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  {/* Icon and favorite */}
                  <div className="flex items-center justify-between w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <module.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/10 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(module.id);
                      }}
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          favorites.includes(module.id) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-white/60'
                        }`} 
                      />
                    </Button>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-white font-bold text-sm sm:text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {module.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
                    {module.description}
                  </p>
                  
                  {/* Premium Badge */}
                  {module.isPremium && (
                    <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/50 backdrop-blur-sm drop-shadow-lg text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default ModuleLibrary;
