
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Timer, Utensils, Camera, Dumbbell, Crown, ArrowRight, CheckCircle, Sparkles, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/logo";
import { AnimatedCard } from "@/components/ui/animated-card";
import { SmoothButton } from "@/components/ui/smooth-button";
import { PageTransition } from "@/components/ui/page-transition";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "CoachGPT",
      description: "AI-powered fitness coach for personalized guidance",
      isPremium: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Utensils,
      title: "Meal Plan AI",
      description: "Custom nutrition plans based on your goals",
      isPremium: true,
      color: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "AI-powered physique analysis and progress monitoring",
      isPremium: true,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Timer,
      title: "Workout Timer",
      description: "Smart timing for your training sessions",
      isPremium: false,
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Target,
      title: "TDEE Calculator",
      description: "Precise calorie calculations for your metabolism",
      isPremium: false,
      color: "from-red-500 to-red-600"
    },
    {
      icon: Camera,
      title: "Food Photo Logger",
      description: "Log meals with AI-powered photo analysis",
      isPremium: true,
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-black/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo size="md" />
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/about')}
                  className="text-gray-300 hover:text-white hidden sm:block"
                >
                  About
                </SmoothButton>
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/pricing')}
                  className="text-gray-300 hover:text-white hidden sm:block"
                >
                  Pricing
                </SmoothButton>
                {user ? (
                  <SmoothButton
                    onClick={() => navigate('/app')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    Dashboard
                  </SmoothButton>
                ) : (
                  <div className="flex items-center space-x-2">
                    <SmoothButton
                      variant="outline"
                      onClick={() => navigate('/signin')}
                      className="border-gray-600 text-white hover:bg-gray-800 flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </SmoothButton>
                    <SmoothButton
                      onClick={() => navigate('/signin')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex items-center"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Sign Up</span>
                    </SmoothButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-6 animate-pulse-glow">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Fitness Coach
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent leading-tight">
                Your Personal{" "}
                <span className="font-orbitron bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  AI Fitness
                </span>{" "}
                Coach
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                Science-backed fitness guidance powered by AI. Get personalized workouts, nutrition plans, and expert advice 24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12 px-4">
                {user ? (
                  <SmoothButton
                    size="lg"
                    onClick={() => navigate('/app')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-6 sm:px-8 py-4 hover-glow w-full sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </SmoothButton>
                ) : (
                  <>
                    <SmoothButton
                      size="lg"
                      onClick={() => navigate('/signin')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-6 sm:px-8 py-4 hover-glow w-full sm:w-auto"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </SmoothButton>
                    
                    <SmoothButton
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/signin')}
                      className="border-gray-600 text-white hover:bg-gray-800 text-lg px-6 sm:px-8 py-4 w-full sm:w-auto flex items-center justify-center"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Existing User? Login
                    </SmoothButton>
                  </>
                )}
                
                <SmoothButton
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/pricing')}
                  className="border-gray-600 text-white hover:bg-gray-800 text-lg px-6 sm:px-8 py-4 w-full sm:w-auto"
                >
                  View Pricing
                </SmoothButton>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500 px-4">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Science-Based
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  24/7 AI Support
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Personalized Plans
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  No Equipment Required
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                AI-Powered Fitness Modules
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Choose from our comprehensive suite of AI tools designed to accelerate your fitness journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
              {features.map((feature, index) => (
                <AnimatedCard
                  key={feature.title}
                  delay={300 + index * 100}
                  className="group p-0 border-0 bg-transparent"
                >
                  <Card className={`h-full bg-gradient-to-br ${feature.color} border-0 text-white hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        {feature.isPremium && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedCard delay={600} className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/20">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Fitness?
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 mb-8">
                  Join thousands of users who are already achieving their fitness goals with AI-powered guidance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <SmoothButton
                    size="lg"
                    onClick={() => navigate(user ? '/app' : '/signin')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-6 sm:px-8 py-4 hover-glow w-full sm:w-auto"
                  >
                    {user ? 'Access Dashboard' : 'Start Your Journey'}
                    <Dumbbell className="w-5 h-5 ml-2" />
                  </SmoothButton>
                  {!user && (
                    <SmoothButton
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/signin')}
                      className="border-gray-600 text-white hover:bg-gray-800 text-lg px-6 sm:px-8 py-4 w-full sm:w-auto flex items-center justify-center"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Already Have Account?
                    </SmoothButton>
                  )}
                </div>
              </CardContent>
            </AnimatedCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <Logo size="sm" />
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 md:mt-0">
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/about')}
                  className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
                >
                  About
                </SmoothButton>
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/privacy')}
                  className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
                >
                  Privacy Policy
                </SmoothButton>
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/terms')}
                  className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
                >
                  Terms of Service
                </SmoothButton>
                <SmoothButton
                  variant="ghost"
                  onClick={() => navigate('/support')}
                  className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto font-normal"
                >
                  Support
                </SmoothButton>
              </div>
            </div>
            
            <div className="text-center mt-8 text-sm text-gray-500">
              © 2025 GrindMentor. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
