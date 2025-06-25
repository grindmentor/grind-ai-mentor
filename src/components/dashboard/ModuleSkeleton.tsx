
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ModuleSkeleton = () => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
        <Skeleton className="w-3/4 h-5 rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="w-full h-12 rounded" />
        <div className="space-y-3">
          <Skeleton className="w-1/2 h-3 rounded mx-auto" />
          <Skeleton className="w-full h-9 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleSkeleton;
