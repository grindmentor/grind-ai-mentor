
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight, Zap, Brain, Camera, TrendingUp, Utensils } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [email, setEmail] = useState("");

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Early access signup:", email);
    // TODO: Integrate with actual signup system
    alert("Thanks for your interest! We'll notify you when GrindMentor launches.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header/Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>
        <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
          🚀 AI-Powered Fitness Revolution
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Your Ultimate
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            AI Fitness Mentor
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Personalized meal plans, 24/7 AI coaching, and intelligent progress tracking designed for serious powerlifters and aesthetic-focused athletes.
        </p>
        
        <form onSubmit={handleEarlyAccess} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
            required
          />
          <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-3">
            Get Early Access
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
        
        <p className="text-gray-400 text-sm">Join 1,000+ lifters already on the waitlist</p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Dominate</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Five powerful AI modules working together to transform your physique and performance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* MealPlanAI */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">MealPlanAI</CardTitle>
              <CardDescription className="text-gray-300">
                Personalized nutrition plans based on your goals, preferences, and budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Custom macro calculations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Grocery lists & meal prep
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Budget-conscious options
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CoachGPT */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">CoachGPT</CardTitle>
              <CardDescription className="text-gray-300">
                24/7 AI virtual coach for lifting, nutrition, and recovery guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Instant expert advice
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Form corrections
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Recovery optimization
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CutCalc */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">CutCalc</CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered progress tracking with photo and measurement analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Photo progress analysis
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Cutting plan adjustments
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Weekly feedback reports
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Food Tracking */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Smart Food Tracking</CardTitle>
              <CardDescription className="text-gray-300">
                Photo-based food logging with AI portion recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Snap & track instantly
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Custom portion sizes
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Add new foods easily
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105 lg:col-span-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Premium AI Features</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced automation and personalization for serious athletes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Lead Capture & Onboarding</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Automated user segmentation
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Welcome email sequences
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Progress milestone rewards
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Payments & Access Control</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Seamless Stripe integration
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Subscription management
                    </li>
                    <li className="flex items-center">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      Premium feature unlocks
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-300">Start free, upgrade when you're ready to dominate</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Free Tier</CardTitle>
              <CardDescription className="text-gray-300">Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold text-white mt-4">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  3 AI meal plans per month
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic CoachGPT responses
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Limited photo tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Community access
                </li>
              </ul>
              <Button className="w-full bg-gray-700 hover:bg-gray-600">
                Start Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1">
                MOST POPULAR
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <CardDescription className="text-gray-300">For serious lifters</CardDescription>
              <div className="text-4xl font-bold text-white mt-4">
                $10<span className="text-lg text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Unlimited AI meal plans
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  24/7 unlimited AI coaching
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Advanced progress tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Photo food tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Weekly AI feedback reports
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Start Premium Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Elite Athletes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Mike Rodriguez",
              role: "Powerlifter, 800lb Deadlift",
              content: "GrindMentor's AI coaching helped me break through my plateau. The meal planning is spot-on for my bulk cycles.",
              rating: 5
            },
            {
              name: "Sarah Chen",
              role: "Physique Competitor",
              content: "The CutCalc feature is incredible. It tracks my progress better than any coach I've had and adjusts my plan weekly.",
              rating: 5
            },
            {
              name: "David Thompson",
              role: "Strength Coach",
              content: "I recommend GrindMentor to all my clients. The 24/7 AI coach fills the gaps when I'm not available.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl p-12 border border-orange-500/30">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Physique?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of lifters already using AI to dominate their fitness goals. Start your transformation today.
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">GM</span>
              </div>
              <span className="text-xl font-bold">GrindMentor</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-400 mt-8 pt-8 border-t border-gray-800">
            <p>&copy; 2024 GrindMentor. Built for lifters, by lifters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
