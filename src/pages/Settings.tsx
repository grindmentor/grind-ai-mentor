import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { supabase } from "@/integrations/supabase/client";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertInchesToFeetAndInches, convertFeetAndInchesToInches } from "@/lib/unitConversions";
import { useToast } from "@/hooks/use-toast";
import UnitPreferences from "@/components/settings/UnitPreferences";
import AppPreferences from "@/components/settings/AppPreferences";
import BasicInformation from "@/components/settings/BasicInformation";
import FitnessProfile from "@/components/settings/FitnessProfile";
import SubscriptionManager from "@/components/subscription/SubscriptionManager";
import UpgradeSection from "@/components/dashboard/UpgradeSection";
import { SoundButton } from "@/components/SoundButton";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { preferences } = usePreferences();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [profile, setProfile] = useState({
    weight: '',
    birthday: '',
    height: '',
    experience: '',
    activity: '',
    goal: '',
    heightFeet: '',
    heightInches: '',
    displayName: ''
  });

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile.birthday) {
      const today = new Date();
      const birthDate = new Date(profile.birthday);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setCalculatedAge(age - 1);
      } else {
        setCalculatedAge(age);
      }
    }
  }, [profile.birthday]);

  useEffect(() => {
    if (preferences.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.dark_mode]);

  useEffect(() => {
    if (profile.height && preferences.height_unit === 'ft-in') {
      const heightInInches = parseFloat(profile.height);
      if (!isNaN(heightInInches) && heightInInches > 0) {
        const { feet, inches } = convertInchesToFeetAndInches(heightInInches);
        setProfile(prev => ({
          ...prev,
          heightFeet: feet.toString(),
          heightInches: inches.toString()
        }));
      }
    }
  }, [preferences.height_unit, profile.height]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        console.log('Loaded profile data:', data);
        setProfile({
          weight: data.weight?.toString() || '',
          birthday: data.birthday || '',
          height: data.height?.toString() || '',
          experience: data.experience || '',
          activity: data.activity || '',
          goal: data.goal || '',
          heightFeet: '',
          heightInches: '',
          displayName: data.display_name || ''
        });
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let finalHeight = profile.height;
      if (preferences.height_unit === 'ft-in' && profile.heightFeet && profile.heightInches) {
        const feet = parseInt(profile.heightFeet) || 0;
        const inches = parseFloat(profile.heightInches) || 0;
        finalHeight = convertFeetAndInchesToInches(feet, inches).toString();
      }

      const profileData: any = {
        weight: null,
        birthday: profile.birthday || null,
        height: null,
        experience: profile.experience || null,
        activity: profile.activity || null,
        goal: profile.goal || null,
        display_name: profile.displayName || null
      };

      if (profile.weight && !isNaN(parseFloat(profile.weight)) && parseFloat(profile.weight) > 0) {
        profileData.weight = parseFloat(profile.weight);
      }

      if (finalHeight && !isNaN(parseFloat(finalHeight)) && parseFloat(finalHeight) > 0) {
        profileData.height = parseFloat(finalHeight);
      }

      console.log('Saving profile data:', profileData);

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            ...profileData
          });

        if (profileError) {
          console.error('Profile insert error:', profileError);
          throw profileError;
        }
      }

      toast({
        title: "Settings saved successfully!",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return '';
    const weightInLbs = parseFloat(profile.weight);
    if (isNaN(weightInLbs) || weightInLbs <= 0) return '';
    return preferences.weight_unit === 'kg' 
      ? Math.round(convertLbsToKg(weightInLbs)).toString()
      : weightInLbs.toString();
  };

  const getHeightDisplay = () => {
    if (!profile.height) return '';
    const heightInInches = parseFloat(profile.height);
    if (isNaN(heightInInches) || heightInInches <= 0) return '';
    if (preferences.height_unit === 'cm') {
      return Math.round(convertInchesToCm(heightInInches)).toString();
    }
    return heightInInches.toString();
  };

  const handleWeightChange = (value: string) => {
    if (!value) {
      handleInputChange('weight', '');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    const weightInLbs = preferences.weight_unit === 'kg' 
      ? convertKgToLbs(numValue)
      : numValue;
    
    handleInputChange('weight', weightInLbs.toString());
  };

  const handleHeightChange = (value: string) => {
    if (!value) {
      handleInputChange('height', '');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    const heightInInches = preferences.height_unit === 'cm' 
      ? convertCmToInches(numValue)
      : numValue;
    
    handleInputChange('height', heightInInches.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className="flex items-center space-x-4">
            <SoundButton 
              variant="ghost" 
              onClick={() => navigate('/app')} 
              className="hover:bg-accent"
              soundType="click"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </SoundButton>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Settings</h1>
                <p className="text-muted-foreground">Update your profile and preferences</p>
              </div>
            </div>
          </div>
          {!isMobile && (
            <SoundButton 
              variant="outline" 
              onClick={handleSignOut} 
              className="border-border hover:bg-accent text-foreground"
              soundType="click"
            >
              Sign Out
            </SoundButton>
          )}
        </div>

        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Unit preferences are saved automatically
        </Badge>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
          <SubscriptionManager />
          <UnitPreferences />
          <AppPreferences />
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
        </div>

        {/* Upgrade Section */}
        <div className="mt-8">
          <UpgradeSection />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <SoundButton 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              soundType="success"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Profile'}
            </SoundButton>
          </CardContent>
        </Card>

        {isMobile && (
          <div className="pt-6">
            <SoundButton 
              variant="outline" 
              onClick={handleSignOut} 
              className="w-full border-border hover:bg-accent text-foreground"
              soundType="click"
            >
              Sign Out
            </SoundButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
