import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Target, Zap, ChevronRight } from "lucide-react";
import Logo from "@/components/ui/logo";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        navigate('/app', { replace: true });
        return;
      }
      
      setIsCheckingAuth(false);
      // Trigger animations after auth check
      requestAnimationFrame(() => setIsVisible(true));
    };
    checkUser();
  }, [navigate]);

  // Auto-advance slides
  useEffect(() => {
    if (isCheckingAuth) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center animate-scale-in">
          <Logo size="lg" />
          <div className="mt-6 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const slides = [
    {
      icon: <Dumbbell className="w-16 h-16" />,
      title: "AI-Powered Training",
      subtitle: "Personalized workouts built on the latest fitness science",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <Target className="w-16 h-16" />,
      title: "Track Progress",
      subtitle: "Visual insights that show your transformation journey",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Zap className="w-16 h-16" />,
      title: "Smart Nutrition",
      subtitle: "Meal plans and macro tracking made effortless",
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Status bar safe area */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {/* Logo */}
        <div 
          className={`pt-8 pb-8 flex justify-center transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
          }`}
        >
          <Logo size="md" />
        </div>

        {/* Slides */}
        <div className="flex-1 flex flex-col justify-center relative">
          <div className="text-center">
            {/* Icon */}
            <div 
              key={`icon-${currentSlide}`}
              className={`w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl animate-scale-in`}
            >
              <div className="text-white">
                {slides[currentSlide].icon}
              </div>
            </div>
            
            {/* Text */}
            <h1 
              key={`title-${currentSlide}`}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight animate-fade-in"
            >
              {slides[currentSlide].title}
            </h1>
            <p 
              key={`subtitle-${currentSlide}`}
              className="text-muted-foreground text-base max-w-xs mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div 
          className={`space-y-3 pt-8 transition-all duration-300 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            onClick={() => navigate('/signin')}
            variant="ghost"
            size="lg"
            className="w-full h-12 text-muted-foreground hover:text-foreground text-base rounded-2xl"
          >
            I already have an account
            <ChevronRight className="ml-1 w-5 h-5" />
          </Button>
        </div>

        {/* Legal links */}
        <div className="flex justify-center gap-4 pt-6 text-xs text-muted-foreground">
          <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">
            Terms
          </button>
          <span className="text-border">•</span>
          <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">
            Privacy
          </button>
        </div>
      </div>

      {/* Bottom safe area */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
};

export default Index;
