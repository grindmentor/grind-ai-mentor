import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  const [error, setError] = useState<Error | null>(null);

  // IMPORTANT: Avoid artificial mount delays.
  // Any "loading gate" here creates a visible flash when returning to /app.
  useEffect(() => {
    try {
      // No-op: keep the try/catch so unexpected runtime errors can still be captured.
    } catch (err) {
      console.error('[DASHBOARD WRAPPER] Initialization error:', err);
      setError(err as Error);
    }
  }, []);


  const copyError = () => {
    if (error) {
      const errorText = `
MYOTOPIA DASHBOARD ERROR
========================
Time: ${new Date().toISOString()}
Error: ${error.message}
Stack: ${error.stack || 'No stack trace'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
========================
      `.trim();

      navigator.clipboard.writeText(errorText);
      toast.success('Error details copied');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
        <div className="w-full max-w-md">
          <Alert className="bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Dashboard Error</AlertTitle>
            <AlertDescription className="text-red-300 space-y-4">
              <p>The dashboard failed to load. Please try refreshing the page.</p>
              <div className="bg-black/40 p-3 rounded font-mono text-xs text-red-200 break-all">
                {error.message}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={copyError}
                  variant="outline"
                  className="border-red-800 text-red-300 hover:bg-red-900/20"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={({ error: boundaryError, reset }) => (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
          <div className="w-full max-w-md">
            <Alert className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Dashboard Crashed</AlertTitle>
              <AlertDescription className="text-red-300 space-y-4">
                <p>Something went wrong while rendering the dashboard.</p>
                {boundaryError && (
                  <div className="bg-black/40 p-3 rounded font-mono text-xs text-red-200 break-all max-h-32 overflow-y-auto">
                    {boundaryError.message}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="flex-1 border-red-800 text-red-300 hover:bg-red-900/20"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Refresh Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
