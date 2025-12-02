import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShow(true);
      setTimeout(() => setShow(false), 2000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShow(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show && !isOffline) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300 ${
        isOffline 
          ? 'bg-destructive text-destructive-foreground' 
          : 'bg-green-600 text-white'
      }`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You're offline - Data will sync when connected</span>
        </>
      ) : (
        <span>Back online</span>
      )}
    </div>
  );
};
