
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
import { supabase } from "@/integrations/supabase/client";
import { convertKgToLbs, convertLbsToKg, convertCmToInches, convertInchesToCm, convertInchesToFeetAndInches, convertFeetAndInchesToInches } from "@/lib/unitConversions";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
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

  const [preferences, setPreferences] = useState({
    weightUnit: 'lbs' as 'kg' | 'lbs',
    heightUnit: 'ft-in' as 'cm' | 'ft-in' | 'in',
    notifications: true,
    emailUpdates: true,
    darkMode: true
  });

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

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

  // Update height display when unit changes
  useEffect(() => {
    if (profile.height) {
      const heightInInches = parseInt(profile.height);
      if (preferences.heightUnit === 'ft-in') {
        const { feet, inches } = convertInchesToFeetAndInches(heightInInches);
        setProfile(prev => ({
          ...prev,
          heightFeet: feet.toString(),
          heightInches: inches.toString()
        }));
      }
    }
  }, [preferences.heightUnit, profile.height]);

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

  const handleSave = async () => {
    if (!user) return;

    // Convert height to inches if using feet+inches
    let finalHeight = profile.height;
    if (preferences.heightUnit === 'ft-in' && profile.heightFeet && profile.heightInches) {
      finalHeight = convertFeetAndInchesToInches(
        parseInt(profile.heightFeet), 
        parseInt(profile.heightInches)
      ).toString();
    }

    const { error } = await supabase
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

    if (error) {
      console.error('Error saving profile:', error);
      alert('Error saving settings. Please try again.');
    } else {
      alert('Settings saved successfully!');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return '';
    const weightInLbs = parseInt(profile.weight);
    return preferences.weightUnit === 'kg' 
      ? Math.round(convertLbsToKg(weightInLbs)).toString()
      : weightInLbs.toString();
  };

  const getHeightDisplay = () => {
    if (!profile.height) return '';
    const heightInInches = parseInt(profile.height);
    if (preferences.heightUnit === 'cm') {
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
    const weightInLbs = preferences.weightUnit === 'kg' 
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
    const heightInInches = preferences.heightUnit === 'cm' 
      ? Math.round(convertCmToInches(numValue))
      : numValue;
    
    handleInputChange('height', heightInInches.toString());
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400">Update your profile and preferences</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="text-white border-gray-700 hover:bg-gray-800">
            Sign Out
          </Button>
        </div>

        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Changes will be applied to all AI recommendations
        </Badge>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Unit Preferences */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Unit Preferences</CardTitle>
              <CardDescription className="text-gray-400">
                Choose your preferred units for measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Weight Unit</Label>
                <Select value={preferences.weightUnit} onValueChange={(value: 'kg' | 'lbs') => handlePreferenceChange('weightUnit', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Height Unit</Label>
                <Select value={preferences.heightUnit} onValueChange={(value: 'cm' | 'ft-in' | 'in') => handlePreferenceChange('heightUnit', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="ft-in">Feet & Inches (5'10")</SelectItem>
                    <SelectItem value="in">Inches only</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">App Preferences</CardTitle>
              <CardDescription className="text-gray-400">
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Receive workout reminders</p>
                </div>
                <Switch 
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Email Updates</Label>
                  <p className="text-sm text-gray-400">Newsletter & progress reports</p>
                </div>
                <Switch 
                  checked={preferences.emailUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange('emailUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Dark Mode</Label>
                  <p className="text-sm text-gray-400">App theme preference</p>
                </div>
                <Switch 
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-gray-400">
                Your physical stats for accurate calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Weight ({preferences.weightUnit})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={preferences.weightUnit === 'kg' ? '80' : '180'}
                  value={getWeightDisplay()}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-white">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {calculatedAge !== null && (
                  <p className="text-sm text-gray-400">Current age: {calculatedAge} years</p>
                )}
              </div>
              
              {preferences.heightUnit === 'ft-in' ? (
                <div className="space-y-2">
                  <Label className="text-white">Height</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="5"
                        value={profile.heightFeet}
                        onChange={(e) => handleInputChange('heightFeet', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Label className="text-xs text-gray-400">feet</Label>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="10"
                        value={profile.heightInches}
                        onChange={(e) => handleInputChange('heightInches', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Label className="text-xs text-gray-400">inches</Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">
                    Height ({preferences.heightUnit})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={preferences.heightUnit === 'cm' ? '175' : '70'}
                    value={getHeightDisplay()}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fitness Profile */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Fitness Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Your experience and goals for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Experience Level</Label>
                <Select value={profile.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-4 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Activity Level</Label>
                <Select value={profile.activity} onValueChange={(value) => handleInputChange('activity', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                    <SelectItem value="very">Very active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra">Extra active (2x/day, intense)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Primary Goal</Label>
                <Select value={profile.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                    <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <Button 
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
