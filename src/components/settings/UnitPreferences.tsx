
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferences } from "@/contexts/PreferencesContext";

const UnitPreferences = () => {
  const { preferences, updatePreference } = usePreferences();

  const handleWeightUnitChange = async (value: 'kg' | 'lbs') => {
    try {
      await updatePreference('weight_unit', value);
    } catch (error) {
      console.error('Failed to update weight unit:', error);
    }
  };

  const handleHeightUnitChange = async (value: 'cm' | 'ft-in' | 'in') => {
    try {
      await updatePreference('height_unit', value);
    } catch (error) {
      console.error('Failed to update height unit:', error);
    }
  };

  return (
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
          <Select value={preferences.weight_unit} onValueChange={handleWeightUnitChange}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-foreground">Height Unit</Label>
          <Select value={preferences.height_unit} onValueChange={handleHeightUnitChange}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
              <SelectItem value="ft-in">Feet & Inches (5'10")</SelectItem>
              <SelectItem value="in">Inches only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitPreferences;
