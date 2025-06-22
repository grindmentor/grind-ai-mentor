import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Dumbbell, Target, TrendingUp, Clock, Users, Star, Check, MessageCircle } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Science-Based AI Fitness Coach
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Personalized meal plans & training programs to transform your physique.
          </p>
          <div className="flex justify-center space-x-4">
            <SoundButton 
              onClick={() => navigate("/signin")}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-md py-3 px-6 transition-all hover:scale-105"
            >
              Start Your Transformation
            </SoundButton>
            <Link to="/pricing" className="text-white hover:text-gray-300 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
        {/* Hero Image */}
        <div className="absolute inset-0 mt-16 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2878&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Fitness Training"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Unlock Your Potential with AI-Powered Coaching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Personalized Workouts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  AI-driven workout plans tailored to your goals, experience level, and available equipment.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature Card 2 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                    <Target className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Custom Meal Plans</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Delicious and effective meal plans designed to optimize your nutrition and support muscle growth or fat loss.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature Card 3 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Monitor your progress with detailed analytics and insights to stay motivated and achieve your targets.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature Card 4 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Time-Efficient Training</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Maximize your results in minimal time with optimized workout routines and efficient meal prep strategies.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature Card 5 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Community Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Connect with like-minded individuals, share your journey, and get support from our community.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature Card 6 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
                    <Star className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white">Expert Guidance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Access expert tips, advice, and resources to help you achieve your fitness goals faster.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Real Results, Real People
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial Card 1 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div>
                    <p className="text-white font-medium">John Doe</p>
                    <p className="text-gray-400 text-sm">Fitness Enthusiast</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "GrindMentor has completely transformed my approach to fitness. The AI-powered meal plans and workouts are spot-on, and I've seen incredible results in just a few weeks!"
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm">Verified User</span>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Card 2 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                    AS
                  </div>
                  <div>
                    <p className="text-white font-medium">Alice Smith</p>
                    <p className="text-gray-400 text-sm">Busy Professional</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "As a busy professional, I struggled to find time for fitness. GrindMentor's AI coach has made it easy to fit effective workouts and healthy meals into my hectic schedule."
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-sm">Verified User</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-12">
            Join GrindMentor today and experience the future of personalized fitness coaching.
          </p>
          <SoundButton 
            onClick={() => navigate("/signin")}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-md py-3 px-6 transition-all hover:scale-105"
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </SoundButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <div className="container mx-auto">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} GrindMentor. All rights reserved.
          </p>
          <div className="mt-4 space-x-4">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
