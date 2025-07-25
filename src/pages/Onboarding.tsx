
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: "",
    birthday: "",
    height: "",
    heightFeet: "",
    heightInches: "",
    experienceLevel: "",
    activityLevel: "",
    goal: "",
    weightUnit: "lbs" as 'kg' | 'lbs',
    heightUnit: "ft-in" as 'cm' | 'ft-in' | 'in'
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Convert to standard units before saving (lbs and inches)
      let weightInLbs = parseFloat(formData.weight);
      if (formData.weightUnit === 'kg') {
        weightInLbs = weightInLbs * 2.20462;
      }

      let heightInInches: number;
      if (formData.heightUnit === 'ft-in') {
        heightInInches = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches);
      } else if (formData.heightUnit === 'cm') {
        heightInInches = parseFloat(formData.height) / 2.54;
      } else {
        heightInInches = parseFloat(formData.height);
      }

      // Save data to profiles table
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            weight: Math.round(weightInLbs),
            birthday: formData.birthday,
            height: Math.round(heightInInches),
            experience: formData.experienceLevel,
            activity: formData.activityLevel,
            goal: formData.goal
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving profile:', error);
        }
      }
      navigate("/app");
    }
  };

  const getHeightValidation = () => {
    if (formData.heightUnit === 'ft-in') {
      return formData.heightFeet && formData.heightInches;
    }
    return formData.height;
  };

  const canProceedStep1 = formData.weight && formData.birthday && getHeightValidation();
  const canProceedStep2 = formData.experienceLevel && formData.activityLevel && formData.goal;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="text-2xl font-bold">Myotopia</span>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">
              {step === 1 ? "Basic Information" : "Fitness Profile"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1 
                ? "Help us personalize your experience" 
                : "Tell us about your fitness journey"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weight" className="text-white">Weight</Label>
                    <Select 
                      value={formData.weightUnit} 
                      onValueChange={(value: 'kg' | 'lbs') => setFormData({...formData, weightUnit: value, weight: ''})}
                    >
                      <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder={formData.weightUnit === 'kg' ? 'Enter weight in kg' : 'Enter weight in lbs'}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-white">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Height</Label>
                    <Select 
                      value={formData.heightUnit} 
                      onValueChange={(value: 'cm' | 'ft-in' | 'in') => setFormData({...formData, heightUnit: value, height: '', heightFeet: '', heightInches: ''})}
                    >
                      <SelectTrigger className="w-24 bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="ft-in">ft/in</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.heightUnit === 'ft-in' ? (
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="5"
                          value={formData.heightFeet}
                          onChange={(e) => setFormData({...formData, heightFeet: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Label className="text-xs text-gray-500 mt-1">feet</Label>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="10"
                          value={formData.heightInches}
                          onChange={(e) => setFormData({...formData, heightInches: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Label className="text-xs text-gray-500 mt-1">inches</Label>
                      </div>
                    </div>
                  ) : (
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder={formData.heightUnit === 'cm' ? 'Enter height in cm' : 'Enter height in inches'}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white">Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Activity Level</Label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value) => setFormData({...formData, activityLevel: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="very">Very Active (6-7 days/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Goal</Label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value) => setFormData({...formData, goal: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                      <SelectItem value="bulk">Weight Gain/Bulk</SelectItem>
                      <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button 
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {step === 1 ? "Next" : "Complete Setup"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
