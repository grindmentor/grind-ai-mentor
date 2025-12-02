
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Zap, Brain, FileText, HelpCircle, LogOut } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6 px-2 sm:px-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Customize your app preferences</p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center justify-between mb-4">
              <div></div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
              <TabsList className={`grid w-full grid-cols-5 bg-gray-900/40 backdrop-blur-sm mx-2 sm:mx-0 ${isMobile ? 'text-xs' : ''}`}>
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 p-2 sm:p-3 transition-all duration-200"
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {!isMobile && tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-6 mx-2 sm:mx-0">
                {isTabTransitioning ? (
                  <TabContentSkeleton variant="settings" />
                ) : (
                  <>
                    <TabsContent value="units" className="mt-0 animate-fade-in">
                      <UnitPreferences />
                    </TabsContent>

                    <TabsContent value="app" className="mt-0 animate-fade-in">
                      <AppPreferences />
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0 animate-fade-in">
                      <AIMemoryReset />
                    </TabsContent>

                    <TabsContent value="legal" className="mt-0 animate-fade-in">
                  <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Legal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={() => navigate('/terms')}
                        variant="outline"
                        className="w-full justify-start text-white border-gray-600 hover:bg-gray-800/50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Terms of Service
                      </Button>
                      <Button
                        onClick={() => navigate('/privacy')}
                        variant="outline"
                        className="w-full justify-start text-white border-gray-600 hover:bg-gray-800/50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Privacy Policy
                      </Button>
                      <Button
                        onClick={() => navigate('/about')}
                        variant="outline"
                        className="w-full justify-start text-white border-gray-600 hover:bg-gray-800/50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        About Myotopia
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                    <TabsContent value="support" className="mt-0 animate-fade-in">
                      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                        <CardHeader>
                          <CardTitle className="text-white">Support</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button
                            onClick={() => navigate('/support')}
                            variant="outline"
                            className="w-full justify-start text-white border-gray-600 hover:bg-gray-800/50"
                          >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Contact Support
                          </Button>
                          <div className="p-4 bg-gray-800/30 rounded-lg">
                            <h3 className="text-white font-medium mb-2">Quick Help</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              For technical issues, account questions, or feature requests, 
                              use the Contact Support button above to reach our team.
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
