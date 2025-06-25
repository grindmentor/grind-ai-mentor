
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BasicInformation from "@/components/settings/BasicInformation";
import FitnessProfile from "@/components/settings/FitnessProfile";
import UnitPreferences from "@/components/settings/UnitPreferences";
import AppPreferences from "@/components/settings/AppPreferences";
import AIMemoryReset from "@/components/settings/AIMemoryReset";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white ios-safe-area">
      <div className="p-4 sm:p-6" style={{ paddingTop: 'max(env(safe-area-inset-top) + 1rem, 2rem)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header with proper mobile spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')} 
                className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit min-h-[48px] px-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
                  <p className="text-gray-400">Customize your GrindMentor experience</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/support')} 
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 w-fit min-h-[48px]"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Support
            </Button>
          </div>

          {/* Settings Sections */}
          <div className="grid gap-6 lg:gap-8">
            <BasicInformation />
            <FitnessProfile />
            <UnitPreferences />
            <AppPreferences />
            <AIMemoryReset />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
