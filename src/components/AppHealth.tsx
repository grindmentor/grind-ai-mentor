
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const AppHealth: React.FC = () => {
  const { user } = useAuth();
  const { currentTier, isSubscribed } = useSubscription();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    runHealthChecks();
  }, [user]);

  const runHealthChecks = async () => {
    setIsLoading(true);
    const checks: HealthCheck[] = [];

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      checks.push({
        name: 'Database Connection',
        status: dbError ? 'error' : 'healthy',
        message: dbError ? 'Database connection failed' : 'Database connected successfully',
        details: dbError?.message
      });

      // Check authentication
      checks.push({
        name: 'Authentication',
        status: user ? 'healthy' : 'warning',
        message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
        details: user ? `User ID: ${user.id}` : 'Please sign in to access all features'
      });

      // Check subscription status
      checks.push({
        name: 'Subscription Status',
        status: isSubscribed ? 'healthy' : 'warning',
        message: `Current tier: ${currentTier}`,
        details: isSubscribed ? 'Premium features available' : 'Limited to free tier features'
      });

      // Check module loading
      try {
        const moduleCheck = await import('@/components/dashboard/AIModuleData');
        checks.push({
          name: 'Module Loading',
          status: 'healthy',
          message: `${moduleCheck.aiModules.length} modules loaded`,
          details: 'All AI modules are accessible'
        });
      } catch (error) {
        checks.push({
          name: 'Module Loading',
          status: 'error',
          message: 'Failed to load modules',
          details: error instanceof Error ? error.message : 'Unknown module loading error'
        });
      }

      // Check API endpoints (basic health check)
      if (user) {
        try {
          const { error: apiError } = await supabase.rpc('get_current_usage', { p_user_id: user.id });
          checks.push({
            name: 'API Functions',
            status: apiError ? 'error' : 'healthy',
            message: apiError ? 'API functions not responding' : 'API functions operational',
            details: apiError?.message || 'Database functions working correctly'
          });
        } catch (error) {
          checks.push({
            name: 'API Functions',
            status: 'error',
            message: 'API health check failed',
            details: error instanceof Error ? error.message : 'Unknown API error'
          });
        }
      }

      // Check local storage
      try {
        localStorage.setItem('health-check', 'test');
        localStorage.removeItem('health-check');
        checks.push({
          name: 'Local Storage',
          status: 'healthy',
          message: 'Local storage available',
          details: 'User preferences and cache working'
        });
      } catch (error) {
        checks.push({
          name: 'Local Storage',
          status: 'warning',
          message: 'Local storage limited',
          details: 'Some features may not persist between sessions'
        });
      }

      setHealthChecks(checks);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const overallHealth = healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
                      healthChecks.some(check => check.status === 'error') ? 'error' : 'warning';

  return (
    <Card className="bg-gradient-to-br from-gray-900/20 to-slate-900/30 backdrop-blur-sm border-gray-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-500/30 to-slate-500/40 rounded-xl flex items-center justify-center border border-gray-500/30">
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl flex items-center">
                App Health Monitor
                {getStatusIcon(overallHealth)}
              </CardTitle>
              <p className="text-gray-400 text-sm">
                {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString()}` : 'No checks run yet'}
              </p>
            </div>
          </div>
          <Button
            onClick={runHealthChecks}
            disabled={isLoading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Badge className={getStatusColor(overallHealth)}>
            {overallHealth === 'healthy' && 'All Systems Operational'}
            {overallHealth === 'warning' && 'Some Issues Detected'}
            {overallHealth === 'error' && 'Critical Issues Found'}
          </Badge>
        </div>

        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <div key={index} className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium text-white">{check.name}</h4>
                    <p className="text-gray-300 text-sm">{check.message}</p>
                    {check.details && (
                      <p className="text-gray-400 text-xs mt-1">{check.details}</p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(check.status)}>
                  {check.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {healthChecks.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p>Click refresh to run system health checks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
