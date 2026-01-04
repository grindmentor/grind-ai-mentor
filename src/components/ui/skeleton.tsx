import { cn } from "@/lib/utils"
import Logo from "./logo"

// Smooth shimmer gradient for premium feel
const shimmerClass = "bg-gradient-to-r from-muted/30 via-muted/60 to-muted/30 bg-[length:200%_100%] animate-shimmer";

function Skeleton({
  className,
  shimmer = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md",
        shimmer ? shimmerClass : "animate-pulse bg-muted/30",
        className
      )}
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

// Text skeleton with multiple lines
function TextSkeleton({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string 
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
function AvatarSkeleton({ 
  size = "md",
  className 
}: { 
  size?: "sm" | "md" | "lg" | "xl";
  className?: string 
}) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };
  
  return <Skeleton className={cn("rounded-full", sizes[size], className)} />;
}

// Button skeleton
function ButtonSkeleton({ 
  size = "md",
  className 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string 
}) {
  const sizes = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32"
  };
  
  return <Skeleton className={cn("rounded-lg", sizes[size], className)} />;
}

// Card skeleton
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6 space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <TextSkeleton lines={3} />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Input skeleton
function InputSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Table skeleton
function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number; 
  columns?: number;
  className?: string 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4 pb-2 border-b border-border/20">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex space-x-4 items-center py-2"
          style={{ animationDelay: `${rowIndex * 50}ms` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 ? "w-1/4" : "w-full"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Module card skeleton for dashboard
function ModuleCardSkeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-border/30 bg-gradient-to-br from-muted/20 to-muted/10 p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Stats card skeleton
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/30 bg-card/30 p-4 space-y-3", className)}>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// Chart skeleton
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/30 bg-card/30 p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="relative h-48">
        <Skeleton className="absolute inset-0 rounded-lg" />
        {/* Chart bars effect */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-40 px-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(shimmerClass, "w-8 rounded-t-sm")}
              style={{ 
                height: `${30 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
  );
}

// Form skeleton
function FormSkeleton({ 
  fields = 4,
  className 
}: { 
  fields?: number;
  className?: string 
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <InputSkeleton key={i} />
      ))}
      <ButtonSkeleton size="lg" className="w-full" />
    </div>
  );
}

// Notification skeleton
function NotificationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start space-x-3 p-4 rounded-lg bg-card/30 border border-border/20", className)}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// Food log entry skeleton
function FoodEntrySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg bg-card/30 border border-border/20", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Workout session skeleton
function WorkoutSessionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg bg-card/30 border border-border/20", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Goal skeleton
function GoalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg bg-card/30 border border-border/20", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  LogoSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  CardSkeleton,
  InputSkeleton,
  TableSkeleton,
  ModuleCardSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  NotificationSkeleton,
  FoodEntrySkeleton,
  WorkoutSessionSkeleton,
  GoalSkeleton,
  shimmerClass
}