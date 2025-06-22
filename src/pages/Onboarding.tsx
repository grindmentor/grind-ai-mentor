
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: "",
    age: "",
    height: "",
    experienceLevel: "",
    activityLevel: "",
    goal: ""
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Save data and navigate to dashboard
      console.log("User data:", formData);
      navigate("/app");
    }
  };

  const canProceedStep1 = formData.weight && formData.age && formData.height;
  const canProceedStep2 = formData.experienceLevel && formData.activityLevel && formData.goal;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-2xl font-bold">GrindMentor</span>
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
                  <Label htmlFor="weight" className="text-white">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Enter your weight"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Enter your age"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="Enter your height"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white">Experience Level</Label>
                  <RadioGroup
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="text-gray-300">Beginner (0-1 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="text-gray-300">Intermediate (1-3 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="text-gray-300">Advanced (3+ years)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Activity Level</Label>
                  <RadioGroup
                    value={formData.activityLevel}
                    onValueChange={(value) => setFormData({...formData, activityLevel: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sedentary" id="sedentary" />
                      <Label htmlFor="sedentary" className="text-gray-300">Sedentary (desk job, no exercise)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="text-gray-300">Light (1-3 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate" className="text-gray-300">Moderate (3-5 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very" id="very" />
                      <Label htmlFor="very" className="text-gray-300">Very Active (6-7 days/week)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Goal</Label>
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData({...formData, goal: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maintain" id="maintain" />
                      <Label htmlFor="maintain" className="text-gray-300">Maintain Weight</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulk" id="bulk" />
                      <Label htmlFor="bulk" className="text-gray-300">Bulk (Gain Muscle)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cut" id="cut" />
                      <Label htmlFor="cut" className="text-gray-300">Cut (Lose Fat)</Label>
                    </div>
                  </RadioGroup>
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
