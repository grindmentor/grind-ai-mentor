
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

  // Group modules by category
  const groupedModules = {
    'Training & Workouts': modules.filter(m => 
      ['smart-training', 'workout-timer', 'workout-library', 'recovery-coach'].includes(m.id)
    ),
    'Nutrition & Food': modules.filter(m => 
      ['meal-plan-ai', 'food-photo-logger', 'smart-food-log'].includes(m.id)
    ),
    'Calculators & Tools': modules.filter(m => 
      ['tdee-calculator', 'cut-calc-pro'].includes(m.id)
    ),
    'Progress & Analytics': modules.filter(m => 
      ['physique-ai', 'habit-tracker'].includes(m.id)
    ),
    'AI Coaching': modules.filter(m => 
      ['coach-gpt'].includes(m.id)
    )
  };

  const groupGradients: Record<string, string> = {
    'Training & Workouts': 'from-purple-600 to-purple-800',
    'Nutrition & Food': 'from-green-600 to-green-800', 
    'Calculators & Tools': 'from-orange-600 to-orange-800',
    'Progress & Analytics': 'from-blue-600 to-blue-800',
    'AI Coaching': 'from-red-600 to-red-800'
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedModules).map(([groupName, groupModules]) => (
        <Card 
          key={groupName}
          className={`bg-gradient-to-br ${groupGradients[groupName]} border-0 shadow-lg overflow-hidden`}
        >
          <Collapsible
            open={openGroups[groupName]}
            onOpenChange={() => toggleGroup(groupName)}
          >
            <CollapsibleTrigger asChild>
              <div className="w-full p-4 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      {groupModules[0]?.icon && <groupModules[0].icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{groupName}</h3>
                      <p className="text-white/80 text-sm">{groupModules.length} modules</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {groupModules.some(m => m.isPremium) && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {openGroups[groupName] ? (
                      <ChevronUp className="w-5 h-5 text-white/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/60" />
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
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
                    onClick={() => onModuleSelect(module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                          <module.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{module.title}</h4>
                          <p className="text-white/70 text-xs">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {module.isPremium && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            Pro
                          </Badge>
                        )}
                        <SmoothButton
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-medium px-3 py-1 text-xs"
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
