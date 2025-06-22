
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
import DisplayNameSection from "@/components/settings/DisplayNameSection";
import SubscriptionManager from "@/components/subscription/SubscriptionManager";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();
  
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

  // Apply dark mode
  useEffect(() => {
    if (preferences.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.dark_mode]);

  // Update height display when unit changes
  useEffect(() => {
    if (profile.height && preferences.height_unit === 'ft-in') {
      const heightInInches = parseInt(profile.height);
      if (!isNaN(heightInInches)) {
        const { feet, inches } = convertInchesToFeetAndInches(heightInInches);
        setProfile(prev => ({
          ...prev,
          heightFeet: feet.toString(),
          heightInches: inches.toString()
        }));
      }
    }
  }, [preferences.height_unit]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data && !error) {
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
    }
  };

  const handleInputChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          weight_unit: preferences.weight_unit,
          height_unit: preferences.height_unit,
          notifications: preferences.notifications,
          email_updates: preferences.email_updates,
          dark_mode: preferences.dark_mode
        });

      if (error) {
        console.error('Error saving preferences:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Convert height to inches if using feet+inches
      let finalHeight = profile.height;
      if (preferences.height_unit === 'ft-in' && profile.heightFeet && profile.heightInches) {
        finalHeight = convertFeetAndInchesToInches(
          parseInt(profile.heightFeet), 
          parseInt(profile.heightInches)
        ).toString();
      }

      // Save profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          weight: profile.weight ? parseInt(profile.weight) : null,
          birthday: profile.birthday || null,
          height: finalHeight ? parseInt(finalHeight) : null,
          experience: profile.experience || null,
          activity: profile.activity || null,
          goal: profile.goal || null
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Save preferences
      await savePreferences();

      toast({
        title: "Settings saved successfully!",
        description: "Your profile and preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (field: keyof typeof preferences, value: any) => {
    updatePreferences({ [field]: value });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return '';
    const weightInLbs = parseInt(profile.weight);
    return preferences.weight_unit === 'kg' 
      ? Math.round(convertLbsToKg(weightInLbs)).toString()
      : weightInLbs.toString();
  };

  const getHeightDisplay = () => {
    if (!profile.height) return '';
    const heightInInches = parseInt(profile.height);
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
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const weightInLbs = preferences.weight_unit === 'kg' 
      ? Math.round(convertKgToLbs(numValue))
      : numValue;
    
    handleInputChange('weight', weightInLbs.toString());
  };

  const handleHeightChange = (value: string) => {
    if (!value) {
      handleInputChange('height', '');
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const heightInInches = preferences.height_unit === 'cm' 
      ? Math.round(convertCmToInches(numValue))
      : numValue;
    
    handleInputChange('height', heightInInches.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/app')} className="hover:bg-accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Update your profile and preferences</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-accent text-foreground">
            Sign Out
          </Button>
        </div>

        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Changes will be applied to all AI recommendations
        </Badge>

        <div className="grid lg:grid-cols-2 gap-6">
          <DisplayNameSection 
            displayName={profile.displayName}
            onDisplayNameChange={(value) => handleInputChange('displayName', value)}
          />

          <SubscriptionManager />

          <UnitPreferences 
            preferences={preferences} 
            onPreferenceChange={handlePreferenceChange} 
          />

          <AppPreferences 
            preferences={preferences} 
            onPreferenceChange={handlePreferenceChange} 
          />

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

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
