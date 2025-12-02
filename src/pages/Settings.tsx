
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Zap, Brain, FileText, HelpCircle, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { TabContentSkeleton } from '@/components/ui/tab-content-skeleton';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { actions } = useGlobalState();
  const { invalidateCache } = useAppSync();
  const [activeTab, setActiveTab] = useState('units');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Handle tab change with transition animation
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 150);
  };

  const tabs = [
    { id: 'units', label: 'Units', icon: Globe },
    { id: 'app', label: 'App', icon: Zap },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'ai', label: 'AI Memory', icon: Brain },
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const handleLogout = async () => {
    try {
      // Clear all caches and state
      invalidateCache('.*');
      actions.closeAllModals();
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="p-2 h-10 w-10 rounded-full hover:bg-muted"
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Settings
                </h1>
                <p className="text-muted-foreground text-sm">Customize your preferences</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-6 bg-muted/50 rounded-xl p-1 h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 flex flex-col items-center gap-1"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4">
                {isTabTransitioning ? (
                  <TabContentSkeleton variant="settings" />
                ) : (
                  <>
                    <TabsContent value="units" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardContent className="pt-6">
                          <UnitPreferences />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="app" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardContent className="pt-6">
                          <AppPreferences />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="usage" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-foreground text-base">Usage Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground text-sm">View your AI queries, meal plans, and app activity.</p>
                          <Button
                            onClick={() => navigate('/usage')}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Stats
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardContent className="pt-6">
                          <AIMemoryReset />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="legal" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-foreground text-base">Legal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            onClick={() => navigate('/terms')}
                            variant="ghost"
                            className="w-full justify-start h-12"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            Terms of Service
                          </Button>
                          <Button
                            onClick={() => navigate('/privacy')}
                            variant="ghost"
                            className="w-full justify-start h-12"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            Privacy Policy
                          </Button>
                          <Button
                            onClick={() => navigate('/about')}
                            variant="ghost"
                            className="w-full justify-start h-12"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            About Myotopia
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="support" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-foreground text-base">Support</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button
                            onClick={() => navigate('/support')}
                            variant="outline"
                            className="w-full justify-start h-12"
                          >
                            <HelpCircle className="w-4 h-4 mr-3" />
                            Contact Support
                          </Button>
                          <div className="p-4 bg-muted/30 rounded-xl">
                            <h3 className="text-foreground font-medium text-sm mb-1">Quick Help</h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              For technical issues or questions, use Contact Support above.
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
    </PageTransition>
  );
};

export default Settings;
