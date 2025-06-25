
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Crown, Lock, Zap } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface AIModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  isNew?: boolean;
  isPremium?: boolean;
  usageKey: string;
}

interface MobileModuleSelectorProps {
  modules: AIModule[];
  onModuleSelect: (moduleId: string) => void;
}

const MobileModuleSelector = ({ modules, onModuleSelect }: MobileModuleSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null);

  const handleModuleSelect = (module: AIModule) => {
    setSelectedModule(module);
    setIsOpen(false);
    onModuleSelect(module.id);
  };

  return (
    <div className="space-y-4">
      {/* Module Selector Dropdown */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between text-white hover:bg-gray-800 min-h-[48px]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{selectedModule ? selectedModule.title : "Select an AI Module"}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {isOpen && (
            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
              {modules.map((module) => (
                <ModuleOption
                  key={module.id}
                  module={module}
                  onSelect={() => handleModuleSelect(module)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Module Details */}
      {selectedModule && (
        <SelectedModuleCard module={selectedModule} onLaunch={() => onModuleSelect(selectedModule.id)} />
      )}
    </div>
  );
};

const ModuleOption = ({ module, onSelect }: { module: AIModule; onSelect: () => void }) => {
  const IconComponent = module.icon;
  const { canAccess, canUse, remaining, isUnlimited } = useFeatureAccess(module.usageKey);

  const getStatusInfo = () => {
    if (!canAccess) return { text: 'Premium Required', color: 'text-yellow-400', icon: Crown };
    if (!canUse && !isUnlimited) return { text: 'Limit Reached', color: 'text-red-400', icon: Lock };
    return { text: isUnlimited ? 'Unlimited' : `${remaining} left`, color: 'text-green-400', icon: Zap };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <button
      onClick={onSelect}
      className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium text-sm truncate">{module.title}</h3>
            {module.isNew && (
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">New</Badge>
            )}
            {module.isPremium && (
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                <Crown className="w-2 h-2 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
            <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

const SelectedModuleCard = ({ module, onLaunch }: { module: AIModule; onLaunch: () => void }) => {
  const IconComponent = module.icon;
  const { canAccess, canUse, remaining, isUnlimited, upgradeMessage } = useFeatureAccess(module.usageKey);

  const canLaunch = canAccess && canUse;

  return (
    <Card className={`bg-gradient-to-br ${module.gradient} border-0 text-white`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-2">{module.title}</h2>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">{module.description}</p>
            
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-white/70 text-sm">
                  {!canAccess ? upgradeMessage : isUnlimited ? 'Unlimited usage' : `${remaining} uses remaining`}
                </span>
              </div>
              
              <Button
                onClick={onLaunch}
                disabled={!canLaunch}
                className={`w-full text-white border-0 min-h-[44px] ${
                  !canAccess 
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' 
                    : !canUse
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {!canAccess ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Required
                  </>
                ) : !canUse ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Limit Reached
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Launch Module
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileModuleSelector;
