
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ModuleSkeleton = () => {
  return (
    <Card className="bg-gray-800/50 border-gray-700 animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-xl" />
          <div className="w-16 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
        </div>
        <div className="w-3/4 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-12 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
        <div className="space-y-3">
          <div className="w-1/2 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded mx-auto" />
          <div className="w-full h-9 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleSkeleton;
