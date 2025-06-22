import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { supabase } from "@/integrations/supabase/client";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertInchesToFeetAndInches, convertFeetAndInchesToInches } from "@/lib/unitConversions";
import { useToast } from "@/hooks/use-toast";

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
    heightInches: ''
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
        heightInches: ''
      });
    }
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
          {/* Unit Preferences */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Unit Preferences</CardTitle>
              <CardDescription>
                Choose your preferred units for measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Weight Unit</Label>
                <Select value={preferences.weight_unit} onValueChange={(value: 'kg' | 'lbs') => handlePreferenceChange('weight_unit', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Height Unit</Label>
                <Select value={preferences.height_unit} onValueChange={(value: 'cm' | 'ft-in' | 'in') => handlePreferenceChange('height_unit', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="ft-in">Feet & Inches (5'10")</SelectItem>
                    <SelectItem value="in">Inches only</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive workout reminders</p>
                </div>
                <Switch 
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Newsletter & progress reports</p>
                </div>
                <Switch 
                  checked={preferences.email_updates}
                  onCheckedChange={(checked) => handlePreferenceChange('email_updates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">App theme preference</p>
                </div>
                <Switch 
                  checked={preferences.dark_mode}
                  onCheckedChange={(checked) => handlePreferenceChange('dark_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
              <CardDescription>
                Your physical stats for accurate calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-foreground">
                  Weight ({preferences.weight_unit})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={preferences.weight_unit === 'kg' ? '80' : '180'}
                  value={getWeightDisplay()}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-foreground">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                {calculatedAge !== null && (
                  <p className="text-sm text-muted-foreground">Current age: {calculatedAge} years</p>
                )}
              </div>
              
              {preferences.height_unit === 'ft-in' ? (
                <div className="space-y-2">
                  <Label className="text-foreground">Height</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="5"
                        value={profile.heightFeet}
                        onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <Label className="text-xs text-muted-foreground">feet</Label>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="10"
                        value={profile.heightInches}
                        onChange={(e) => handleInputChange('heightInches', e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <Label className="text-xs text-muted-foreground">inches</Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">
                    Height ({preferences.height_unit})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={preferences.height_unit === 'cm' ? '175' : '70'}
                    value={getHeightDisplay()}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fitness Profile */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Fitness Profile</CardTitle>
              <CardDescription>
                Your experience and goals for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Experience Level</Label>
                <Select value={profile.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-4 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Activity Level</Label>
                <Select value={profile.activity} onValueChange={(value) => handleInputChange('activity', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                    <SelectItem value="very">Very active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra">Extra active (2x/day, intense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Primary Goal</Label>
                <Select value={profile.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                    <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
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
