import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { backgroundSync } from '@/services/backgroundSyncService';

export const PWAStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, lastSync: null });
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check sync status
    const updateSyncStatus = () => {
      setSyncStatus(backgroundSync.getSyncStatus());
    };

    updateSyncStatus();
    const syncInterval = setInterval(updateSyncStatus, 30000); // Check every 30 seconds

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setIsInstallable(true);
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(syncInterval);
    };
  }, []);

  const handleInstallPWA = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install outcome: ${outcome}`);
      (window as any).deferredPrompt = null;
      setIsInstallable(false);
    }
  };

  const handleForceSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      await backgroundSync.forcSync();
      setSyncStatus(backgroundSync.getSyncStatus());
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className={`flex items-center space-x-1 ${
            isOnline 
              ? "bg-green-500/20 text-green-400 border-green-500/40" 
              : "bg-red-500/20 text-red-400 border-red-500/40"
          }`}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </Badge>

        {/* Sync Status */}
        {syncStatus.pending > 0 && (
          <Badge 
            variant="outline"
            className="bg-orange-500/20 text-orange-400 border-orange-500/40"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            <span className="text-xs">{syncStatus.pending} pending</span>
          </Badge>
        )}
      </div>

      {/* Install Button */}
      {isInstallable && (
        <Button
          onClick={handleInstallPWA}
          size="sm"
          className="bg-primary/90 hover:bg-primary text-white text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Install App
        </Button>
      )}

      {/* Force Sync Button */}
      {isOnline && syncStatus.pending > 0 && (
        <Button
          onClick={handleForceSync}
          disabled={isSyncing}
          size="sm"
          variant="outline"
          className="text-xs bg-background/90 hover:bg-background/100"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      )}

      {/* Last Sync Info */}
      {syncStatus.lastSync && (
        <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
          Last sync: {formatLastSync(syncStatus.lastSync)}
        </div>
      )}
    </div>
  );
};

export default PWAStatus;