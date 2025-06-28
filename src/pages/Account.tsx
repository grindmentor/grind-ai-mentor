
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Save, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SubscriptionManager from "@/components/subscription/SubscriptionManager";

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentTier } = useSubscription();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: user?.email || '',
    joinDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          displayName: data.display_name || '',
          email: user.email || '',
          joinDate: new Date(user.created_at).toLocaleDateString()
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Account updated successfully!",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Error saving account",
        description: "Please try again.",
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
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Account</h1>
                <p className="text-muted-foreground">Manage your account information</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-accent text-foreground">
            Sign Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={profile.displayName}
                  onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input
                  value={profile.joinDate}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>

              <div className="pt-4">
                <Label className="text-foreground">Current Plan</Label>
                <div className="mt-2">
                  <Badge className={currentTier === 'free' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}>
                    {currentTier === 'free' ? 'Free Plan' : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <SubscriptionManager />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Account Information'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
