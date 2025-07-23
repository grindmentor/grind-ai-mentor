import React, { Suspense, memo, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ComprehensiveErrorBoundary } from '@/components/ui/comprehensive-error-boundary';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { usePerformanceContext } from '@/components/ui/performance-provider';

interface PerformanceOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  showErrorBoundary?: boolean;
  loadingMessage?: string;
  fallback?: React.ReactNode;
}

// Memoized layout container
const LayoutContainer = memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground ${className || ''}`}>
      {children}
    </div>
  );
});

LayoutContainer.displayName = 'LayoutContainer';

// Optimized loading fallback
const OptimizedLoadingFallback = memo(({ message }: { message?: string }) => {
  const { lowDataMode } = usePerformanceContext();
  
  return (
    <LoadingScreen 
      message={lowDataMode ? 'Loading (Performance Mode)' : message || 'Loading...'}
      fullScreen={true}
    />
  );
});

OptimizedLoadingFallback.displayName = 'OptimizedLoadingFallback';

export const PerformanceOptimizedLayout: React.FC<PerformanceOptimizedLayoutProps> = ({
  children,
  className,
  showErrorBoundary = true,
  loadingMessage,
  fallback
}) => {
  const { optimizedSettings } = usePerformanceContext();
  
  // Memoize the layout structure
  const layoutContent = useMemo(() => {
    const content = (
      <LayoutContainer className={className}>
        {children}
      </LayoutContainer>
    );

    // Wrap with Suspense for code splitting
    return (
      <Suspense fallback={fallback || <OptimizedLoadingFallback message={loadingMessage} />}>
        {content}
      </Suspense>
    );
  }, [children, className, fallback, loadingMessage]);

  // Conditionally wrap with error boundary
  if (showErrorBoundary) {
    return (
      <ComprehensiveErrorBoundary showHomeButton={true}>
        {layoutContent}
      </ComprehensiveErrorBoundary>
    );
  }

  return layoutContent;
};

// Higher-order component for pages
export function withPerformanceOptimizedLayout<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    errorBoundary?: boolean;
    loadingMessage?: string;
    className?: string;
  } = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <PerformanceOptimizedLayout
        showErrorBoundary={options.errorBoundary}
        loadingMessage={options.loadingMessage}
        className={options.className}
      >
        <Component {...props} />
      </PerformanceOptimizedLayout>
    );
  };
}

export default PerformanceOptimizedLayout;