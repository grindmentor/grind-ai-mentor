
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";
import { ArrowRight, Dumbbell, Brain, Zap, Star, Users, Trophy, Target, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white animate-fade-in">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/signin">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Fitness Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Personal
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent block">
              AI Fitness Coach
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your fitness journey with science-backed AI guidance. Get personalized workout plans, 
            nutrition advice, and real-time coaching tailored to your goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-white/10 px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed to optimize every aspect of your fitness journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart Training Plans",
                description: "AI-generated workout programs based on exercise science and your personal goals",
                gradient: "from-purple-500 to-purple-700"
              },
              {
                icon: Target,
                title: "Nutrition Optimization",
                description: "Personalized meal plans with macro tracking and evidence-based recommendations",
                gradient: "from-green-500 to-green-700"
              },
              {
                icon: Zap,
                title: "Real-time Coaching",
                description: "Your AI coach remembers your progress and provides contextual guidance",
                gradient: "from-blue-500 to-blue-700"
              },
              {
                icon: Trophy,
                title: "Progress Tracking",
                description: "Advanced analytics to monitor your transformation and optimize results",
                gradient: "from-yellow-500 to-yellow-700"
              },
              {
                icon: Shield,
                title: "Science-Based",
                description: "All recommendations backed by the latest exercise and nutrition research",
                gradient: "from-red-500 to-red-700"
              },
              {
                icon: Users,
                title: "Personal Journey",
                description: "Tailored exclusively to your fitness level, goals, and preferences",
                gradient: "from-indigo-500 to-indigo-700"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800/50 p-6 hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">10,000+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">50M+</div>
              <div className="text-gray-300">Workouts Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">4.9/5</div>
              <div className="text-gray-300 flex items-center justify-center">
                User Rating
                <div className="flex ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have achieved their fitness goals with AI-powered guidance
          </p>
          <Link to="/signin">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" className="mb-4" />
              <p className="text-gray-400 max-w-md">
                Empowering your fitness journey with AI-driven insights and personalized coaching.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/support" className="block text-gray-400 hover:text-white transition-colors">Support</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800/50 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Myotopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
