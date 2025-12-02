import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backgroundSync, SyncStatus } from '@/services/backgroundSyncService';
import { Button } from './ui/button';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerType, setBannerType] = useState<'offline' | 'online' | 'syncing' | 'synced'>('offline');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(backgroundSync.getSyncStatus());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Only show online banner if we were offline
      if (!navigator.onLine) return;
      setBannerType('online');
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBannerType('offline');
      setShowBanner(true);
    };

    const unsubscribe = backgroundSync.subscribe((status) => {
      setSyncStatus(status);
      // Only show syncing banner if actually syncing with pending items
      if (status.isSyncing && status.pending > 0) {
        setBannerType('syncing');
        setShowBanner(true);
      } else if (status.pending === 0 && bannerType === 'syncing') {
        setBannerType('synced');
        setTimeout(() => setShowBanner(false), 2000);
      }
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Only show offline banner if actually offline
    if (!navigator.onLine) {
      setShowBanner(true);
      setBannerType('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [bannerType]);

  const handleForceSync = async () => {
    try {
      await backgroundSync.forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  if (!showBanner && syncStatus.pending === 0) return null;

  const getBannerContent = () => {
    switch (bannerType) {
      case 'offline':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'You\'re offline',
          subtext: syncStatus.pending > 0 ? `${syncStatus.pending} items waiting to sync` : 'Changes will sync when back online',
          bgClass: 'bg-amber-500/90'
        };
      case 'online':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Back online',
          subtext: syncStatus.pending > 0 ? 'Syncing your data...' : 'All caught up!',
          bgClass: 'bg-emerald-500/90'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Syncing...',
          subtext: `${syncStatus.pending} items remaining`,
          bgClass: 'bg-primary/90'
        };
      case 'synced':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Sync complete',
          subtext: 'All data synced',
          bgClass: 'bg-emerald-500/90'
        };
    }
  };

  const content = getBannerContent();

  return (
    <>
      {/* Main banner */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-transform duration-300",
          showBanner ? "translate-y-0" : "-translate-y-full"
        )}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className={cn(
          "flex items-center justify-center gap-3 px-4 py-2 text-white text-sm font-medium",
          content.bgClass
        )}>
          {content.icon}
          <div className="flex flex-col items-center">
            <span>{content.text}</span>
            <span className="text-xs opacity-80">{content.subtext}</span>
          </div>
          {!isOnline && (
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 p-1 hover:bg-white/20 rounded"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Floating sync button when items pending */}
      {syncStatus.pending > 0 && !showBanner && isOnline && (
        <div className="fixed bottom-20 right-4 z-50">
          <Button
            onClick={handleForceSync}
            size="sm"
            className="bg-primary/90 hover:bg-primary text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
            disabled={syncStatus.isSyncing}
          >
            {syncStatus.isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudOff className="w-4 h-4" />
            )}
            <span>{syncStatus.pending} pending</span>
          </Button>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
