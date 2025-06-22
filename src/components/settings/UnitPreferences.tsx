
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UnitPreferencesProps {
  preferences: {
    weight_unit: 'kg' | 'lbs';
    height_unit: 'cm' | 'ft-in' | 'in';
  };
  onPreferenceChange: (field: string, value: any) => Promise<void>;
}

const UnitPreferences = ({ preferences, onPreferenceChange }: UnitPreferencesProps) => {
  const { toast } = useToast();

  const handleWeightUnitChange = async (value: 'kg' | 'lbs') => {
    try {
      await onPreferenceChange('weight_unit', value);
      toast({
        title: "Weight unit updated",
        description: `Changed to ${value}`,
      });
    } catch (error) {
      toast({
        title: "Error updating weight unit",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHeightUnitChange = async (value: 'cm' | 'ft-in' | 'in') => {
    try {
      await onPreferenceChange('height_unit', value);
      toast({
        title: "Height unit updated",
        description: `Changed to ${value === 'ft-in' ? 'feet & inches' : value}`,
      });
    } catch (error) {
      toast({
        title: "Error updating height unit",
        description: "Please try again.",
        variant: "destructive",
      });
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
              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
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
              <SelectItem value="ft-in">Feet & Inches (5'10")</SelectItem>
              <SelectItem value="in">Inches only</SelectItem>
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitPreferences;
