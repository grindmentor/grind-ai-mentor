import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Target, Zap, Star, Users, Trophy, Shield, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatedCard } from "@/components/ui/animated-card";
import Logo from "@/components/ui/logo";
import AvailableAchievements from "@/components/homepage/AvailableAchievements";
import KeyFeatures from "@/components/homepage/KeyFeatures";
import ContactForm from "@/components/homepage/ContactForm";
import FAQ from "@/components/homepage/FAQ";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Instantly redirect authenticated users without showing homepage content
      if (user) {
        navigate('/app', { replace: true });
        return; // Don't set loading to false if redirecting
      }
      
      // Only show homepage content if user is not authenticated
      setIsCheckingAuth(false);
    };
    checkUser();
  }, [navigate]);

  // Show nothing while checking authentication to prevent flash
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20" />
    );
  }

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
        {/* Mobile Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/90 border-b border-gray-800/50 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
              <div className="flex items-center">
                <Logo size="sm" />
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6">
                <button
                  onClick={() => navigate('/about')}
                  className="text-sm lg:text-base text-gray-300 hover:text-orange-400 transition-colors px-3 py-2 min-h-[40px]"
                >
                  About
                </button>
                <button
                  onClick={() => navigate('/support')}
                  className="text-sm lg:text-base text-gray-300 hover:text-orange-400 transition-colors px-3 py-2 min-h-[40px]"
                >
                  Support
                </button>
                <Button
                  onClick={() => navigate(user ? '/app' : '/signin')}
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white min-h-[44px] px-6"
                >
                  {user ? 'Dashboard' : 'Sign In'}
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-orange-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
              <div className="md:hidden pb-4 border-t border-gray-800/50 mt-2">
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    onClick={() => {
                      navigate('/about');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-gray-800/30 rounded-lg transition-colors min-h-[44px]"
                  >
                    About
                  </button>
                  <button
                    onClick={() => {
                      navigate('/support');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-gray-800/30 rounded-lg transition-colors min-h-[44px]"
                  >
                    Support
                  </button>
                  <Button
                    onClick={() => {
                      navigate(user ? '/app' : '/signin');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full min-h-[44px]"
                  >
                    {user ? 'Go to Dashboard' : 'Sign In'}
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden" style={{ marginTop: 'env(safe-area-inset-top)', scrollMarginTop: '96px' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl relative py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-4xl text-center animate-fade-in">
              {/* Logo */}
              <div className="mb-6 sm:mb-8">
                <Logo size={isMobile ? "lg" : "xl"} />
              </div>
              
              <Badge className="mb-4 sm:mb-6 md:mb-8 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30 transition-colors" aria-label="Science-Powered Fitness AI badge">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" aria-hidden="true" />
                Science-Powered Fitness AI
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-[1.1]">
                <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-300 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto">
                Get personalized workout plans, nutrition guidance, and expert coaching powered by AI. 
                Based on the latest scientific research for optimal results.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={() => {
                    // Track CTA click event
                    if (typeof window !== 'undefined' && (window as any).trackEvent) {
                      (window as any).trackEvent('get_started_click', {
                        button_location: 'hero_cta',
                        user_status: user ? 'authenticated' : 'guest'
                      });
                    }
                    navigate(user ? '/app' : '/signin');
                  }}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
                  aria-label={user ? 'Go to your dashboard' : 'Start your free fitness journey'}
                >
                  {user ? 'Go to Dashboard' : 'Start for Free'}
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/about')}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-800/50 backdrop-blur-sm px-8 py-3 text-base sm:text-lg min-h-[44px]"
                  aria-label="Learn more about Myotopia"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section - New */}
        <KeyFeatures />

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16 scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Powered by Science
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-prose mx-auto">
              Experience the future of fitness with AI that understands your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <AnimatedCard 
                key={index}
                className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 w-full sm:min-h-[260px] lg:min-h-[300px]"
                delay={feature.delay}
              >
                <CardHeader className="text-center p-6 sm:p-8">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-white mb-3">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Available Achievements Section */}
        <AvailableAchievements />

        {/* Benefits Section */}
        <section id="benefits" className="bg-gray-900/20 backdrop-blur-sm scroll-mt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16">
            <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-white leading-tight">
                Why Choose Our Platform?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-prose mx-auto">
                Built for serious fitness enthusiasts who want real results
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <AnimatedCard 
                  key={index}
                  className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 p-6 sm:p-8 text-center hover:bg-gray-800/50 transition-all duration-300 w-full sm:min-h-[240px]"
                  delay={index * 100}
                >
                  <div className="text-orange-500 mb-4 flex justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{benefit.description}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16 scroll-mt-24">
          <AnimatedCard 
            className="bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-sm border-orange-500/20 p-8 sm:p-10 lg:p-12 text-center"
            delay={400}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Ready to Transform?
              </span>
            </h2>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already achieving their fitness goals with AI-powered guidance
            </p>
            <Button 
              onClick={() => navigate(user ? '/app' : '/signin')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 text-base sm:text-lg font-semibold min-h-[44px]"
              aria-label={user ? 'Go to your dashboard' : 'Start your free fitness journey'}
            >
              {user ? 'Go to Dashboard' : 'Start for Free'}
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </AnimatedCard>
        </section>

        {/* Contact Form - New */}
        <ContactForm />

        {/* FAQ Section - New */}
        <FAQ />

        {/* Footer Links */}
        <footer className="border-t border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 sm:py-10 lg:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div className="text-center sm:text-left">
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Product</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/about')}
                    className="block text-gray-400 hover:text-orange-400 transition-colors text-sm w-full sm:w-auto text-center sm:text-left min-h-[44px] sm:min-h-0"
                  >
                    About
                  </button>
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Support</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/support')}
                    className="block text-gray-400 hover:text-orange-400 transition-colors text-sm w-full sm:w-auto text-center sm:text-left min-h-[44px] sm:min-h-0"
                  >
                    Help Center
                  </button>
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Legal</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/privacy')}
                    className="block text-gray-400 hover:text-orange-400 transition-colors text-sm w-full sm:w-auto text-center sm:text-left min-h-[44px] sm:min-h-0"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => navigate('/terms')}
                    className="block text-gray-400 hover:text-orange-400 transition-colors text-sm w-full sm:w-auto text-center sm:text-left min-h-[44px] sm:min-h-0"
                  >
                    Terms of Service
                  </button>
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Company</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/about')}
                    className="block text-gray-400 hover:text-orange-400 transition-colors text-sm w-full sm:w-auto text-center sm:text-left min-h-[44px] sm:min-h-0"
                  >
                    About Us
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-6 sm:pt-8 border-t border-gray-800/50 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
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
