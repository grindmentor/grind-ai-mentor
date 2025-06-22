import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight, Zap, Brain, Camera, TrendingUp, Utensils, Dumbbell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Early access signup:", email);
    alert("Thanks for your interest! We'll notify you when GrindMentor launches.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>
        <Link to="/app">
          <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
            Launch App
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
          🤖 AI-Powered Fitness
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Your AI Fitness
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Mentor
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          AI-powered coaching, meal planning, and progress tracking for serious lifters.
        </p>
        
        <form onSubmit={handleEarlyAccess} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-orange-500 focus:outline-none"
            required
          />
          <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            Get Access
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* MealPlanAI */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">MealPlanAI</CardTitle>
              <CardDescription className="text-gray-400">
                Personalized nutrition plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Custom macro calculations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Budget-conscious options
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CoachGPT */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">CoachGPT</CardTitle>
              <CardDescription className="text-gray-400">
                24/7 AI coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Instant expert advice
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Form corrections
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Training Programs */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Training Plans</CardTitle>
              <CardDescription className="text-gray-400">
                Adaptive workout programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Goal-specific programs
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Auto progression
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CutCalc */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">CutCalc</CardTitle>
              <CardDescription className="text-gray-400">
                Progress tracking + body fat estimates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Photo analysis
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Body fat estimates
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Food Tracking */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mb-3">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Food Tracking</CardTitle>
              <CardDescription className="text-gray-400">
                Photo-based logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Snap & track
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Custom portions
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-lg">Premium AI</CardTitle>
              <CardDescription className="text-gray-400">
                Advanced automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited access
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Pricing</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Free</CardTitle>
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
                  Basic AI coaching
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Limited tracking
                </li>
              </ul>
              <Link to="/app">
                <Button className="w-full bg-gray-700 hover:bg-gray-600">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-gray-900 border-orange-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1">
                RECOMMENDED
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">
                $10<span className="text-lg text-gray-400">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Unlimited everything
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  24/7 AI coaching
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Advanced tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              <Link to="/app">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Start Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Transform?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the future of AI-powered fitness coaching.
          </p>
          <Link to="/app">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg">
              Launch App
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-sm">GM</span>
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
