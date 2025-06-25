
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { SmoothButton } from '@/components/ui/smooth-button';
import { AIModule } from './AIModuleData';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface MobileModuleSelectorProps {
  modules: AIModule[];
  onModuleSelect: (moduleId: string) => void;
}

const MobileModuleSelector: React.FC<MobileModuleSelectorProps> = ({ 
  modules, 
  onModuleSelect 
}) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Group modules by category with new organization
  const groupedModules = {
    'Workouts': modules.filter(m => 
      ['smart-training', 'workout-timer', 'workout-library', 'workout-logger-ai'].includes(m.id)
    ),
    'Nutrition and Food': modules.filter(m => 
      ['meal-plan-ai', 'food-photo-logger', 'smart-food-log'].includes(m.id)
    ),
    'Calculators and Tools': modules.filter(m => 
      ['tdee-calculator', 'cut-calc-pro', 'habit-tracker', 'physique-ai'].includes(m.id)
    ),
    'Coaches': modules.filter(m => 
      ['coach-gpt', 'recovery-coach'].includes(m.id)
    )
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      {Object.entries(groupedModules).map(([groupName, groupModules]) => (
        <Card 
          key={groupName}
          className="bg-gray-900 border-gray-800 shadow-lg"
        >
          <Collapsible
            open={openGroups[groupName]}
            onOpenChange={() => toggleGroup(groupName)}
          >
            <CollapsibleTrigger asChild>
              <div className="w-full p-4 cursor-pointer hover:bg-gray-800/50 transition-colors touch-manipulation min-h-[64px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {groupModules[0]?.icon && React.createElement(groupModules[0].icon, { className: "w-6 h-6 text-gray-300" })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-lg truncate">{groupName}</h3>
                      <p className="text-gray-400 text-sm">{groupModules.length} modules</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {groupModules.some(m => m.isPremium) && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {openGroups[groupName] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                {groupModules.map((module) => (
                  <div 
                    key={module.id}
                    className={`bg-gradient-to-r ${module.gradient} backdrop-blur-sm rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] touch-manipulation`}
                    onClick={() => onModuleSelect(module.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                          <module.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm truncate">{module.title}</h4>
                          <p className="text-white/70 text-xs line-clamp-2">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {module.isPremium && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs whitespace-nowrap">
                            Pro
                          </Badge>
                        )}
                        <SmoothButton
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-medium px-3 py-2 text-xs min-h-[36px] touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            onModuleSelect(module.id);
                          }}
                        >
                          Open
                        </SmoothButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};

export default MobileModuleSelector;
