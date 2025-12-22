import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Zap, Brain, FileText, HelpCircle, LogOut, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import DisplayNameSection from '@/components/settings/DisplayNameSection';
import ProfileMetrics from '@/components/settings/ProfileMetrics';
import AccountManagement from '@/components/settings/AccountManagement';
import { MobileHeader } from '@/components/MobileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { TabContentSkeleton } from '@/components/ui/tab-content-skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { actions } = useGlobalState();
  const { invalidateCache } = useAppSync();
  const [activeTab, setActiveTab] = useState('profile');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Load display name
  useEffect(() => {
    const loadDisplayName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.display_name) {
        setDisplayName(data.display_name);
      }
    };
    loadDisplayName();
  }, [user]);

  // Handle tab change with smooth transition
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 100);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'units', label: 'Units', icon: Globe },
    { id: 'app', label: 'App', icon: Zap },
    { id: 'ai', label: 'AI', icon: Brain },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'support', label: 'Help', icon: HelpCircle }
  ];

  const handleLogout = async () => {
    try {
      invalidateCache('.*');
      actions.closeAllModals();
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileHeader 
        title="Settings" 
        rightElement={
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="h-10 px-3 text-destructive hover:bg-destructive/10 text-xs"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        }
      />

      <div className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-8 bg-muted/40 rounded-xl p-1 h-auto gap-0.5">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={cn(
                    "rounded-lg py-2 px-0.5 transition-all duration-150",
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    "flex flex-col items-center gap-0.5 min-h-[52px]"
                  )}
                  aria-label={tab.label}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[8px] font-medium truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className={cn(
              "transition-opacity duration-100",
              isTabTransitioning ? "opacity-50" : "opacity-100"
            )}>
              {isTabTransitioning ? (
                <TabContentSkeleton variant="settings" />
              ) : (
                <>
                  <TabsContent value="profile" className="mt-0 space-y-4">
                    <DisplayNameSection 
                      displayName={displayName} 
                      onDisplayNameChange={setDisplayName} 
                    />
                    <ProfileMetrics />
                  </TabsContent>

                  <TabsContent value="units" className="mt-0">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          Unit Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <UnitPreferences />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="app" className="mt-0">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          App Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <AppPreferences />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          AI Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <AIMemoryReset />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy" className="mt-0">
                    <AccountManagement />
                  </TabsContent>

                  <TabsContent value="legal" className="mt-0">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Legal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 space-y-1">
                        <Button
                          onClick={() => navigate('/terms')}
                          variant="ghost"
                          className="w-full justify-start h-12 text-sm"
                        >
                          <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                          Terms of Service
                        </Button>
                        <Button
                          onClick={() => navigate('/privacy')}
                          variant="ghost"
                          className="w-full justify-start h-12 text-sm"
                        >
                          <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                          Privacy Policy
                        </Button>
                        <Button
                          onClick={() => navigate('/about')}
                          variant="ghost"
                          className="w-full justify-start h-12 text-sm"
                        >
                          <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                          About Myotopia
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="support" className="mt-0">
                    <Card className="bg-card border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 space-y-4">
                        <Button
                          onClick={() => navigate('/support')}
                          variant="outline"
                          className="w-full justify-start h-12 text-sm"
                        >
                          <HelpCircle className="w-4 h-4 mr-3" />
                          Contact Support
                        </Button>
                        <div className="p-4 bg-muted/30 rounded-xl">
                          <h3 className="text-foreground font-medium text-sm mb-1">Quick Help</h3>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            For technical issues or questions, use Contact Support above. We typically respond within 24 hours.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;