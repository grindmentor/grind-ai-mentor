
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Target, User, Activity, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { useUserData } from '@/contexts/UserDataContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AnimatedCard } from '@/components/ui/animated-card';
import { SmoothButton } from '@/components/ui/smooth-button';
import { PageTransition } from '@/components/ui/page-transition';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'physique' | 'performance' | 'health' | 'lifestyle';
}

const goalOptions: GoalOption[] = [
  // Physique Goals
  { id: 'muscle_gain', title: 'Build Muscle', description: 'Increase lean muscle mass and strength', icon: '💪', color: 'bg-red-500/20 border-red-500/30 text-red-400', category: 'physique' },
  { id: 'fat_loss', title: 'Lose Fat', description: 'Reduce body fat while preserving muscle', icon: '🔥', color: 'bg-orange-500/20 border-orange-500/30 text-orange-400', category: 'physique' },
  { id: 'body_recomp', title: 'Body Recomposition', description: 'Build muscle while losing fat simultaneously', icon: '⚖️', color: 'bg-purple-500/20 border-purple-500/30 text-purple-400', category: 'physique' },
  { id: 'lean_bulk', title: 'Lean Bulk', description: 'Gain muscle with minimal fat gain', icon: '📈', color: 'bg-green-500/20 border-green-500/30 text-green-400', category: 'physique' },
  { id: 'cut', title: 'Cutting Phase', description: 'Aggressive fat loss for competition prep', icon: '✂️', color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', category: 'physique' },
  { id: 'maintain', title: 'Maintain Physique', description: 'Preserve current muscle and body composition', icon: '🎯', color: 'bg-blue-500/20 border-blue-500/30 text-blue-400', category: 'physique' },
  { id: 'shred', title: 'Get Shredded', description: 'Achieve extremely low body fat percentage', icon: '🗿', color: 'bg-slate-500/20 border-slate-500/30 text-slate-400', category: 'physique' },
  
  // Performance Goals
  { id: 'strength', title: 'Increase Strength', description: 'Maximize powerlifting and compound lifts', icon: '🏋️', color: 'bg-red-600/20 border-red-600/30 text-red-300', category: 'performance' },
  { id: 'endurance', title: 'Build Endurance', description: 'Improve cardiovascular and muscular endurance', icon: '🏃', color: 'bg-blue-600/20 border-blue-600/30 text-blue-300', category: 'performance' },
  { id: 'athletic', title: 'Athletic Performance', description: 'Sport-specific training and conditioning', icon: '🏆', color: 'bg-yellow-600/20 border-yellow-600/30 text-yellow-300', category: 'performance' },
  { id: 'power', title: 'Explosive Power', description: 'Develop speed, agility, and explosive movement', icon: '⚡', color: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400', category: 'performance' },
  { id: 'flexibility', title: 'Mobility & Flexibility', description: 'Improve range of motion and movement quality', icon: '🤸', color: 'bg-teal-500/20 border-teal-500/30 text-teal-400', category: 'performance' },
  { id: 'speed', title: 'Increase Speed', description: 'Get faster for sports and daily activities', icon: '💨', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', category: 'performance' },
  
  // Health Goals
  { id: 'general_health', title: 'General Health', description: 'Overall wellness and disease prevention', icon: '❤️', color: 'bg-pink-500/20 border-pink-500/30 text-pink-400', category: 'health' },
  { id: 'rehab', title: 'Injury Rehabilitation', description: 'Recover from injury and prevent re-injury', icon: '🩹', color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', category: 'health' },
  { id: 'posture', title: 'Fix Posture', description: 'Correct postural imbalances and alignment', icon: '🧘', color: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400', category: 'health' },
  { id: 'longevity', title: 'Longevity Training', description: 'Age gracefully with functional fitness', icon: '🌟', color: 'bg-violet-500/20 border-violet-500/30 text-violet-400', category: 'health' },
  { id: 'pain_relief', title: 'Pain Management', description: 'Reduce chronic pain through movement', icon: '🌿', color: 'bg-green-600/20 border-green-600/30 text-green-300', category: 'health' },
  
  // Lifestyle Goals
  { id: 'stress_relief', title: 'Stress Management', description: 'Use fitness to reduce stress and anxiety', icon: '🧘‍♂️', color: 'bg-sky-500/20 border-sky-500/30 text-sky-400', category: 'lifestyle' },
  { id: 'confidence', title: 'Build Confidence', description: 'Improve self-esteem through fitness achievements', icon: '✨', color: 'bg-rose-500/20 border-rose-500/30 text-rose-400', category: 'lifestyle' },
  { id: 'lifestyle', title: 'Healthy Lifestyle', description: 'Establish sustainable fitness habits', icon: '🌱', color: 'bg-lime-500/20 border-lime-500/30 text-lime-400', category: 'lifestyle' },
  { id: 'energy', title: 'Increase Energy', description: 'Boost daily energy levels and vitality', icon: '⚡', color: 'bg-amber-500/20 border-amber-500/30 text-amber-400', category: 'lifestyle' }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    age: '',
    height: '',
    weight: '',
    
    // Fitness Background
    experience: '',
    activity: '',
    goals: [] as string[],
    
    // Additional Info
    injuries: '',
    preferences: '',
    
    // Preferences
    weightUnit: 'kg' as 'kg' | 'lbs',
    heightUnit: 'cm' as 'cm' | 'ft-in'
  });

  const { updateUserData } = useUserData();
  const { updatePreference } = usePreferences();

  const totalSteps = 5;

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update user data (removing gender as it's not in the UserData type)
      await updateUserData({
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        experience: formData.experience,
        activity: formData.activity,
        goal: formData.goals.join(', '),
        injuries: formData.injuries,
        training_preferences: formData.preferences
      });

      // Update preferences
      await updatePreference('weight_unit', formData.weightUnit);
      await updatePreference('height_unit', formData.heightUnit);

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.height && formData.weight;
      case 2:
        return formData.experience && formData.activity;
      case 3:
        return formData.goals.length > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const groupedGoals = goalOptions.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, GoalOption[]>);

  const categoryTitles = {
    physique: 'Physique Goals',
    performance: 'Performance Goals', 
    health: 'Health Goals',
    lifestyle: 'Lifestyle Goals'
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Welcome to Myotopia
              </h1>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatedCard className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                {currentStep === 1 && <><User className="w-5 h-5 mr-2 text-orange-500" /> Personal Information</>}
                {currentStep === 2 && <><Activity className="w-5 h-5 mr-2 text-orange-500" /> Fitness Background</>}
                {currentStep === 3 && <><Target className="w-5 h-5 mr-2 text-orange-500" /> Your Goals</>}
                {currentStep === 4 && <><Calendar className="w-5 h-5 mr-2 text-orange-500" /> Additional Information</>}
                {currentStep === 5 && <><CheckCircle className="w-5 h-5 mr-2 text-orange-500" /> Review & Complete</>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="age" className="text-white">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height" className="text-white">Height ({formData.heightUnit})</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder={formData.heightUnit === 'cm' ? "175" : "70"}
                        value={formData.height}
                        onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-white">Weight ({formData.weightUnit})</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder={formData.weightUnit === 'kg' ? "70" : "154"}
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Weight Unit</Label>
                      <Select value={formData.weightUnit} onValueChange={(value: 'kg' | 'lbs') => setFormData(prev => ({ ...prev, weightUnit: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Height Unit</Label>
                      <Select value={formData.heightUnit} onValueChange={(value: 'cm' | 'ft-in') => setFormData(prev => ({ ...prev, heightUnit: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="cm">Centimeters (cm)</SelectItem>
                          <SelectItem value="ft-in">Feet & Inches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Fitness Background */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Experience Level</Label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="beginner">Beginner (0-1 year)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                        <SelectItem value="expert">Expert/Competitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-white">Activity Level</Label>
                    <Select value={formData.activity} onValueChange={(value) => setFormData(prev => ({ ...prev, activity: value }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select your activity level" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                        <SelectItem value="extremely_active">Extremely Active (2x/day or intense training)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Goals Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <p className="text-gray-300 text-sm">Select all goals that apply to you. You can choose multiple goals.</p>
                  
                  {Object.entries(groupedGoals).map(([category, goals]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                        {categoryTitles[category as keyof typeof categoryTitles]}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            onClick={() => handleGoalToggle(goal.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                              formData.goals.includes(goal.id)
                                ? goal.color
                                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{goal.icon}</span>
                              <div className="flex-1">
                                <h4 className={`font-medium ${formData.goals.includes(goal.id) ? 'text-white' : 'text-gray-300'}`}>
                                  {goal.title}
                                </h4>
                                <p className={`text-sm ${formData.goals.includes(goal.id) ? 'text-gray-200' : 'text-gray-500'}`}>
                                  {goal.description}
                                </p>
                              </div>
                              {formData.goals.includes(goal.id) && (
                                <CheckCircle className="w-5 h-5 text-current" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Additional Information */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="injuries" className="text-white">Any injuries or limitations? (Optional)</Label>
                    <Textarea
                      id="injuries"
                      placeholder="e.g., Lower back pain, knee injury, etc."
                      value={formData.injuries}
                      onChange={(e) => setFormData(prev => ({ ...prev, injuries: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferences" className="text-white">Training preferences or additional notes? (Optional)</Label>
                    <Textarea
                      id="preferences"
                      placeholder="e.g., Prefer home workouts, hate cardio, etc."
                      value={formData.preferences}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
                      Ready to start your journey!
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Age:</span>
                        <span className="text-white ml-2">{formData.age}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-white ml-2">{formData.experience}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Goals:</span>
                        <span className="text-white ml-2">{formData.goals.length} selected</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Activity Level:</span>
                        <span className="text-white ml-2">{formData.activity?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-gray-200 text-sm">
                      Your AI coach will use this information to provide personalized recommendations, 
                      workout plans, and nutrition guidance tailored specifically to your goals and experience level.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </AnimatedCard>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <SmoothButton
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </SmoothButton>

            <SmoothButton
              onClick={currentStep === totalSteps ? handleComplete : handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              {currentStep !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </SmoothButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default OnboardingFlow;
