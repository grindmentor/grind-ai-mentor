
import { cn } from "@/lib/utils"
import Logo from "./logo"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800/30", className)}
      {...props}
    />
  )
}

function LogoSkeleton({
  message = "Loading...",
  className = ""
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center space-y-6">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
          <span className="text-white text-lg font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}

export { Skeleton, LogoSkeleton }
