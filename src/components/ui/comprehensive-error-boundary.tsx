import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showHomeButton?: boolean;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ComprehensiveErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ComprehensiveErrorBoundary caught error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics or error tracking service
      this.logErrorToService(error, errorInfo);
    }
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implement your error logging service here
    // Example: Sentry, LogRocket, etc.
    console.log('Logging error to service:', { error, errorInfo });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      this.handleReload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const errorMessage = this.state.error?.message || 'Unknown error occurred';
      const isModuleError = this.props.moduleName;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="bg-card border-border max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-foreground">
                {isModuleError ? `${this.props.moduleName} Error` : 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {isModuleError 
                    ? `The ${this.props.moduleName} module encountered an error and needs to be restarted.`
                    : 'We encountered an unexpected error. This has been logged and we\'ll look into it.'
                  }
                </p>
                
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-orange-400 mb-4">
                    Retry attempt {this.state.retryCount} of {this.maxRetries}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {this.state.retryCount === 0 ? 'Try Again' : 'Retry'}
                  </Button>
                )}
                
                {this.props.showHomeButton && (
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="w-full border-border hover:bg-accent"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full border-border hover:bg-accent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload App
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-muted-foreground cursor-pointer flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Error Details (Dev Mode)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <pre className="text-xs text-red-400 bg-muted p-2 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                    {this.state.error.stack && (
                      <pre className="text-xs text-red-400 bg-muted p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo && (
                      <pre className="text-xs text-red-400 bg-muted p-2 rounded overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ComprehensiveErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ComprehensiveErrorBoundary>
    );
  };
}

export default ComprehensiveErrorBoundary;