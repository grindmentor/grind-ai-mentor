
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Crown, Star, Calendar, Mail, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/contexts/UserDataContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import BasicInformation from '@/components/settings/BasicInformation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TabContentSkeleton } from '@/components/ui/tab-content-skeleton';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, currentTierData, subscriptionEnd, billingCycle } = useSubscription();
  const { userData, updateUserData } = useUserData();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [preferences, setPreferences] = useState({
    weight_unit: 'lbs',
    height_unit: 'ft-in'
  });

  // Handle tab change with transition
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTabTransitioning(false);
    }, 150);
  };

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('weight_unit, height_unit')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data && !error) {
          setPreferences({
            weight_unit: data.weight_unit || 'lbs',
            height_unit: data.height_unit || 'ft-in'
          });
        }
      } finally {
        setIsLoading(false);
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
      
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return Crown;
      
      default: return User;
    }
  };

  // Calculate exact age from birthday - FIXED calculation
  const calculateExactAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Subtract 1 if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculatedAge = userData.birthday 
    ? calculateExactAge(userData.birthday)
    : null;

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

  // Handle manage subscription
  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Failed to open subscription management');
        return;
      }
      
      if (data?.url) {
        // Open in new tab to avoid losing app state
        window.open(data.url, '_blank');
        toast.success('Opening subscription management...');
      }
    } catch (error) {
      console.error('Error invoking customer portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'info', label: 'Basic Info' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="p-2 h-10 w-10 rounded-full hover:bg-muted"
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Profile
                </h1>
                <p className="text-muted-foreground text-sm">Manage your account</p>
              </div>
            </div>

            {/* Profile Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4">
                {isLoading || isTabTransitioning ? (
                  <TabContentSkeleton variant="profile" />
                ) : (
                  <>
                    <TabsContent value="overview" className="mt-0 space-y-4 animate-fade-in">
                      {/* Profile Overview */}
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-foreground flex items-center text-base">
                            <User className="w-5 h-5 mr-2 text-primary" />
                            Account
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground text-sm">{user?.email}</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground text-sm">
                              Member since {formatDate(user?.created_at)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Subscription Status */}
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-foreground flex items-center text-base">
                            {React.createElement(getTierIcon(currentTier), { 
                              className: "w-5 h-5 mr-2 text-primary"
                            })}
                            Subscription
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                            <span className="text-muted-foreground text-sm">Plan</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              currentTier === 'premium' 
                                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {currentTier.toUpperCase()}
                            </span>
                          </div>
                      
                          {currentTierData && (
                            <>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                <span className="text-muted-foreground text-sm">Price</span>
                                <span className="text-foreground font-medium">${currentTierData.monthlyPrice}/mo</span>
                              </div>
                          
                              {subscriptionEnd && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                                  <span className="text-muted-foreground text-sm">Next Billing</span>
                                  <span className="text-foreground">{formatDate(subscriptionEnd)}</span>
                                </div>
                              )}
                            </>
                          )}

                          {currentTier === 'free' && (
                            <div className="pt-2">
                              <Button
                                onClick={() => navigate('/pricing')}
                                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                              >
                                Upgrade to Premium
                              </Button>
                            </div>
                          )}

                          {currentTier === 'premium' && (
                            <div className="pt-2 space-y-2">
                              <Button
                                onClick={handleManageSubscription}
                                disabled={isManagingSubscription}
                                variant="outline"
                                className="w-full"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                {isManagingSubscription ? 'Opening...' : 'Manage Subscription'}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Fitness Stats */}
                      {(userData.weight || userData.height || calculatedAge) && (
                        <Card className="bg-card border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-foreground text-base">Stats</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                              {calculatedAge && (
                                <div className="text-center p-3 rounded-xl bg-muted/30">
                                  <div className="text-xl font-bold text-primary">{calculatedAge}</div>
                                  <div className="text-xs text-muted-foreground">Age</div>
                                </div>
                              )}
                              {userData.weight && (
                                <div className="text-center p-3 rounded-xl bg-muted/30">
                                  <div className="text-xl font-bold text-primary">
                                    {userData.weight}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{preferences.weight_unit}</div>
                                </div>
                              )}
                              {userData.height && (
                                <div className="text-center p-3 rounded-xl bg-muted/30">
                                  <div className="text-xl font-bold text-primary">
                                    {userData.height}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{preferences.height_unit === 'cm' ? 'cm' : 'in'}</div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="info" className="mt-0 animate-fade-in">
                      <Card className="bg-card border-border">
                        <CardContent className="pt-6">
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
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
