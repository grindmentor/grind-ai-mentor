
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      title: "Let's Get Your Details",
      subtitle: "Help us personalize your experience",
      icon: User,
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-lg text-gray-300">
              Next, we'll gather some basic information about you
            </p>
            <div className="grid gap-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Scale className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Weight and height</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Age and experience level</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Target className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Fitness goals and activity level</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Don't worry - you can always update these later in your settings!
            </p>
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
  const isProfileStep = currentStep === 3; // The "Let's Get Your Details" step

  const handleNext = () => {
    if (isProfileStep) {
      // Redirect to the actual profile onboarding page
      window.location.href = '/onboarding';
      return;
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
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
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {currentStep === 0 && <div></div>}
            
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isProfileStep ? (
                <>
                  Continue Setup
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
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
