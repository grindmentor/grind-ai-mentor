
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const UnitPreferences = () => {
  const { preferences, updatePreference } = usePreferences();

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings2 className="w-5 h-5 mr-2 text-orange-500" />
          Unit Preferences
        </CardTitle>
        <CardDescription>
          Choose your preferred units for measurements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Weight Unit
            </label>
            <Select value={preferences.weight_unit} onValueChange={(value) => updatePreference('weight_unit', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="lbs" className="text-white hover:bg-gray-700">Pounds (lbs)</SelectItem>
                <SelectItem value="kg" className="text-white hover:bg-gray-700">Kilograms (kg)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Height Unit
            </label>
            <Select value={preferences.height_unit} onValueChange={(value) => updatePreference('height_unit', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="ft-in" className="text-white hover:bg-gray-700">Feet & Inches</SelectItem>
                <SelectItem value="cm" className="text-white hover:bg-gray-700">Centimeters (cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitPreferences;
