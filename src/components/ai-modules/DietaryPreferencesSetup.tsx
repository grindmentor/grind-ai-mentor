import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { useDietaryPreferences, dietTypeConfig, DietaryPreferences } from '@/hooks/useDietaryPreferences';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DietaryPreferencesSetupProps {
  onComplete: () => void;
  showSkip?: boolean;
}

type DietType = keyof typeof dietTypeConfig;

export const DietaryPreferencesSetup: React.FC<DietaryPreferencesSetupProps> = ({ 
  onComplete, 
  showSkip = true 
}) => {
  const { preferences, savePreferences, isSaving } = useDietaryPreferences();
  const [step, setStep] = useState<'diet' | 'allergies' | 'macros'>('diet');
  
  // Local state for form
  const [dietType, setDietType] = useState<string>(preferences.diet_type || 'balanced');
  const [allergies, setAllergies] = useState<string[]>(preferences.allergies || []);
  const [dislikes, setDislikes] = useState<string[]>(preferences.dislikes || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [targetCalories, setTargetCalories] = useState<string>(
    preferences.target_calories?.toString() || ''
  );
  const [targetProtein, setTargetProtein] = useState<string>(
    preferences.target_protein?.toString() || ''
  );

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const handleComplete = async () => {
    const updates: Partial<DietaryPreferences> = {
      diet_type: dietType,
      allergies,
      dislikes,
      target_calories: targetCalories ? parseInt(targetCalories) : null,
      target_protein: targetProtein ? parseInt(targetProtein) : null,
      setup_completed: true,
    };

    const success = await savePreferences(updates);
    if (success) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    await savePreferences({ setup_completed: true });
    onComplete();
  };

  // Common allergy quick-add buttons
  const commonAllergies = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy'];

  return (
    <div className="space-y-6">
      {step === 'diet' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Choose Your Style</h2>
            <p className="text-sm text-muted-foreground mt-1">
              What type of meals do you usually want?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(Object.entries(dietTypeConfig) as [DietType, typeof dietTypeConfig[DietType]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setDietType(key)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                  dietType === key
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={() => setStep('allergies')} className="w-full mt-4" size="lg">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      )}

      {step === 'allergies' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Allergies & Dislikes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We'll always avoid these in your meals
            </p>
          </div>

          {/* Allergies */}
          <div className="space-y-3">
            <Label className="text-sm">Allergies (must avoid)</Label>
            
            {/* Quick add buttons */}
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map(allergy => (
                <button
                  key={allergy}
                  onClick={() => {
                    if (!allergies.includes(allergy)) {
                      setAllergies([...allergies, allergy]);
                    }
                  }}
                  disabled={allergies.includes(allergy)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-colors",
                    allergies.includes(allergy)
                      ? "bg-destructive/20 border-destructive/30 text-destructive"
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  )}
                >
                  {allergy}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add other allergy..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                className="flex-1"
              />
              <Button onClick={handleAddAllergy} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map(allergy => (
                  <Badge key={allergy} variant="destructive" className="gap-1">
                    {allergy}
                    <button onClick={() => setAllergies(allergies.filter(a => a !== allergy))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Dislikes */}
          <div className="space-y-3">
            <Label className="text-sm">Foods you dislike (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                placeholder="e.g., mushrooms, cilantro..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddDislike()}
                className="flex-1"
              />
              <Button onClick={handleAddDislike} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {dislikes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dislikes.map(dislike => (
                  <Badge key={dislike} variant="secondary" className="gap-1">
                    {dislike}
                    <button onClick={() => setDislikes(dislikes.filter(d => d !== dislike))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setStep('diet')} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep('macros')} className="flex-1">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'macros' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Daily Targets (Optional)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Leave blank to use your TDEE or calculate from your profile
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Daily Calories</Label>
              <Input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder="e.g., 2000"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Daily Protein (g)</Label>
              <Input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(e.target.value)}
                placeholder="e.g., 150"
                className="h-12"
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can always change these in Settings later
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setStep('allergies')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleComplete} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Done
                </>
              )}
            </Button>
          </div>

          {showSkip && (
            <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
              Skip for now
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DietaryPreferencesSetup;
