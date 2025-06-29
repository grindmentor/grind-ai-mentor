import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import BasicInformation from '@/components/settings/BasicInformation';
import FitnessProfile from '@/components/settings/FitnessProfile';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import PrimaryGoalSelector from '@/components/settings/PrimaryGoalSelector';

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Customize your Myotopia experience</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            <BasicInformation />
            <FitnessProfile />
            <PrimaryGoalSelector />
            <UnitPreferences />
            <AppPreferences />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
