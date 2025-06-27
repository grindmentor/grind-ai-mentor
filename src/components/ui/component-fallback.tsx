
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ComponentFallbackProps {
  error?: Error;
  componentName?: string;
  onRetry?: () => void;
}

export const ComponentFallback: React.FC<ComponentFallbackProps> = ({ 
  error, 
  componentName = 'Component',
  onRetry 
}) => {
  return (
    <Card className="bg-gray-900/40 border-gray-700/50">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">
          {componentName} Unavailable
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          We're having trouble loading this component right now.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-orange-400 hover:text-orange-300 text-sm underline"
          >
            Try Again
          </button>
        )}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer">
              Error Details (Dev Mode)
            </summary>
            <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-2 rounded overflow-auto max-h-20">
              {error.message}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
