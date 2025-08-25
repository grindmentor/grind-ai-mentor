
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('Module Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Module Error Details:', {
      error,
      errorInfo,
      moduleName: this.props.moduleName,
      timestamp: new Date().toISOString()
    });
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    console.log('Resetting module error boundary');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    console.log('Reloading page due to module error');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground flex items-center justify-center p-4">
          <Card className="bg-card/40 backdrop-blur-sm border-border max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-foreground">
                {this.props.moduleName ? `${this.props.moduleName} Error` : 'Module Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Something went wrong while loading this module. This error has been logged.
              </p>
              
              <div className="space-y-3">
                {this.props.onBack && (
                  <Button
                    onClick={this.props.onBack}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-destructive bg-muted p-2 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.error.stack && '\n' + this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:' + this.state.errorInfo.componentStack}
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

export default ModuleErrorBoundary;
