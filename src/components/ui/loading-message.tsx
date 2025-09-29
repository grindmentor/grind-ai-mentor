import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingMessageProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  message = 'Loading...',
  submessage,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{message}</p>
        {submessage && (
          <p className="text-xs text-muted-foreground">{submessage}</p>
        )}
      </div>
    </div>
  );
};
