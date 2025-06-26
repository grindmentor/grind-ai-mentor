
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import { ArrowLeft, Brain, Target, Users, Zap, Shield, Award } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white animate-fade-in">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Logo size="md" />
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About 
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {" "}Myotopia
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing fitness through artificial intelligence, making personalized coaching 
            and evidence-based training accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-gray-900/50 border-gray-800/50 p-8 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
                To democratize access to world-class fitness coaching by combining cutting-edge AI technology 
                with evidence-based exercise science. We believe everyone deserves personalized guidance on 
                their fitness journey, regardless of their experience level or budget.
              </p>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Scientific Integrity",
                description: "We do not lie. Our AI makes mistakes, but we've programmed it to use the best available scientific information. We don't claim to have PhD researchers - we simply leverage the best research available online."
              },
              {
                icon: Brain,
                title: "AI-Powered Intelligence",
                description: "Our artificial intelligence learns from the latest exercise science research to provide you with evidence-based recommendations tailored to your unique goals and circumstances."
              },
              {
                icon: Users,
                title: "Personalized Approach",
                description: "No two fitness journeys are the same. Our platform adapts to your individual needs, preferences, and progress to deliver truly personalized coaching."
              },
              {
                icon: Zap,
                title: "Continuous Innovation",
                description: "We're constantly improving our AI algorithms and adding new features based on the latest research and user feedback to enhance your experience."
              },
              {
                icon: Award,
                title: "Results-Driven",
                description: "Everything we build is designed with one goal in mind: helping you achieve real, measurable progress toward your fitness goals."
              },
              {
                icon: Target,
                title: "Accessibility",
                description: "Quality fitness coaching shouldn't be a luxury. We're making world-class guidance accessible to anyone with the motivation to improve."
              }
            ].map((value, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800/50 p-6 hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Transparency Section */}
        <div className="mb-16">
          <Card className="bg-orange-500/10 border-orange-500/20 p-8 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Transparency</h2>
              <div className="max-w-4xl mx-auto space-y-4 text-gray-300">
                <p className="text-lg">
                  <strong className="text-orange-400">We do not lie.</strong> Our AI can make mistakes, but we have 
                  prompted it to use the best information possible based on science.
                </p>
                <p>
                  We don't claim to have a "PhD research team" or nutrition specialists on staff. Instead, 
                  we leverage the wealth of scientific research available online and use AI to synthesize 
                  this information into personalized recommendations for you.
                </p>
                <p>
                  Our approach is honest and transparent: we use technology to make the best available 
                  scientific knowledge accessible and actionable for your fitness journey.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How We Work</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Evidence-Based AI</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our AI system is trained on thousands of peer-reviewed studies, expert recommendations, 
                and best practices from the fitness industry. It continuously learns and adapts to 
                provide you with the most current and effective guidance.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Personalized workout programming</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Macro-optimized nutrition planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Progress tracking and adjustments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time coaching and motivation</span>
                </div>
              </div>
            </div>
            <Card className="bg-gray-900/50 border-gray-800/50 p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">Smart & Adaptive</h4>
                <p className="text-gray-400">
                  Our AI remembers your preferences, tracks your progress, and adapts recommendations 
                  based on your results and feedback.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience AI-Powered Fitness?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are achieving their fitness goals with personalized AI guidance.
          </p>
          <Link to="/signin">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-3">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
