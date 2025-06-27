
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Zap, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('units');

  const tabs = [
    { id: 'units', label: 'Units', icon: Globe },
    { id: 'app', label: 'App', icon: Zap },
    { id: 'ai', label: 'AI Memory', icon: Brain }
  ];

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
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Profile and fitness data can be edited in the <Button 
                    variant="link" 
                    onClick={() => navigate('/profile')} 
                    className="text-orange-400 hover:text-orange-300 p-0 h-auto font-normal text-xs sm:text-sm"
                  >
                    Profile tab
                  </Button>
                </p>
              </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className={`grid w-full grid-cols-3 bg-gray-900/40 backdrop-blur-sm mx-2 sm:mx-0 ${isMobile ? 'text-xs' : ''}`}>
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 p-2 sm:p-3"
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {!isMobile && tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-6 mx-2 sm:mx-0">
                <TabsContent value="units" className="mt-0">
                  <UnitPreferences />
                </TabsContent>

                <TabsContent value="app" className="mt-0">
                  <AppPreferences />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <AIMemoryReset />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
