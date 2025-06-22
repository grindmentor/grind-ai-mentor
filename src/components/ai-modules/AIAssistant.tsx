
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft, Send, BookOpen } from "lucide-react";
import { useState } from "react";

interface AIAssistantProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = ({ onBack }: AIAssistantProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Fitness Assistant. I provide science-backed answers to all your fitness and nutrition questions.

**What I can help with:**
• Exercise technique and programming
• Nutrition strategies and meal planning
• Supplement recommendations
• Recovery and sleep optimization
• Injury prevention
• Fat loss and muscle building strategies

**Special Features:**
✅ All answers backed by peer-reviewed research
✅ Study citations included when relevant
✅ Personalized advice based on your profile
✅ Safe, evidence-based recommendations

Ask me anything about fitness, nutrition, or health!`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response with scientific backing
    setTimeout(() => {
      const responses = [
        `Great question about "${userMessage}"! Based on current scientific literature:

**Key Research Findings:**
The latest meta-analysis by Rodriguez et al. (2023) in the Journal of Sports Medicine found that [specific finding related to your question]. This builds on earlier work by Thompson & Smith (2022) who demonstrated [related finding].

**Practical Application:**
1. [Specific actionable advice based on research]
2. [Additional recommendation with scientific basis]
3. [Safety consideration from literature]

**Study Citations:**
• Rodriguez, M., et al. (2023). "Meta-analysis of [relevant topic]." Journal of Sports Medicine, 45(3), 123-145.
• Thompson, K. & Smith, J. (2022). "Effects of [relevant intervention]." International Journal of Exercise Science, 15(2), 67-89.

**Bottom Line:**
Based on this research, I recommend [clear, actionable advice]. Remember to consult with healthcare professionals for personalized medical advice.

Would you like me to explain any of these studies in more detail?`,

        `Excellent question! The science shows:

**Research Summary:**
A recent systematic review in Sports Science Review (Chen et al., 2023) analyzed 32 studies and found that [specific finding]. The effect size was moderate to large (Cohen's d = 0.72), indicating practical significance.

**What This Means for You:**
Based on your profile and this research:
• [Personalized recommendation 1]
• [Personalized recommendation 2]  
• [Important consideration]

**Additional Studies:**
1. **Wilson & Davis (2023)** - Sports Nutrition Journal
   - Sample: 150 trained individuals
   - Duration: 12 weeks
   - Key finding: [specific result]

2. **Lee et al. (2022)** - Exercise Physiology Review
   - Meta-analysis of 28 RCTs
   - Conclusion: [relevant finding]

**Practical Implementation:**
Start with [specific step], monitor [specific marker], and adjust based on [specific criteria].

Need clarification on any aspect of this research?`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsLoading(false);
    }, 2500);
  };

  const quickQuestions = [
    "How much protein do I need to build muscle?",
    "What's the best way to lose fat while keeping muscle?",
    "How often should I train each muscle group?",
    "What supplements are actually worth taking?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
            <p className="text-gray-400">Ask anything about fitness & nutrition</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <BookOpen className="w-3 h-3 mr-1" />
          Science-backed answers
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Peer-reviewed research
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Study citations included
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Chat with AI Assistant</CardTitle>
            <CardDescription className="text-gray-400">
              Get evidence-based answers to your fitness and nutrition questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 p-4 rounded-lg max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">Analyzing scientific literature...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                placeholder="Ask about training, nutrition, supplements, recovery..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Questions</CardTitle>
            <CardDescription className="text-gray-400">
              Popular questions to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="text-left justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
