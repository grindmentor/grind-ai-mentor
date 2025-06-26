
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Dumbbell, Globe, Zap, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInformation from '@/components/settings/BasicInformation';
import FitnessProfile from '@/components/settings/FitnessProfile';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Profile', icon: User },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'units', label: 'Units', icon: Globe },
    { id: 'app', label: 'App', icon: Zap },
    { id: 'ai', label: 'AI Memory', icon: Brain }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400">Customize your fitness journey</p>
              </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className={`grid w-full grid-cols-5 bg-gray-900/40 backdrop-blur-sm ${isMobile ? 'text-xs' : ''}`}>
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30"
                  >
                    <tab.icon className="w-4 h-4 mr-1" />
                    {!isMobile && tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
                <TabsContent value="basic" className="mt-0">
                  <BasicInformation />
                </TabsContent>

                <TabsContent value="fitness" className="mt-0">
                  <FitnessProfile />
                </TabsContent>

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
