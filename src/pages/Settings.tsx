import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Zap, Brain, FileText, HelpCircle, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import DisplayNameSection from '@/components/settings/DisplayNameSection';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { TabContentSkeleton } from '@/components/ui/tab-content-skeleton';
import { cn } from '@/lib/utils';

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
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'support', label: 'Help', icon: HelpCircle }
  ];

  const handleLogout = async () => {
    try {
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
        <div className="px-4 py-4 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header - Compact */}
            <div className="flex items-center gap-3 mb-5">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="p-2 h-10 w-10 rounded-full hover:bg-muted"
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Settings
                </h1>
                <p className="text-muted-foreground text-xs">Customize your preferences</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-destructive hover:bg-destructive/10 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-6 bg-muted/40 rounded-xl p-1 h-auto gap-0.5">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className={cn(
                      "rounded-lg py-2 px-1 transition-all duration-150",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                      "flex flex-col items-center gap-1"
                    )}
                  >
                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[9px] font-medium truncate">{tab.label}</span>
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
                    <TabsContent value="profile" className="mt-0 fade-in-up">
                      <DisplayNameSection 
                        displayName={displayName} 
                        onDisplayNameChange={setDisplayName} 
                      />
                    </TabsContent>

                    <TabsContent value="units" className="mt-0 fade-in-up">
                      <Card className="bg-card/60 border-border/50">
                        <CardContent className="p-4">
                          <UnitPreferences />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="app" className="mt-0 fade-in-up">
                      <Card className="bg-card/60 border-border/50">
                        <CardContent className="p-4">
                          <AppPreferences />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0 fade-in-up">
                      <Card className="bg-card/60 border-border/50">
                        <CardContent className="p-4">
                          <AIMemoryReset />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="legal" className="mt-0 fade-in-up">
                      <Card className="bg-card/60 border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-foreground text-sm font-semibold">Legal</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-1">
                          <Button
                            onClick={() => navigate('/terms')}
                            variant="ghost"
                            className="w-full justify-start h-11 text-sm"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            Terms of Service
                          </Button>
                          <Button
                            onClick={() => navigate('/privacy')}
                            variant="ghost"
                            className="w-full justify-start h-11 text-sm"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            Privacy Policy
                          </Button>
                          <Button
                            onClick={() => navigate('/about')}
                            variant="ghost"
                            className="w-full justify-start h-11 text-sm"
                          >
                            <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                            About Myotopia
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="support" className="mt-0 fade-in-up">
                      <Card className="bg-card/60 border-border/50">
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-foreground text-sm font-semibold">Support</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                          <Button
                            onClick={() => navigate('/support')}
                            variant="outline"
                            className="w-full justify-start h-11 text-sm"
                          >
                            <HelpCircle className="w-4 h-4 mr-3" />
                            Contact Support
                          </Button>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <h3 className="text-foreground font-medium text-xs mb-1">Quick Help</h3>
                            <p className="text-muted-foreground text-[11px] leading-relaxed">
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
