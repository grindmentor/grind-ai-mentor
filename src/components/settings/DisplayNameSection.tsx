
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DisplayNameSectionProps {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
}

const DisplayNameSection = ({ displayName, onDisplayNameChange }: DisplayNameSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState(displayName);

  const handleUpdate = async () => {
    if (!user || !tempDisplayName.trim()) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: tempDisplayName.trim() })
        .eq('id', user.id);

      if (error) throw error;

      onDisplayNameChange(tempDisplayName.trim());
      toast({
        title: "Display name updated!",
        description: "Your display name has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        title: "Error updating display name",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>How others will see your name</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={tempDisplayName}
            onChange={(e) => setTempDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleUpdate}
          disabled={isUpdating || tempDisplayName === displayName}
          className="w-full"
        >
          {isUpdating ? 'Updating...' : 'Update Display Name'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DisplayNameSection;
