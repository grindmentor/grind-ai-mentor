
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AppHealthMetrics {
  connectivity: 'online' | 'offline' | 'slow';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  authStatus: 'authenticated' | 'unauthenticated' | 'pending';
  performance: 'excellent' | 'good' | 'poor';
  errors: number;
  uptime: number;
}

interface HealthIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const useAppHealth = () => {
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<AppHealthMetrics>({
    connectivity: 'online',
    databaseStatus: 'connected',
    authStatus: 'pending',
    performance: 'excellent',
    errors: 0,
    uptime: 0
  });
  
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [isHealthy, setIsHealthy] = useState(true);
  const [startTime] = useState(Date.now());

  const addIssue = useCallback((type: HealthIssue['type'], message: string) => {
    const issue: HealthIssue = {
      type,
      message,
      timestamp: Date.now(),
      resolved: false
    };
    
    setIssues(prev => [...prev.slice(-9), issue]); // Keep last 10 issues
    
    if (type === 'error') {
      setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
    }
  }, []);

  const resolveIssue = useCallback((timestamp: number) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.timestamp === timestamp 
          ? { ...issue, resolved: true }
          : issue
      )
    );
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setMetrics(prev => ({ ...prev, connectivity: 'online' }));
      resolveIssue(Date.now() - 1000); // Resolve recent connectivity issues
    };
    
    const handleOffline = () => {
      setMetrics(prev => ({ ...prev, connectivity: 'offline' }));
      addIssue('error', 'Lost internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addIssue, resolveIssue]);

  // Monitor database connectivity
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          setMetrics(prev => ({ ...prev, databaseStatus: 'error' }));
          addIssue('error', `Database error: ${error.message}`);
        } else {
          setMetrics(prev => ({ ...prev, databaseStatus: 'connected' }));
        }
      } catch (error) {
        setMetrics(prev => ({ ...prev, databaseStatus: 'disconnected' }));
        addIssue('error', 'Database connection failed');
      }
    };

    checkDatabase();
    const interval = setInterval(checkDatabase, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addIssue]);

  // Monitor authentication status
  useEffect(() => {
    if (loading) {
      setMetrics(prev => ({ ...prev, authStatus: 'pending' }));
    } else if (user) {
      setMetrics(prev => ({ ...prev, authStatus: 'authenticated' }));
    } else {
      setMetrics(prev => ({ ...prev, authStatus: 'unauthenticated' }));
    }
  }, [user, loading]);

  // Monitor performance
  useEffect(() => {
    const checkPerformance = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        let performanceLevel: AppHealthMetrics['performance'] = 'excellent';
        
        if (memoryUsage > 0.8) {
          performanceLevel = 'poor';
          addIssue('warning', 'High memory usage detected');
        } else if (memoryUsage > 0.6) {
          performanceLevel = 'good';
        }
        
        setMetrics(prev => ({ ...prev, performance: performanceLevel }));
      }
    };

    checkPerformance();
    const interval = setInterval(checkPerformance, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [addIssue]);

  // Update uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({ 
        ...prev, 
        uptime: Math.floor((Date.now() - startTime) / 1000) 
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Determine overall health
  useEffect(() => {
    const hasActiveErrors = issues.some(issue => 
      issue.type === 'error' && !issue.resolved && 
      Date.now() - issue.timestamp < 60000 // Within last minute
    );
    
    const isHealthyStatus = 
      metrics.connectivity === 'online' &&
      metrics.databaseStatus === 'connected' &&
      metrics.performance !== 'poor' &&
      !hasActiveErrors;
      
    setIsHealthy(isHealthyStatus);
  }, [metrics, issues]);

  return {
    metrics,
    issues,
    isHealthy,
    addIssue,
    resolveIssue
  };
};
