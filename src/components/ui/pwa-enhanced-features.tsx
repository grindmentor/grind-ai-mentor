import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share, 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ExternalLink,
  FileText,
  Camera,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const PWAEnhancedFeatures: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    // Handle install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Handle app install
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Installing app...');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Myotopia - AI Fitness Coach',
          text: 'Transform your physique with science-based AI coaching',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.origin);
      toast.success('Link copied to clipboard!');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        
        // Register for push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
          });
          
          // Send subscription to server
          console.log('Push subscription:', subscription);
        }
      } else {
        toast.error('Notifications blocked');
      }
    }
  };

  const testFileHandler = () => {
    // Create a test workout file
    const workoutData = {
      name: 'Test Workout',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 15 },
        { name: 'Squats', sets: 3, reps: 20 }
      ],
      date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(workoutData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-workout.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Test file created! Try opening it with Myotopia');
  };

  const testProtocolHandler = () => {
    // Test protocol handler
    const protocolUrl = 'myotopia://workout';
    window.open(protocolUrl, '_self');
  };

  const testShareTarget = async () => {
    if (navigator.share) {
      try {
        // Create a test image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(0, 0, 400, 300);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText('Myotopia Progress Photo', 50, 150);
        }

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'progress-photo.png', { type: 'image/png' });
            
            await navigator.share({
              title: 'My Fitness Progress',
              text: 'Check out my progress with Myotopia!',
              files: [file]
            });
          }
        });
      } catch (error) {
        console.log('Share cancelled or not supported');
      }
    } else {
      toast.error('Sharing not supported on this device');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Download className="w-5 h-5 mr-2 text-purple-400" />
            PWA Features
          </CardTitle>
          <CardDescription className="text-purple-200/80">
            Enhanced app capabilities for the ultimate experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Install App */}
            {isInstallable && (
              <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-300">Install App</h4>
                  <Download className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-green-200/80 mb-3">
                  Install for faster access and offline features
                </p>
                <Button 
                  onClick={handleInstall}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Install Now
                </Button>
              </div>
            )}

            {/* Online Status */}
            <div className={`p-4 rounded-lg border ${
              isOnline 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
                  Connection Status
                </h4>
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
              </div>
              <Badge 
                className={isOnline 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                }
              >
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* Notifications */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-300">Notifications</h4>
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-blue-200/80 mb-3">
                {notificationPermission === 'granted' 
                  ? 'Notifications enabled' 
                  : 'Enable workout reminders'}
              </p>
              {notificationPermission !== 'granted' && (
                <Button 
                  onClick={requestNotificationPermission}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Enable Notifications
                </Button>
              )}
            </div>

            {/* Share */}
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-orange-300">Share App</h4>
                <Share className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-sm text-orange-200/80 mb-3">
                Share Myotopia with friends
              </p>
              <Button 
                onClick={handleShare}
                size="sm"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Share Now
              </Button>
            </div>
          </div>

          {/* Advanced PWA Features Testing */}
          <div className="border-t border-gray-700/50 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Test PWA Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                onClick={testFileHandler}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                File Handler
              </Button>
              <Button 
                onClick={testProtocolHandler}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Protocol
              </Button>
              <Button 
                onClick={testShareTarget}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Camera className="w-3 h-3 mr-1" />
                Share Target
              </Button>
              <Button 
                onClick={() => window.backgroundSync?.forceSync()}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Force Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAEnhancedFeatures;