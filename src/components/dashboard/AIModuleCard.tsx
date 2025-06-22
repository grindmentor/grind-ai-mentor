
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AIModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tier: string;
  trending?: boolean;
  buttonText: string;
}

interface AIModuleCardProps {
  module: AIModule;
  onModuleClick: (moduleId: string) => void;
}

const AIModuleCard = ({ module, onModuleClick }: AIModuleCardProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer relative">
      {module.trending && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs">
            🔥 Trending
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center text-white`}>
            {module.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-lg">{module.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                Free Access
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-gray-400 text-sm mb-4">
          {module.description}
        </CardDescription>
        <Button 
          onClick={() => onModuleClick(module.id)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          {module.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIModuleCard;
