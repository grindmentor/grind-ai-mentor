
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Lock, LucideIcon } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageTracking } from "@/hooks/useUsageTracking";

interface AIModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
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
  const [selectedModule, setSelectedModule] = useState<AIModule | null>(null);
  const { isSubscribed } = useSubscription();
  const { canUseFeature, getRemainingUsage } = useUsageTracking();

  const handleModuleChange = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    setSelectedModule(module || null);
  };

  const handleLaunch = () => {
    if (selectedModule) {
      onModuleSelect(selectedModule.id);
    }
  };

  const moduleStatus = useMemo(() => {
    if (!selectedModule) return null;
    
    const canAccess = !selectedModule.isPremium || isSubscribed;
    const remaining = getRemainingUsage(selectedModule.usageKey as any);
    const canUse = canUseFeature(selectedModule.usageKey as any);
    
    return { canAccess, remaining, canUse };
  }, [selectedModule, isSubscribed]);

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Select AI Module</CardTitle>
          <CardDescription className="text-gray-400">
            Choose from our science-backed AI fitness tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleModuleChange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Choose an AI module..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {modules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <SelectItem 
                    key={module.id} 
                    value={module.id}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{module.title}</span>
                      {module.isNew && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-2">New</Badge>
                      )}
                      {module.isPremium && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedModule && moduleStatus && (
            <Card className={`bg-gradient-to-br ${selectedModule.gradient} border-0 text-white`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {!moduleStatus.canAccess ? (
                      <Lock className="w-6 h-6 text-white" />
                    ) : (
                      <selectedModule.icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {selectedModule.isNew && (
                      <Badge className="bg-white/20 text-white text-xs">New</Badge>
                    )}
                    {selectedModule.isPremium && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 text-xs border-yellow-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-white text-lg">{selectedModule.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-white/80 text-sm">
                  {selectedModule.description}
                </CardDescription>
                
                {moduleStatus.canAccess ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-white/70 text-sm">
                        {moduleStatus.remaining === -1 ? 'Unlimited usage' : `${moduleStatus.remaining} uses remaining`}
                      </span>
                    </div>
                    <Button 
                      onClick={handleLaunch}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                      disabled={!moduleStatus.canUse}
                      size="lg"
                    >
                      {moduleStatus.canUse ? 'Launch Module' : 'Usage Limit Reached'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-white/70 text-sm">Premium Required</span>
                    </div>
                    <Button 
                      className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-0"
                      size="lg"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Access
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileModuleSelector;
