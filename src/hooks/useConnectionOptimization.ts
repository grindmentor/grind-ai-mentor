
import { useState, useEffect, useCallback } from 'react';

interface ConnectionInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const useConnectionOptimization = () => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    effectiveType: 'unknown',
    downlink: 1,
    rtt: 100,
    saveData: false
  });
  
  const [lowDataMode, setLowDataMode] = useState(false);

  useEffect(() => {
    const updateConnection = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setConnectionInfo({
          effectiveType: conn.effectiveType || 'unknown',
          downlink: conn.downlink || 1,
          rtt: conn.rtt || 100,
          saveData: conn.saveData || false
        });
        
        // Auto-enable low data mode for slow connections
        const isSlowConnection = conn.effectiveType === '2g' || 
                               conn.effectiveType === 'slow-2g' || 
                               conn.downlink < 0.5;
        setLowDataMode(isSlowConnection || conn.saveData);
      }
    };

    updateConnection();
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateConnection);
      return () => {
        (navigator as any).connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  const getOptimizedSettings = useCallback(() => {
    const isSlowConnection = connectionInfo.effectiveType === '2g' || 
                           connectionInfo.effectiveType === 'slow-2g' ||
                           connectionInfo.downlink < 1;

    return {
      // Image optimization
      imageQuality: isSlowConnection || lowDataMode ? 40 : 80,
      imageWidth: isSlowConnection || lowDataMode ? 400 : 800,
      useWebP: !isSlowConnection,
      
      // AI optimization
      useGPT4Mini: true, // Always use lighter model
      maxTokens: isSlowConnection || lowDataMode ? 200 : 400,
      aiTimeout: isSlowConnection ? 15000 : 8000,
      
      // Database optimization
      pageSize: isSlowConnection || lowDataMode ? 5 : 15,
      preloadNext: !isSlowConnection && !lowDataMode,
      
      // Animation optimization  
      reduceAnimations: isSlowConnection || lowDataMode,
      animationDuration: isSlowConnection || lowDataMode ? 150 : 300,
      
      // General
      lowDataMode: lowDataMode || isSlowConnection,
      connectionQuality: isSlowConnection ? 'slow' : 'fast'
    };
  }, [connectionInfo, lowDataMode]);

  const toggleLowDataMode = useCallback(() => {
    setLowDataMode(prev => !prev);
  }, []);

  return {
    connectionInfo,
    optimizedSettings: getOptimizedSettings(),
    toggleLowDataMode,
    lowDataMode
  };
};
