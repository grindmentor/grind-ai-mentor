
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const AppPreferences = () => {
  const { preferences, updatePreference } = usePreferences();

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Smartphone className="w-5 h-5 mr-2 text-orange-500" />
          App Preferences
        </CardTitle>
        <CardDescription className="text-gray-400">
          Customize your app experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Email Updates</p>
            <p className="text-sm text-gray-400">Receive email notifications and updates</p>
          </div>
          <Switch
            checked={preferences.email_updates}
            onCheckedChange={(checked) => updatePreference('email_updates', checked)}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Push Notifications</p>
            <p className="text-sm text-gray-400">Receive daily workout reminders</p>
          </div>
          <Switch
            checked={preferences.notifications}
            onCheckedChange={(checked) => updatePreference('notifications', checked)}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
