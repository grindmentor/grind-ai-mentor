
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-white mb-4">
        AI Fitness Dashboard
      </h1>
      <p className="text-gray-400 text-lg">
        Choose from our science-backed AI modules to optimize your fitness journey
      </p>
      <Badge className="mt-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
        All recommendations backed by peer-reviewed research
      </Badge>
    </div>
  );
};

export default DashboardHeader;
