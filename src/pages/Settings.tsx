
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BasicInformation from "@/components/settings/BasicInformation";
import FitnessProfile from "@/components/settings/FitnessProfile";
import UnitPreferences from "@/components/settings/UnitPreferences";
import AppPreferences from "@/components/settings/AppPreferences";
import AIMemoryReset from "@/components/settings/AIMemoryReset";
import { UserDataProvider } from "@/contexts/UserDataContext";

const SettingsContent = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { preferences } = usePreferences();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Local state for form data
  const [profile, setProfile] = useState({
    weight: '',
    birthday: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    experience: '',
    activity: '',
    goal: ''
  });

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && preferences) {
      loadUserProfile();
    }
  }, [user, preferences]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        console.log('Settings: userData loaded', profileData);
        
        // Calculate age if birthday exists
        let age = null;
        if (profileData.birthday) {
          const today = new Date();
          const birthDate = new Date(profileData.birthday);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
        setCalculatedAge(age);

        // Convert weight from lbs to preferred unit
        let weight = profileData.weight;
        if (weight && preferences.weight_unit === 'kg') {
          weight = Math.round(weight * 0.453592);
        }

        // Convert height from inches to preferred unit
        let height = profileData.height;
        if (height && preferences.height_unit === 'cm') {
          height = Math.round(height * 2.54);
        }

        // Set profile data
        setProfile({
          weight: weight?.toString() || '',
          birthday: profileData.birthday || '',
          height: height?.toString() || '',
          heightFeet: '',
          heightInches: '',
          experience: profileData.experience || '',
          activity: profileData.activity || '',
          goal: profileData.goal || ''
        });

        // Convert height to feet/inches if using ft-in unit
        if (profileData.height && preferences.height_unit === 'ft-in') {
          const totalInches = profileData.height;
          const feet = Math.floor(totalInches / 12);
          const inches = totalInches % 12;
          setProfile(prev => ({
            ...prev,
            heightFeet: feet.toString(),
            heightInches: inches.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    console.log('Settings: handleInputChange', field, value);
    setProfile(prev => ({ ...prev, [field]: value }));

    // Save to database for specific fields
    if (['experience', 'activity', 'goal', 'birthday'].includes(field)) {
      try {
        await supabase
          .from('profiles')
          .update({ [field]: value })
          .eq('id', user?.id);
        
        console.log('Settings: Field saved successfully', field);
        
        // Recalculate age if birthday changed
        if (field === 'birthday' && value) {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          setCalculatedAge(age);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleWeightChange = async (value: string) => {
    console.log('Settings: handleWeightChange', value);
    setProfile(prev => ({ ...prev, weight: value }));
    
    if (value && user) {
      try {
        // Convert to lbs for storage (database stores in lbs)
        let weightInLbs = parseFloat(value);
        if (preferences?.weight_unit === 'kg') {
          weightInLbs = weightInLbs * 2.20462;
        }

        await supabase
          .from('profiles')
          .update({ weight: Math.round(weightInLbs) })
          .eq('id', user.id);
        
        console.log('Settings: Weight saved successfully');
      } catch (error) {
        console.error('Error saving weight:', error);
        toast({
          title: "Error",
          description: "Failed to save weight. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleHeightChange = async (value: string) => {
    console.log('Settings: handleHeightChange', value);
    setProfile(prev => ({ ...prev, height: value }));
    
    if (value && user) {
      try {
        // Convert to inches for storage (database stores in inches)
        let heightInInches = parseFloat(value);
        if (preferences?.height_unit === 'cm') {
          heightInInches = heightInInches / 2.54;
        }

        await supabase
          .from('profiles')
          .update({ height: Math.round(heightInInches) })
          .eq('id', user.id);
        
        console.log('Settings: Height saved successfully');
      } catch (error) {
        console.error('Error saving height:', error);
        toast({
          title: "Error",
          description: "Failed to save height. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return '';
    return profile.weight;
  };

  const getHeightDisplay = () => {
    if (!profile.height) return '';
    return profile.height;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center ios-safe-area">
        <div className="text-xl">Loading preferences...</div>
      </div>
    );
  }

  // Debug output
  console.log('Settings: Rendering with', {
    user: !!user,
    preferences: !!preferences,
    profile
  });

  return (
    <div className="min-h-screen bg-black text-white ios-safe-area">
      <div className="p-4 sm:p-6" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 1rem, 2rem)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header with proper mobile spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')} 
                className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit min-h-[48px] px-4"
                style={{ marginTop: isMobile ? '1rem' : '0' }}
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
            <BasicInformation 
              profile={profile}
              preferences={preferences}
              calculatedAge={calculatedAge}
              onInputChange={handleInputChange}
              onWeightChange={handleWeightChange}
              onHeightChange={handleHeightChange}
              getWeightDisplay={getWeightDisplay}
              getHeightDisplay={getHeightDisplay}
            />
            <FitnessProfile 
              profile={profile}
              onInputChange={handleInputChange}
            />
            <UnitPreferences />
            <AppPreferences />
            <AIMemoryReset />
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <UserDataProvider>
      <SettingsContent />
    </UserDataProvider>
  );
};

export default Settings;
