
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AppPreferencesProps {
  preferences: {
    notifications: boolean;
    email_updates: boolean;
    dark_mode: boolean;
  };
  onPreferenceChange: (field: string, value: any) => void;
}

const AppPreferences = ({ preferences, onPreferenceChange }: AppPreferencesProps) => {
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
            onCheckedChange={(checked) => onPreferenceChange('notifications', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-foreground">Email Updates</Label>
            <p className="text-sm text-muted-foreground">Newsletter & progress reports</p>
          </div>
          <Switch 
            checked={preferences.email_updates}
            onCheckedChange={(checked) => onPreferenceChange('email_updates', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-foreground">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">App theme preference</p>
          </div>
          <Switch 
            checked={preferences.dark_mode}
            onCheckedChange={(checked) => onPreferenceChange('dark_mode', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
