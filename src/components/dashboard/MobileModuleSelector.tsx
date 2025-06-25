
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles } from 'lucide-react';
import { ModuleData } from '@/contexts/ModulesContext';
import { SmoothButton } from '@/components/ui/smooth-button';

interface MobileModuleSelectorProps {
  modules: ModuleData[];
  onModuleSelect: (moduleId: string) => void;
}

const MobileModuleSelector: React.FC<MobileModuleSelectorProps> = ({ 
  modules, 
  onModuleSelect 
}) => {
  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <Card 
          key={module.id}
          className={`bg-gradient-to-br ${module.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer relative overflow-hidden group`}
          onClick={() => onModuleSelect(module.id)}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {module.description}
                  </p>
                </div>
              </div>
              
              {module.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Pro</span>
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-xs font-medium">
                  {module.category}
                </span>
              </div>
              
              <SmoothButton
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-medium px-4 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleSelect(module.id);
                }}
              >
                Open
              </SmoothButton>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobileModuleSelector;
