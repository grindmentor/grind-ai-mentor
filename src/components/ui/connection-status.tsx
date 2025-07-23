import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show when offline to avoid UI clutter
  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 flex items-center space-x-2 bg-red-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-200",
      className
    )}>
      <WifiOff className="w-4 h-4" />
      <span>Offline</span>
    </div>
  );
};