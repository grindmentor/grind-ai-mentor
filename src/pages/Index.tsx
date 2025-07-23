import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Target, Zap, Star, Users, Trophy, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatedCard } from "@/components/ui/animated-card";
import Logo from "@/components/ui/logo";
import AvailableAchievements from "@/components/homepage/AvailableAchievements";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Redirect authenticated users to dashboard immediately to avoid flash
      if (user) {
        navigate('/app', { replace: true });
        return;
      }
    };
    checkUser();
  }, [navigate]);

  const features = [
    {
      icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "AI-Powered Coaching",
      description: "Get personalized fitness advice from our advanced AI coach trained on scientific research",
      color: "text-blue-500",
      delay: 0
    },
    {
      icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Smart Training Plans",
      description: "Receive customized workout programs that adapt to your progress and goals",
      color: "text-green-500",
      delay: 100
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Real-time Analysis",
      description: "Track your progress with intelligent insights and data-driven recommendations",
      color: "text-purple-500",
      delay: 200
    }
  ];

  const benefits = [
    {
      icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Science-Backed",
      description: "Every recommendation is based on the latest fitness research"
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Personalized",
      description: "Tailored specifically to your fitness level and goals"
    },
    {
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Results-Driven",
      description: "Proven methods that deliver real, measurable results"
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Safe & Effective",
      description: "Designed with injury prevention and long-term health in mind"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20 text-foreground">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10" />
          <div className="relative px-4 sm:px-6 pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-16 mx-auto max-w-7xl lg:px-8">
            <div className="mx-auto max-w-4xl text-center animate-fade-in">
              {/* Logo */}
              <div className="mb-6 sm:mb-8">
                <Logo size={isMobile ? "lg" : "xl"} />
              </div>
              
              <Badge className="mb-4 sm:mb-6 md:mb-8 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Science-Powered Fitness AI
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-gray-300 mb-6 sm:mb-8 md:mb-10 px-2 sm:px-4 md:px-0 max-w-3xl mx-auto">
                Get personalized workout plans, nutrition guidance, and expert coaching powered by AI. 
                Based on the latest scientific research for optimal results.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                <Button 
                  onClick={() => navigate(user ? '/app' : '/signin')}
                  size={isMobile ? "default" : "lg"}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {user ? 'Go to Dashboard' : 'Start for Free'}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/about')}
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-800/50 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Powered by Science
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              Experience the future of fitness with AI that understands your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <AnimatedCard 
                key={index}
                className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300"
                delay={feature.delay}
              >
                <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl text-white mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 leading-relaxed text-xs sm:text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Available Achievements Section */}
        <AvailableAchievements />

        {/* Benefits Section */}
        <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8 bg-gray-900/20 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-white">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              Built for serious fitness enthusiasts who want real results
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedCard 
                key={index}
                className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 p-3 sm:p-4 md:p-6 text-center hover:bg-gray-800/50 transition-all duration-300"
                delay={index * 100}
              >
                <div className="text-orange-500 mb-2 sm:mb-3 md:mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{benefit.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
          <AnimatedCard 
            className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/20 p-6 sm:p-8 md:p-12 text-center"
            delay={400}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Ready to Transform?
              </span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving their fitness goals with AI-powered guidance
            </p>
            <Button 
              onClick={() => navigate(user ? '/app' : '/signin')}
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold"
            >
              {user ? 'Go to Dashboard' : 'Start for Free'}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </AnimatedCard>
        </div>

        {/* Footer Links */}
        <footer className="border-t border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 md:py-12 lg:px-8">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-8">
              <button
                onClick={() => navigate('/about')}
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                About
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigate('/support')}
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                Support
              </button>
            </div>
            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Myotopia. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
