
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Skeleton */}
        <div className="text-center md:text-left">
          <Skeleton className="h-10 w-96 bg-gray-800 mb-2 mx-auto md:mx-0" />
          <Skeleton className="h-6 w-80 bg-gray-800 mx-auto md:mx-0" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-16 bg-gray-800 mb-2 mx-auto" />
                <Skeleton className="h-4 w-20 bg-gray-800 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Modules Section Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32 bg-gray-800" />
            <Skeleton className="h-10 w-24 bg-gray-800" />
          </div>

          {/* Module Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-12 w-12 bg-gray-800 rounded-xl" />
                    <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-32 bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-40 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                    <Skeleton className="h-8 w-16 bg-gray-800 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade Section Skeleton */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full bg-gray-800 mb-4" />
            <Skeleton className="h-10 w-32 bg-gray-800" />
          </CardContent>
        </Card>

        {/* Quick Actions Skeleton */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4">
                  <Skeleton className="h-8 w-8 bg-gray-800 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 bg-gray-800 mb-1" />
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
