import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Dumbbell, Target, TrendingUp, Clock, Users, Star, Check, Brain, Calculator, Utensils, Camera, Heart, Timer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SoundButton } from "@/components/SoundButton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, isNewUser } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect them appropriately
    if (!loading && user) {
      if (isNewUser) {
        navigate("/onboarding");
      } else {
        navigate("/app");
      }
    }
  }, [user, loading, isNewUser, navigate]);

  // Don't render the landing page if user is logged in
  if (!loading && user) {
    return null;
  }

  const featuredAIModules = [
    {
      title: "CoachGPT",
      description: "24/7 AI fitness coaching with research citations and personalized guidance.",
      icon: Brain,
      color: "bg-blue-500"
    },
    {
      title: "MealPlanAI", 
      description: "Custom meal plans and nutrition guidance optimized for your goals.",
      icon: Utensils,
      color: "bg-green-500"
    },
    {
      title: "Smart Training",
      description: "AI-generated personalized weight training programs.",
      icon: Dumbbell,
      color: "bg-red-500"
    },
    {
      title: "ProgressAI",
      description: "AI photo analysis and body composition tracking.",
      icon: Camera,
      color: "bg-purple-500"
    },
    {
      title: "TDEE Calculator",
      description: "Calculate metabolic needs and muscle potential with advanced algorithms.",
      icon: Calculator,
      color: "bg-indigo-500"
    },
    {
      title: "Smart Food Log",
      description: "Photo-based food tracking and analysis with intelligent insights.",
      icon: Camera,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="container mx-auto text-center px-6">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">GrindMentor</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Science-Based AI Fitness Coach
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Get personalized meal plans and training programs backed by research and tailored to your goals.
          </p>
          <p className="text-base text-gray-500 mb-8 max-w-xl mx-auto">
            Whether you're a seasoned lifter or just starting out, get results that actually work.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <SoundButton 
              onClick={() => navigate("/signin")}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg py-4 px-8 transition-all hover:scale-105 shadow-xl"
            >
              Start Your Transformation
              <ArrowRight className="ml-2 w-5 h-5" />
            </SoundButton>
            <Link 
              to="/pricing" 
              className="text-gray-300 hover:text-white transition-colors font-medium border border-gray-700 hover:border-gray-500 rounded-lg py-4 px-8"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Featured AI Modules */}
      <section className="py-20 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Most Powerful AI Fitness Tools
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our most popular AI tools designed by fitness experts and backed by scientific research
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredAIModules.map((module, index) => (
              <Card key={index} className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center text-white`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-white text-xl">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unlock Your Potential with AI-Powered Coaching
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every recommendation is backed by scientific research and tailored to your unique goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Personalized Workouts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  AI-driven workout plans tailored to your goals, experience level, and available equipment. Every exercise is optimized for maximum gains.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <Target className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Custom Meal Plans</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  Science-backed nutrition plans designed to optimize your metabolism and support muscle growth or fat loss goals. Fuel your transformation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  Detailed analytics and insights to monitor your progress and stay motivated on your fitness journey. Track those gains!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Time-Efficient Training</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  Maximize results in minimal time with scientifically optimized workout routines and efficient meal strategies.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Community Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  Connect with like-minded individuals, share your journey, and get motivation from our supportive community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
                    <Star className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">Expert Guidance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-base">
                  Access expert tips, research-backed advice, and proven strategies to accelerate your fitness transformation.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Science-Based Facts Section */}
      <section className="py-20 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built on Scientific Evidence
            </h2>
            <p className="text-gray-400 text-lg">
              Our AI recommendations are based on peer-reviewed research and proven methodologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Progressive Overload</p>
                    <p className="text-gray-400">Scientific Principle</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Our training algorithms follow the principle of progressive overload, gradually increasing training stimulus to maximize muscle growth and strength gains based on exercise science research.
                </p>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Research-Backed Method</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Caloric Balance</p>
                    <p className="text-gray-400">Nutrition Science</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Our meal planning AI uses thermodynamics and metabolic research to create precise caloric and macronutrient targets for optimal body composition changes.
                </p>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Evidence-Based Nutrition</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Recovery Optimization</p>
                    <p className="text-gray-400">Sports Science</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Rest periods, sleep recommendations, and recovery protocols are based on exercise physiology research to maximize adaptation and prevent overtraining.
                </p>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Scientifically Optimized</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Individualization</p>
                    <p className="text-gray-400">Personalized Approach</p>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Our AI considers individual differences in genetics, training history, and lifestyle factors to create truly personalized fitness and nutrition recommendations.
                </p>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Tailored to You</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-t from-gray-900 to-black">
        <div className="container mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands who have already transformed their lives with science-based fitness coaching.
          </p>
          <SoundButton 
            onClick={() => navigate("/signin")}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg py-4 px-8 transition-all hover:scale-105 shadow-xl text-lg"
          >
            Get Started Now <ArrowRight className="ml-2 w-6 h-6" />
          </SoundButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GrindMentor</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              &copy; {new Date().getFullYear()} GrindMentor. All rights reserved.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
