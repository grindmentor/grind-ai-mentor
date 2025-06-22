import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight, Zap, Brain, Camera, TrendingUp, Utensils, Dumbbell, Users, Target, BarChart3, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { SoundButton } from "@/components/SoundButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/signin">
            <SoundButton variant="ghost" className="text-white hover:bg-gray-800">
              Sign In
            </SoundButton>
          </Link>
          <Link to="/signin">
            <SoundButton className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all">
              Get Started
              <Sparkles className="ml-2 w-4 h-4" />
            </SoundButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
          🤖 AI-Powered Fitness Coaching
        </Badge>
        
        {/* Minimalistic Hero Image */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Your AI Fitness
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Mentor
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Transform your physique with AI-powered meal planning, coaching, and progress tracking designed for serious lifters. All responses backed by scientific research and peer-reviewed studies.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/signin">
            <SoundButton 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg hover:scale-105 transition-all"
              soundType="success"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </SoundButton>
          </Link>
          <Link to="/about">
            <SoundButton 
              variant="outline" 
              className="border-gray-600 text-black bg-white hover:bg-gray-100 px-8 py-4 text-lg hover:scale-105 transition-all"
            >
              Learn More
            </SoundButton>
          </Link>
        </div>

        {/* Updated Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
          <div className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
            <Brain className="w-5 h-5" />
            <span>Science-Backed AI Responses</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
            <Target className="w-5 h-5" />
            <span>Personalized Training Programs</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span>Advanced Progress Tracking</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive tools backed by scientific research and peer-reviewed studies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* MealPlanAI */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">MealPlanAI</CardTitle>
              <CardDescription className="text-gray-400">
                Personalized nutrition plans based on metabolic research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Evidence-based macro calculations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Budget-optimized meal planning
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Dietary restriction support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CoachGPT */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">CoachGPT</CardTitle>
              <CardDescription className="text-gray-400">
                24/7 AI coaching with scientific citations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Research-backed advice
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Study citations included
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Evidence-based recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Training Programs */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Smart Training</CardTitle>
              <CardDescription className="text-gray-400">
                Programs based on exercise science principles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Periodization principles
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Progressive overload tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Recovery optimization
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CutCalc */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">CutCalc Pro</CardTitle>
              <CardDescription className="text-gray-400">
                Body composition analysis using validated methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Visual progress tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Body fat estimation
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Phase recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Food Tracking */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Smart Food Log</CardTitle>
              <CardDescription className="text-gray-400">
                Accurate nutrition tracking with database validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Photo recognition
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Portion accuracy
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Comprehensive database
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Premium AI</CardTitle>
              <CardDescription className="text-gray-400">
                Advanced features with unlimited access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Unlimited everything
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Priority responses
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Advanced analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Progressive Overload Tracker */}
          <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all group hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white text-xl">Progressive Overload</CardTitle>
              <CardDescription className="text-gray-400">
                Smart strength tracking with AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Automatic progression tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Smart load recommendations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Available to all users
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
            Start Free,
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Upgrade When Ready</span>
          </h2>
          <p className="text-xl text-gray-400">
            Cancel anytime. No refunds - all sales are final.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Free</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">Perfect to get started</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  3 AI meal plans per month
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic AI coaching (5 questions/day)
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Progress photo uploads
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic workout tracking
                </li>
              </ul>
              <Link to="/signin">
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-gray-900 border-orange-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1">
                MOST POPULAR
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Premium</CardTitle>
              <div className="text-4xl font-bold text-white mt-4">
                $15<span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">For serious lifters</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-white mb-6">
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
                  Body composition analysis
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Custom training programs
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              <Link to="/signin">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  Get Started Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Transform?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your fitness journey with science-backed AI coaching and personalized training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">GrindMentor</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <div className="text-center text-gray-400 mt-8 pt-8 border-t border-gray-800">
            <p>&copy; 2024 GrindMentor. Science-backed fitness coaching.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
