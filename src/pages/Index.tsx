import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Star, TrendingUp, Users, Shield, Zap, Target, Award, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      content: "Myotopia transformed my approach to fitness. The science-based recommendations actually work!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Personal Trainer",
      content: "As a trainer, I love how Myotopia backs everything with research. My clients see real results.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Busy Professional",
      content: "Finally, a fitness app that adapts to my schedule and gives me workouts that actually fit my life.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
      title: "Science-Based Training",
      description: "Every workout and recommendation is backed by peer-reviewed research and proven methodologies."
    },
    {
      icon: <Star className="w-8 h-8 text-green-400" />,
      title: "AI-Powered Personalization",
      description: "Advanced AI analyzes your progress and preferences to create truly personalized fitness plans."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: "Expert Community",
      description: "Connect with fitness professionals and enthusiasts who share your commitment to evidence-based training."
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-400" />,
      title: "Safety First",
      description: "All exercises and programs are designed with injury prevention and proper form as top priorities."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Adaptive Programs",
      description: "Your workouts evolve with you, automatically adjusting based on your progress and feedback."
    },
    {
      icon: <Target className="w-8 h-8 text-red-400" />,
      title: "Goal-Oriented",
      description: "Whether building muscle, losing fat, or improving performance, we create targeted plans for your goals."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Myotopia</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/support" className="text-gray-300 hover:text-white transition-colors">
                Support
              </Link>
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/signin" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">Myotopia</span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                Science-Based Fitness
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                Transform your body with AI-powered training programs backed by scientific research. 
                No more guesswork, just results that actually work.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg">
                  Start Your Journey Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 text-center">
              <p className="text-gray-400 mb-4">Trusted by thousands of fitness enthusiasts</p>
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-400 mr-1" />
                  <span>10K+ Active Users</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-green-400 mr-1" />
                  <span>Science-Backed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Myotopia</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We combine cutting-edge AI technology with proven scientific methods to deliver 
            personalized fitness solutions that actually work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700 hover:bg-gray-900/70 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-400">Real results from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-white text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-gray-400">{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400">Start free, upgrade when you're ready</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Free</CardTitle>
              <CardDescription className="text-gray-400">Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold text-white">$0</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Basic workout modules</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Progress tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Community access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-red-800/20 border-orange-700/50">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Premium</CardTitle>
              <CardDescription className="text-orange-200">Unlock your full potential</CardDescription>
              <div className="text-4xl font-bold text-white">$15<span className="text-lg text-gray-400">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-white">Everything in Free</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-white">AI Personal Trainer</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-white">Unlimited modules</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-white">Personalized meal plans</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link to="/pricing">
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              View Full Pricing
            </Button>
          </Link>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-orange-900/50 to-red-800/50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of people who have discovered the power of science-based training. 
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/50 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">Myotopia</span>
              </div>
              <p className="text-gray-400">Science-based fitness for everyone</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/modules" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link to="/support" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">Our Story</Link>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Myotopia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
