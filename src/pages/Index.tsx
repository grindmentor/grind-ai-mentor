
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

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Coaching",
      description: "Get personalized fitness advice from our advanced AI coach trained on scientific research",
      color: "text-blue-500",
      delay: 0
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Training Plans",
      description: "Receive customized workout programs that adapt to your progress and goals",
      color: "text-green-500",
      delay: 100
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Analysis",
      description: "Track your progress with intelligent insights and data-driven recommendations",
      color: "text-purple-500",
      delay: 200
    }
  ];

  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Science-Backed",
      description: "Every recommendation is based on the latest fitness research"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personalized",
      description: "Tailored specifically to your fitness level and goals"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Results-Driven",
      description: "Proven methods that deliver real, measurable results"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Effective",
      description: "Designed with injury prevention and long-term health in mind"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10" />
          <div className="relative px-6 pt-20 pb-16 mx-auto max-w-7xl lg:px-8">
            <div className="mx-auto max-w-2xl text-center animate-fade-in">
              <Badge className="mb-8 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                Science-Powered Fitness AI
              </Badge>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              
              <p className="text-lg leading-8 text-gray-300 mb-10">
                Get personalized workout plans, nutrition guidance, and expert coaching powered by AI. 
                Based on the latest scientific research for optimal results.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={() => navigate(user ? '/app' : '/signin')}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {user ? 'Go to Dashboard' : 'Start Your Journey'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/about')}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-800/50 backdrop-blur-sm px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Powered by Science
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Experience the future of fitness with AI that understands your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard 
                key={index}
                className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300"
                delay={feature.delay}
              >
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 px-6 mx-auto max-w-7xl lg:px-8 bg-gray-900/20 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-lg">
              Built for serious fitness enthusiasts who want real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <AnimatedCard 
                key={index}
                className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 p-6 text-center hover:bg-gray-800/50 transition-all duration-300"
                delay={index * 100}
              >
                <div className="text-orange-500 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 px-6 mx-auto max-w-7xl lg:px-8">
          <AnimatedCard 
            className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/20 p-12 text-center"
            delay={400}
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Ready to Transform?
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving their fitness goals with AI-powered guidance
            </p>
            <Button 
              onClick={() => navigate(user ? '/app' : '/signin')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
