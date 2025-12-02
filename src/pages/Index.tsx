import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Target, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/logo";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        navigate('/app', { replace: true });
        return;
      }
      
      setIsCheckingAuth(false);
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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Logo size="lg" />
          <div className="mt-6 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
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
      <div className="h-safe-top bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {/* Logo */}
        <motion.div 
          className="pt-8 pb-6 flex justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Logo size="md" />
        </motion.div>

        {/* Slides */}
        <div className="flex-1 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-center"
            >
              {/* Icon */}
              <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl`}>
                <div className="text-white">
                  {slides[currentSlide].icon}
                </div>
              </div>
              
              {/* Text */}
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-sm mx-auto leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <motion.div 
          className="space-y-3 pt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-transform"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            onClick={() => navigate('/signin')}
            variant="ghost"
            size="lg"
            className="w-full h-14 text-muted-foreground hover:text-foreground text-lg rounded-2xl"
          >
            I already have an account
            <ChevronRight className="ml-1 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Legal links */}
        <div className="flex justify-center gap-4 pt-6 text-xs text-muted-foreground">
          <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">
            Terms of Service
          </button>
          <span>•</span>
          <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Bottom safe area */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
};

export default Index;
