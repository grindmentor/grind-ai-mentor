
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Utensils, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Sparkles,
  Dumbbell,
  User,
  Scale,
  Calendar
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Profile form data
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

  const steps = [
    {
      title: "Welcome to GrindMentor!",
      subtitle: "Your AI-Powered Fitness Coach",
      icon: Sparkles,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <p className="text-lg text-gray-300">
              Get personalized, science-based fitness and nutrition guidance powered by AI
            </p>
            <p className="text-gray-400">
              Whether you're building muscle, losing fat, or improving performance, we've got you covered
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Meet Your AI Modules",
      subtitle: "Specialized tools for every goal",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <Brain className="w-6 h-6 text-blue-500" />
              <div>
                <h4 className="font-medium">CoachGPT</h4>
                <p className="text-sm text-gray-400">24/7 AI fitness coaching with research citations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <Utensils className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-medium">MealPlan AI</h4>
                <p className="text-sm text-gray-400">Custom meal plans optimized for your goals</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <div>
                <h4 className="font-medium">Physique AI</h4>
                <p className="text-sm text-gray-400">AI-powered progress tracking and analysis</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Science-Based Approach",
      subtitle: "Every recommendation backed by research",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Research-Backed</h4>
                <p className="text-sm text-gray-400">All advice based on peer-reviewed studies</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Personalized</h4>
                <p className="text-sm text-gray-400">Tailored to your unique goals and preferences</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">Continuously Updated</h4>
                <p className="text-sm text-gray-400">AI learns and adapts with new research</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Basic Information",
      subtitle: "Help us personalize your experience",
      icon: User,
      content: (
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
      )
    },
    {
      title: "Fitness Profile",
      subtitle: "Tell us about your fitness journey",
      icon: Dumbbell,
      content: (
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
                <SelectItem value="bulk">Bulk (Gain Muscle)</SelectItem>
                <SelectItem value="cut">Cut (Lose Fat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Transform?",
      subtitle: "Let's start your fitness journey",
      icon: TrendingUp,
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-lg text-gray-300">
              You're all set to begin your transformation with GrindMentor
            </p>
            <div className="flex justify-center">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Science-Powered Results
              </Badge>
            </div>
            <p className="text-gray-400">
              Start with any AI module or ask CoachGPT your first question
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isProfileStep = currentStep === 3 || currentStep === 4; // Steps 3 and 4 are profile steps

  const getHeightValidation = () => {
    if (formData.heightUnit === 'ft-in') {
      return formData.heightFeet && formData.heightInches;
    }
    return formData.height;
  };

  const canProceedStep3 = formData.weight && formData.birthday && getHeightValidation();
  const canProceedStep4 = formData.experienceLevel && formData.activityLevel && formData.goal;

  const saveProfileData = async () => {
    if (!user) return false;

    try {
      setIsLoading(true);
      
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
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 3 && !canProceedStep3) return;
    if (currentStep === 4 && !canProceedStep4) return;
    
    if (isLastStep) {
      // Save profile data first, then complete onboarding
      const saved = await saveProfileData();
      if (saved) {
        onComplete();
      }
    } else if (currentStep === 4) {
      // Save profile data before proceeding to final step
      await saveProfileData();
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const canProceed = () => {
    if (currentStep === 3) return canProceedStep3;
    if (currentStep === 4) return canProceedStep4;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl text-white">{currentStepData.title}</CardTitle>
          <p className="text-gray-400 text-sm">{currentStepData.subtitle}</p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-orange-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex justify-between items-center pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-gray-700 hover:bg-gray-800"
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {currentStep === 0 && <div></div>}
            
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
