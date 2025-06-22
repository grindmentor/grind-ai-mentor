
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AppPreferencesProps {
  preferences: {
    notifications: boolean;
    email_updates: boolean;
    dark_mode: boolean;
  };
  onPreferenceChange: (field: string, value: any) => Promise<void>;
}

const AppPreferences = ({ preferences, onPreferenceChange }: AppPreferencesProps) => {
  const { toast } = useToast();

  const handlePreferenceChange = async (field: string, value: boolean, label: string) => {
    try {
      await onPreferenceChange(field, value);
      toast({
        title: `${label} ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: `Error updating ${label.toLowerCase()}`,
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
            onCheckedChange={(checked) => handlePreferenceChange('notifications', checked, 'Notifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-foreground">Email Updates</Label>
            <p className="text-sm text-muted-foreground">Newsletter & progress reports</p>
          </div>
          <Switch 
            checked={preferences.email_updates}
            onCheckedChange={(checked) => handlePreferenceChange('email_updates', checked, 'Email updates')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-foreground">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">App theme preference</p>
          </div>
          <Switch 
            checked={preferences.dark_mode}
            onCheckedChange={(checked) => handlePreferenceChange('dark_mode', checked, 'Dark mode')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
