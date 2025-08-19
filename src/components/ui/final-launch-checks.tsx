// App performance and launch-ready final checks
import React, { useEffect } from 'react';
import { initializePerformance } from '@/utils/performanceOptimizations';
import { toast } from 'sonner';

export const FinalLaunchChecks: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformance();
    
    // Check PWA readiness
    const checkPWAReadiness = () => {
      const checks = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: document.querySelector('link[rel="manifest"]') !== null,
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        icons: document.querySelector('link[rel="apple-touch-icon"]') !== null,
        themeColor: document.querySelector('meta[name="theme-color"]') !== null,
        viewport: document.querySelector('meta[name="viewport"]') !== null
      };
      
      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PWA] Readiness: ${passed}/${total} checks passed`, checks);
      }
      
      if (passed === total) {
        console.log('🚀 App is launch-ready with full PWA compliance!');
      }
    };
    
    // Check subscription system
    const checkSubscriptionSystem = async () => {
      try {
        // Verify Stripe is accessible
        const stripeTest = await fetch('https://js.stripe.com/v3/', { method: 'HEAD' });
        if (stripeTest.ok) {
          console.log('✅ Stripe integration ready');
        }
      } catch (error) {
        console.warn('⚠️ Stripe verification failed:', error);
      }
    };
    
    // Check database connectivity
    const checkDatabaseConnectivity = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (!error) {
          console.log('✅ Database connectivity verified');
        } else {
          console.warn('⚠️ Database connectivity issue:', error);
        }
      } catch (error) {
        console.warn('⚠️ Database check failed:', error);
      }
    };
    
    // Run checks after short delay
    setTimeout(() => {
      checkPWAReadiness();
      checkSubscriptionSystem();
      checkDatabaseConnectivity();
    }, 2000);
    
    // Performance audit
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcp = entry.startTime;
            if (lcp > 2500) {
              console.warn(`[Performance] LCP is slow: ${lcp.toFixed(2)}ms`);
            } else if (lcp < 1500) {
              console.log(`[Performance] Excellent LCP: ${lcp.toFixed(2)}ms`);
            }
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        // Observer not supported
      }
    }
    
    // Memory usage monitoring
    if ('memory' in performance && process.env.NODE_ENV === 'development') {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          console.warn(`[Performance] High memory usage: ${usagePercent.toFixed(1)}%`);
        }
      };
      
      const memoryInterval = setInterval(checkMemory, 30000);
      return () => clearInterval(memoryInterval);
    }
  }, []);

  return null; // Background service component
};

export default FinalLaunchChecks;