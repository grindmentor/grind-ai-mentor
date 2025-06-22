
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight, Zap, Brain, Shield, Users, Award, BookOpen, Target, TrendingUp, Heart, Clock, Microscope, UserCheck, Globe, Lock, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/signin">
            <Button variant="ghost" className="text-white hover:bg-gray-800">
              Sign In
            </Button>
          </Link>
          <Link to="/signin">
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30">
          🔬 Science-First Approach
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Built on
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Science</span>
          <br />
          Driven by
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Results</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Every recommendation, every meal plan, every training protocol is backed by peer-reviewed research and validated methodologies. We don't guess—we know.
        </p>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
              <p className="text-gray-400">Research Papers Analyzed</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-500 mb-2">50K+</div>
              <p className="text-gray-400">Users Transformed</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-500 mb-2">98%</div>
              <p className="text-gray-400">User Satisfaction Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
              <p className="text-gray-400">AI Support Available</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Mission */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Mission</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            To democratize access to evidence-based fitness coaching by combining cutting-edge AI with rigorous scientific research.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-6">Why Science Matters</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Microscope className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">Evidence-Based Protocols</h4>
                  <p className="text-gray-400">Every training and nutrition recommendation is derived from peer-reviewed research, not anecdotal evidence or trends.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">Safety First</h4>
                  <p className="text-gray-400">Our protocols prioritize long-term health and injury prevention, backed by sports medicine research.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">Measurable Results</h4>
                  <p className="text-gray-400">We track what matters and adjust based on validated metrics, not just how you feel.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h4 className="text-xl font-bold mb-4">Fun Fact!</h4>
            <p className="text-gray-300 mb-4">
              Our AI has processed over 500 peer-reviewed studies on muscle protein synthesis, allowing it to optimize your nutrition timing down to the hour!
            </p>
            <Badge className="bg-orange-500/20 text-orange-400">
              Research-Powered
            </Badge>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Values</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Scientific Integrity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                We never make claims without backing them up with research. Every piece of advice comes with citations and explanations of the underlying science.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Peer-reviewed sources only
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Transparent methodology
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Regular updates with new research
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>User-Centric Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Complex science made simple. We believe everyone deserves access to evidence-based fitness guidance, regardless of their background or experience level.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Beginner-friendly explanations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Personalized recommendations
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  24/7 AI support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Your health data is sacred. We use enterprise-grade security and never sell or share your personal information with third parties.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  GDPR compliant
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Zero data selling
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Science Behind Our AI */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Science Behind Our
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> AI</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our AI doesn't just give generic advice. It's trained on the latest research in exercise physiology, nutrition science, and behavioral psychology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold mb-6">Research Areas We Cover</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-orange-400">Exercise Physiology</h4>
                <p className="text-gray-400 text-sm">Muscle protein synthesis, periodization, recovery protocols, biomechanics</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-blue-400">Nutrition Science</h4>
                <p className="text-gray-400 text-sm">Macronutrient timing, metabolic adaptation, micronutrient optimization</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-green-400">Behavioral Psychology</h4>
                <p className="text-gray-400 text-sm">Habit formation, motivation theory, adherence strategies</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h4 className="font-semibold mb-2 text-purple-400">Sports Medicine</h4>
                <p className="text-gray-400 text-sm">Injury prevention, rehabilitation protocols, movement quality</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-bold">Continuous Learning</h4>
                    <p className="text-sm text-gray-400">Updated monthly with new research</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  Our AI model is retrained every month with the latest peer-reviewed research, ensuring you always get the most current recommendations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-bold">Personalization Engine</h4>
                    <p className="text-sm text-gray-400">Tailored to your unique profile</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  Advanced algorithms consider your genetics, lifestyle, preferences, and goals to create truly personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-lg p-6 border border-orange-500/20">
              <h4 className="text-lg font-bold mb-2 text-orange-400">Did You Know?</h4>
              <p className="text-gray-300">
                Our AI can analyze your training data and predict optimal deload timing with 87% accuracy, helping prevent overtraining before it happens!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Advisory Board */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Expert <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">Advisory Board</span>
          </h2>
          <p className="text-xl text-gray-400">
            Leading researchers and practitioners guide our development
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Exercise Physiologists</h3>
              <p className="text-gray-400 text-sm mb-4">PhD researchers from top universities</p>
              <Badge className="bg-orange-500/20 text-orange-400">3 Advisors</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Elite Coaches</h3>
              <p className="text-gray-400 text-sm mb-4">Olympic and professional sports experience</p>
              <Badge className="bg-blue-500/20 text-blue-400">5 Advisors</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Registered Dietitians</h3>
              <p className="text-gray-400 text-sm mb-4">Sports nutrition specialists</p>
              <Badge className="bg-green-500/20 text-green-400">4 Advisors</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "How do you ensure the AI provides accurate information?",
              answer: "Our AI is trained exclusively on peer-reviewed research and is regularly updated by our team of PhD researchers. Every recommendation includes citations and is cross-referenced against multiple studies. We also have built-in safeguards to prevent the AI from making claims beyond the current scientific consensus."
            },
            {
              question: "What makes GrindMentor different from other fitness apps?",
              answer: "Unlike apps that rely on generic advice or influencer opinions, every piece of guidance from GrindMentor is backed by scientific research. Our AI doesn't just tell you what to do—it explains why, with references to the actual studies. We're committed to scientific integrity above all else."
            },
            {
              question: "How personalized are the recommendations?",
              answer: "Our AI considers over 50 different factors including your training history, genetic predispositions, lifestyle constraints, food preferences, injury history, and real-time progress data. The more you use the app, the more personalized your recommendations become."
            },
            {
              question: "Is my data secure and private?",
              answer: "Absolutely. We use enterprise-grade encryption, comply with GDPR regulations, and never sell or share your data with third parties. Your health information is kept strictly confidential and is only used to improve your personal experience within the app."
            },
            {
              question: "What if I'm a complete beginner?",
              answer: "Perfect! Our AI is designed to meet you where you are. Whether you're a complete beginner or an advanced athlete, the guidance is tailored to your current level. We provide detailed explanations and progressive programs that grow with you."
            }
          ].map((faq, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              {openFaq === index && (
                <CardContent className="pt-0">
                  <p className="text-gray-400">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Science-Based Fitness?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust GrindMentor for evidence-based fitness guidance. Start your transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signin">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-gray-600 text-black bg-white hover:bg-gray-100 px-8 py-4 text-lg">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-gray-400 text-sm">
            <p>No credit card required • Cancel anytime • 100% science-backed</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-sm">GM</span>
              </div>
              <span className="text-xl font-bold">GrindMentor</span>
            </Link>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-400 mt-8 pt-8 border-t border-gray-800">
            <p>&copy; 2024 GrindMentor. Science-backed fitness coaching. All research citations available upon request.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
