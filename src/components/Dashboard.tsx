
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useCustomerMemory } from '@/hooks/useCustomerMemory';
import { MobileHeader } from './MobileHeader';
import { ModuleCard } from './dashboard/AIModuleCard';
import NotificationSystem from './NotificationSystem';
import PersonalizedSummary from './homepage/PersonalizedSummary';
import NotificationsSummary from './dashboard/NotificationsSummary';
import { RealGoalsAchievements } from './goals/RealGoalsAchievements';
import UsageIndicator from './UsageIndicator';
import NotificationCenter from './NotificationCenter';

interface DashboardProps {
  isNotificationsOpen?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isNotificationsOpen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTier, currentTierData, isSubscribed } = useSubscription();
  const { customerProfile, loading: customerLoading, refreshProfile } = useCustomerMemory();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(searchParams.get('module'));
  const [activeView, setActiveView] = useState<'dashboard' | 'notifications'>(
    isNotificationsOpen ? 'notifications' : 'dashboard'
  );

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        setModules(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, navigate]);

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId);
    navigate(`/app?module=${moduleId}`);
  };

  const isModuleLocked = (module: any) => {
    if (!isSubscribed && module.premium) {
      return true;
    }
    return false;
  };

  const aiModules = modules.filter((module) => module.category === 'ai');

  const handleNotificationsOpen = () => {
    setActiveView('notifications');
  };

  const handleNotificationsClose = () => {
    setActiveView('dashboard');
  };

  if (loading || customerLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
      <NotificationSystem />
      
      {activeView === 'notifications' ? (
        <NotificationCenter onBack={handleNotificationsClose} />
      ) : (
        <>
          <MobileHeader 
            title="Welcome to Myotopia"
            showNotifications={true}
            onNotificationsClick={handleNotificationsOpen}
          />
          
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                  Welcome to Myotopia
                </h1>
                <p className="text-gray-400 text-lg">
                  Your AI-powered fitness companion powered by science
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <PersonalizedSummary />
                <NotificationsSummary />
                <RealGoalsAchievements onNotificationsOpen={handleNotificationsOpen} />
                <UsageIndicator 
                  featureKey="coach_gpt_queries"
                  featureName="CoachGPT"
                  compact={true}
                />
              </div>

              {/* AI Modules Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">AI Modules</h2>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {aiModules.length} Available
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiModules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      isLocked={isModuleLocked(module)}
                      currentTier={currentTier}
                      onModuleSelect={handleModuleSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          {modules.map((module) => (
            <div key={module.id}>
              {module.component}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Dashboard;
