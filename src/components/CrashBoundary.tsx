
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class CrashBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('CrashBoundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CrashBoundary detailed error:', error, errorInfo);
    console.error('Component that crashed:', this.props.componentName || 'Unknown');
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    console.log('Resetting crash boundary for:', this.props.componentName || 'Unknown component');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    console.log('Reloading page due to crash');
    window.location.reload();
  };

  private handleGoHome = () => {
    console.log('Going to home due to crash');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-800 max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-white">
                {this.props.componentName ? `${this.props.componentName} Crashed` : 'Site Crashed'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                We encountered an unexpected error. This crash has been logged and we're working to fix it.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-800"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-2 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                  </pre>
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

export default CrashBoundary;
