
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Crown, Lock, Zap, Sparkles, ArrowRight, Star } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { AIModule } from "./AIModuleData";
import { SmoothButton } from "@/components/ui/smooth-button";
import { AnimatedCard } from "@/components/ui/animated-card";

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

  const premiumModules = modules.filter(m => m.isPremium);
  const freeModules = modules.filter(m => !m.isPremium);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <AnimatedCard className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-orange-500/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Modules</h2>
              <p className="text-gray-400 text-sm">Choose your fitness assistant</p>
            </div>
          </div>
          
          <SmoothButton
            variant="ghost"
            className="w-full justify-between text-white hover:bg-white/10 min-h-[56px] rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-3">
              {selectedModule ? (
                <>
                  <div className={`w-8 h-8 bg-gradient-to-br ${selectedModule.gradient} rounded-lg flex items-center justify-center`}>
                    <selectedModule.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{selectedModule.title}</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-gray-300">Select an AI Module</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </SmoothButton>
          
          {isOpen && (
            <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
              {/* Free Modules */}
              {freeModules.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
                    <span className="text-green-400 text-xs font-medium px-2">FREE MODULES</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent flex-1"></div>
                  </div>
                  {freeModules.map((module) => (
                    <ModuleOption
                      key={module.id}
                      module={module}
                      onSelect={() => handleModuleSelect(module)}
                    />
                  ))}
                </div>
              )}

              {/* Premium Modules */}
              {premiumModules.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
                    <span className="text-yellow-400 text-xs font-medium px-2">PREMIUM MODULES</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
                  </div>
                  {premiumModules.map((module) => (
                    <ModuleOption
                      key={module.id}
                      module={module}
                      onSelect={() => handleModuleSelect(module)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Selected Module Details */}
      {selectedModule && (
        <AnimatedCard delay={200} className="p-0 border-0 bg-transparent">
          <SelectedModuleCard module={selectedModule} onLaunch={() => onModuleSelect(selectedModule.id)} />
        </AnimatedCard>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Available", value: modules.filter(m => !m.isPremium).length, color: "from-green-500 to-emerald-600" },
          { label: "Premium", value: modules.filter(m => m.isPremium).length, color: "from-yellow-500 to-orange-600" },
          { label: "Total", value: modules.length, color: "from-blue-500 to-purple-600" }
        ].map((stat, index) => (
          <AnimatedCard key={stat.label} delay={300 + index * 100} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.value}
              </div>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </CardContent>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

const ModuleOption = ({ module, onSelect }: { module: AIModule; onSelect: () => void }) => {
  const IconComponent = module.icon;
  const { canAccess, canUse, remaining, isUnlimited } = useFeatureAccess(module.usageKey);

  const getStatusInfo = () => {
    if (!canAccess) return { text: 'Premium Required', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: Crown };
    if (!canUse && !isUnlimited) return { text: 'Limit Reached', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: Lock };
    return { text: isUnlimited ? 'Unlimited' : `${remaining} left`, color: 'text-green-400', bgColor: 'bg-green-500/10', icon: Zap };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <button
      onClick={onSelect}
      className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/70 rounded-xl transition-all duration-300 text-left border border-gray-700/50 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 group"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-white font-semibold text-sm truncate">{module.title}</h3>
            {module.isNew && (
              <Badge className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5">New</Badge>
            )}
            {module.isPremium && (
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5">
                <Crown className="w-2.5 h-2.5 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-2 leading-relaxed">{module.description}</p>
          <div className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
            <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-400" />
      </div>
    </button>
  );
};

const SelectedModuleCard = ({ module, onLaunch }: { module: AIModule; onLaunch: () => void }) => {
  const IconComponent = module.icon;
  const { canAccess, canUse, remaining, isUnlimited, upgradeMessage } = useFeatureAccess(module.usageKey);

  const canLaunch = canAccess && canUse;

  return (
    <Card className={`bg-gradient-to-br ${module.gradient} border-0 text-white overflow-hidden relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
      <CardContent className="p-6 relative">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0 transition-transform duration-300 hover:scale-110">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-white">{module.title}</h2>
              {module.isNew && (
                <Badge className="bg-white/20 text-white text-xs animate-pulse">New</Badge>
              )}
              {module.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">{module.description}</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-white/80 text-sm font-medium">Status</span>
                <span className="text-white text-sm font-semibold">
                  {!canAccess ? upgradeMessage : isUnlimited ? 'Unlimited usage' : `${remaining} uses remaining`}
                </span>
              </div>
              
              <SmoothButton
                onClick={onLaunch}
                disabled={!canLaunch}
                className={`w-full text-white border-0 min-h-[48px] font-semibold transition-all duration-300 ${
                  !canAccess 
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' 
                    : !canUse
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                    : 'bg-white/20 hover:bg-white/30 hover:shadow-lg'
                }`}
                soundEnabled={!canLaunch}
              >
                <div className="flex items-center justify-center space-x-2">
                  {!canAccess ? (
                    <>
                      <Crown className="w-5 h-5" />
                      <span>Upgrade Required</span>
                    </>
                  ) : !canUse ? (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Limit Reached</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Launch Module</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </SmoothButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileModuleSelector;
