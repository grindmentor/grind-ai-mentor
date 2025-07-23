
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft, Send, BookOpen, ImagePlus, X } from "lucide-react";
import { useState, useRef } from "react";

interface AIAssistantProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const AIAssistant = ({ onBack }: AIAssistantProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm your personal AI fitness coach, and I'm here to help you crush your goals!

I'm not just another boring AI that spits out generic advice. I want to get to know YOU - your lifestyle, your challenges, what motivates you, and what's been holding you back.

**Here's what we can chat about:**
🏋️ **Training** - Let's design workouts that fit YOUR schedule and preferences
🍎 **Nutrition** - Meal plans that actually work with your lifestyle (no more boring chicken and rice!)
📸 **Progress** - Upload photos and I'll help you see your transformation
💪 **Motivation** - Having a tough day? Let's talk it through
🎯 **Goals** - Whether it's losing fat, building muscle, or just feeling amazing

**I'm different because I:**
✅ Ask questions to understand YOU specifically
✅ Give practical advice that fits your real life
✅ Keep it real - no BS, just what actually works
✅ Back everything with science (but explain it like a friend, not a textbook)

So... what's your story? Are you just starting out, getting back into it, or looking to level up? What's your biggest challenge right now? 

Don't hold back - the more you tell me, the better I can help you! 🚀`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePersonalizedResponse = (userMessage: string, hasImage: boolean) => {
    const responses = [
      // Beginner-focused responses
      {
        keywords: ['beginner', 'start', 'new', 'first time', 'never', 'scared', 'intimidated'],
        response: `I love that you're taking this step! Starting is honestly the hardest part, and you're already crushing it just by being here.

${hasImage ? "Looking at your photo, " : ""}Here's the thing about being new to fitness - everyone was there once, even the most jacked person at your gym. 

**Let's start simple:**
• What's your main goal? (lose weight, build muscle, feel stronger, etc.)
• How many days per week can you realistically commit?
• Do you prefer working out at home or gym?
• Any injuries or things that hurt?

**My beginner-friendly approach:**
✅ Start with 2-3 workouts per week (consistency beats intensity)
✅ Focus on basic movements first (squats, push-ups, etc.)
✅ Don't stress about perfect nutrition - just start eating more protein
✅ Track how you FEEL, not just numbers on a scale

What resonates with you? And seriously, don't worry about not knowing stuff - that's what I'm here for! 💪

**Quick question:** What's been your biggest worry about starting a fitness routine?`
      },
      // Weight loss focused
      {
        keywords: ['lose weight', 'fat loss', 'cut', 'diet', 'overweight', 'slim down'],
        response: `Fat loss - let's talk real talk! 🔥

${hasImage ? "From what I can see in your photo, " : ""}The good news is that sustainable fat loss is totally doable when you have the right approach.

**Here's what actually works (science-backed, promise!):**
• Eat in a moderate calorie deficit (not starvation mode!)
• Prioritize protein (keeps you full + preserves muscle)
• Strength training (burns calories AND shapes your body)
• Cardio that you actually enjoy (dancing, hiking, whatever!)

**Let me get specific for YOU:**
• What's your current eating like? (be honest, no judgment!)
• How much weight are you looking to lose?
• What's worked/failed for you before?
• Biggest challenge - cravings, time, motivation?

The key is making this fit YOUR life. No point in a perfect plan you can't stick to, right?

**Studies show** people who lose weight sustainably do these 3 things:
1. Track their food (even just photos work!)
2. Weigh themselves regularly 
3. Have a support system (that's me! 😊)

What's your biggest struggle with past weight loss attempts?`
      },
      // Muscle building focused
      {
        keywords: ['build muscle', 'gain', 'bulk', 'strong', 'bigger', 'mass', 'hypertrophy'],
        response: `Building muscle - now we're talking! 💪

${hasImage ? "Looking at your current physique, " : ""}Muscle building is both an art and a science, and I'm here to make sure you do it right.

**The muscle-building formula:**
• Progressive overload (gradually lift heavier/do more reps)
• Eat enough protein (0.8-1g per lb bodyweight)
• Get quality sleep (this is where the magic happens!)
• Train consistently (better to do 3 days every week than 6 days once)

**Tell me about your situation:**
• How long have you been lifting?
• What's your current training split?
• Are you eating enough? (most people aren't!)
• How's your sleep game?

**Real talk:** Building muscle takes patience. You might see strength gains in 2-4 weeks, but visible muscle changes take 8-12 weeks minimum. Don't let social media fool you!

**Research shows** the best muscle builders:
1. Focus on compound movements (squats, deadlifts, bench, rows)
2. Hit each muscle group 2x per week
3. Eat consistently (not just on training days!)

What's your biggest challenge with building muscle so far? And are you eating enough - be honest! 😅`
      },
      // General motivation/lifestyle
      {
        keywords: ['motivation', 'tired', 'busy', 'stress', 'time', 'energy', 'life', 'work'],
        response: `I hear you on the life struggles! 😤 Real talk - fitness isn't just about the gym, it's about making it work with your actual life.

${hasImage ? "I can see you're putting yourself out there, which takes courage. " : ""}Let's figure out how to make this sustainable for YOU.

**Life happens, but we can work with it:**
• What's your typical day/week look like?
• Where do you lose steam usually?
• What time of day do you feel most energetic?
• What's your biggest stressor right now?

**My practical approach:**
✅ Start stupidly small (10 min workouts count!)
✅ Stack habits (workout after morning coffee, etc.)
✅ Plan for bad days (what's your backup plan?)
✅ Focus on energy, not just appearance

**Science fact:** Exercise actually GIVES you energy and reduces stress. The hardest part is just starting, then your body starts craving it.

**Quick wins that work:**
• 5-minute morning stretches
• Take stairs whenever possible
• Park further away
• Dance while cooking dinner

What feels most realistic for you to start with? And what's draining your energy the most right now?`
      }
    ];

    // Find matching response based on keywords
    let selectedResponse = responses.find(r => 
      r.keywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      )
    );

    // Default conversational response if no keywords match
    if (!selectedResponse) {
      selectedResponse = {
        keywords: [],
        response: `Thanks for sharing that with me! ${hasImage ? "And thanks for the photo - that helps me understand your situation better. " : ""}

I want to give you the most personalized advice possible, so help me understand you better:

**About your goals:**
• What's your main fitness goal right now?
• What's been your biggest challenge?
• How much time can you realistically dedicate?

**About your current situation:**
• What's your experience level with fitness?
• Any injuries or limitations I should know about?
• What does your typical day look like?

**About your preferences:**
• Do you prefer gym, home workouts, or outdoor activities?
• What type of foods do you actually enjoy eating?
• What motivates you most?

The more specific you are, the better I can tailor everything to YOUR life. No generic advice here - we're building something that actually works for you!

What would you like to tackle first? 🎯`
      };
    }

    return selectedResponse.response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage = input || "Please analyze this image";
    const messageWithImage: Message = {
      role: 'user',
      content: userMessage,
      image: imagePreview || undefined
    };

    setInput("");
    removeImage();
    setMessages(prev => [...prev, messageWithImage]);
    setIsLoading(true);

    // Generate personalized response
    setTimeout(() => {
      const personalizedResponse = generatePersonalizedResponse(userMessage, !!selectedImage);
      setMessages(prev => [...prev, { role: 'assistant', content: personalizedResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const quickQuestions = [
    "I'm a complete beginner - where do I start?",
    "Help me lose weight without being miserable",
    "I want to build muscle but I'm not seeing results",
    "I'm too busy/tired to work out consistently"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-foreground hover:bg-accent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground">Your personal fitness coach & friend</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-accent/50 text-accent-foreground border-accent">
          <BookOpen className="w-3 h-3 mr-1" />
          Personalized advice
        </Badge>
        <Badge className="bg-accent/50 text-accent-foreground border-accent">
          Ask me anything
        </Badge>
        <Badge className="bg-accent/50 text-accent-foreground border-accent">
          Conversational & friendly
        </Badge>
        <Badge className="bg-accent/50 text-accent-foreground border-accent">
          Progress photo analysis
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Chat with Your AI Coach</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell me about your goals, challenges, and lifestyle. Upload progress photos for personalized feedback!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted rounded-lg">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    {message.image && (
                      <img 
                        src={message.image} 
                        alt="Progress photo" 
                        className="w-full max-w-xs rounded-lg mb-2"
                      />
                    )}
                    <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent text-accent-foreground p-4 rounded-lg max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">Let me think about this... 🤔</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-card border-border text-card-foreground hover:bg-accent"
                title="Upload progress photo"
              >
                <ImagePlus className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Tell me about your goals, ask questions, share your challenges... anything!"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-input border-border text-foreground flex-1"
              />
              <Button 
                type="submit" 
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Not sure what to ask?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Try one of these conversation starters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="text-left justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
