
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle, Zap, Target, Brain, Utensils } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/logo";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to GrindMentor",
      description: "Your science-based AI fitness coach is ready to help you achieve your goals.",
      icon: Brain,
      content: (
        <div className="text-center space-y-4">
          <Logo size="lg" className="justify-center" />
          <p className="text-gray-400">
            GrindMentor uses evidence-based fitness science to provide personalized coaching, 
            meal planning, and workout programs tailored specifically for you.
          </p>
        </div>
      )
    },
    {
      title: "AI-Powered Modules",
      description: "Explore our comprehensive suite of fitness tools.",
      icon: Zap,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <Brain className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-medium text-white">CoachGPT</div>
              <div className="text-sm text-gray-400">Personalized fitness coaching</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <Utensils className="w-5 h-5 text-green-400" />
            <div>
              <div className="font-medium text-white">MealPlanAI</div>
              <div className="text-sm text-gray-400">Custom nutrition planning</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <Target className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-medium text-white">Smart Training</div>
              <div className="text-sm text-gray-400">Adaptive workout programs</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Get Started",
      description: "You're all set! Start exploring your AI fitness modules.",
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Setup Complete
          </Badge>
          <p className="text-gray-400">
            Click below to start your fitness journey with GrindMentor. 
            You can access all available features based on your current plan.
          </p>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('grindmentor_onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('grindmentor_onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-white">{currentStepData.title}</CardTitle>
          <CardDescription className="text-gray-400">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-orange-500' 
                    : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
