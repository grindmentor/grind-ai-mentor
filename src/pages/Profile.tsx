import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Crown, Star, Calendar, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/contexts/UserDataContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import BasicInformation from '@/components/settings/BasicInformation';
import FitnessProfile from '@/components/settings/FitnessProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, currentTierData, subscriptionEnd, billingCycle } = useSubscription();
  const { userData, updateUserData } = useUserData();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [preferences, setPreferences] = useState({
    weight_unit: 'lbs',
    height_unit: 'ft-in'
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('weight_unit, height_unit')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setPreferences({
          weight_unit: data.weight_unit || 'lbs',
          height_unit: data.height_unit || 'ft-in'
        });
      }
    };
    
    loadPreferences();
  }, [user?.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'from-purple-500 to-pink-500';
      case 'basic': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return Crown;
      case 'basic': return Star;
      default: return User;
    }
  };

  // Use the exact age from userData context (already calculated with full birthdate)
  const calculatedAge = userData.age;

  // Profile data for BasicInformation component
  const profileData = {
    weight: userData.weight?.toString() || '',
    birthday: userData.birthday || '',
    height: userData.height?.toString() || '',
    heightFeet: '',
    heightInches: '',
    experience: userData.experience || '',
    activity: userData.activity || '',
    goal: userData.goal || ''
  };

  // Profile data for FitnessProfile component
  const fitnessProfileData = {
    experience: userData.experience || '',
    activity: userData.activity || '',
    goal: userData.goal || ''
  };

  // Handle input changes
  const handleInputChange = async (field: string, value: string) => {
    try {
      if (!user?.id) return;
      
      // Update local state
      await updateUserData({ [field]: value });
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle weight changes with unit conversion
  const handleWeightChange = (value: string) => {
    handleInputChange('weight', value);
  };

  // Handle height changes with unit conversion
  const handleHeightChange = (value: string) => {
    handleInputChange('height', value);
  };

  // Get weight display with unit
  const getWeightDisplay = () => {
    return userData.weight ? `${userData.weight}` : '';
  };

  // Get height display with unit
  const getHeightDisplay = () => {
    return userData.height ? `${userData.height}` : '';
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'basic', label: 'Basic Info' },
    { id: 'fitness', label: 'Fitness' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header - Mobile optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6 px-2 sm:px-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors w-fit min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Profile
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
              </div>
            </div>

            {/* Profile Tabs - Mobile optimized */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/40 backdrop-blur-sm mx-2 sm:mx-0 min-h-[48px]">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 p-3 text-sm font-medium min-h-[44px] touch-manipulation"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4 sm:space-y-6 mx-2 sm:mx-0">
                <TabsContent value="overview" className="mt-0 space-y-4 sm:space-y-6">
                  {/* Profile Overview */}
                  <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-orange-400" />
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Member since {formatDate(user?.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Status */}
                  <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        {React.createElement(getTierIcon(currentTier), { 
                          className: `w-5 h-5 mr-2 text-${getTierColor(currentTier).split('-')[1]}-400`
                        })}
                        Subscription Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Current Plan:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r ${getTierColor(currentTier)} text-white`}>
                          {currentTier.toUpperCase()}
                        </span>
                      </div>
                      
                      {currentTierData && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Monthly Price:</span>
                            <span className="text-white">${currentTierData.monthlyPrice}</span>
                          </div>
                          
                          {subscriptionEnd && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Next Billing:</span>
                              <span className="text-white">{formatDate(subscriptionEnd)}</span>
                            </div>
                          )}
                          
                          {billingCycle && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Billing Cycle:</span>
                              <span className="text-white capitalize">{billingCycle}</span>
                            </div>
                          )}
                        </>
                      )}

                      {currentTier === 'free' && (
                        <div className="pt-4 border-t border-gray-700/50">
                          <Button
                            onClick={() => navigate('/pricing')}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Fitness Stats with corrected age */}
                  {(userData.weight || userData.height || calculatedAge) && (
                    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {calculatedAge && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-400">{calculatedAge}</div>
                              <div className="text-sm text-gray-400">Years Old</div>
                            </div>
                          )}
                          {userData.weight && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-400">
                                {userData.weight}{preferences.weight_unit}
                              </div>
                              <div className="text-sm text-gray-400">Weight</div>
                            </div>
                          )}
                          {userData.height && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-400">
                                {userData.height}{preferences.height_unit === 'cm' ? 'cm' : '"'}
                              </div>
                              <div className="text-sm text-gray-400">Height</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="basic" className="mt-0">
                  <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-6">
                    <BasicInformation 
                      profile={profileData}
                      preferences={preferences}
                      calculatedAge={calculatedAge}
                      onInputChange={handleInputChange}
                      onWeightChange={handleWeightChange}
                      onHeightChange={handleHeightChange}
                      getWeightDisplay={getWeightDisplay}
                      getHeightDisplay={getHeightDisplay}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="fitness" className="mt-0">
                  <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-6">
                    <FitnessProfile 
                      profile={fitnessProfileData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
