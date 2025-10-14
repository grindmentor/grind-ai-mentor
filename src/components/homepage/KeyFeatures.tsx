import { AnimatedCard } from "@/components/ui/animated-card";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Brain, TrendingUp } from "lucide-react";

const KeyFeatures = () => {
  const keyFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Intelligence",
      description: "Advanced algorithms analyze your data to provide personalized recommendations",
      color: "text-orange-500",
      delay: 0
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Custom Workout Plans",
      description: "Tailored training programs that adapt to your progress and goals",
      color: "text-red-500",
      delay: 100
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Comprehensive analytics to monitor your transformation journey",
      color: "text-orange-400",
      delay: 200
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Key Features
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Everything you need to achieve your fitness goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {keyFeatures.map((feature, index) => (
          <AnimatedCard 
            key={index}
            className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/60 hover:border-orange-500/30 transition-all duration-300"
            delay={feature.delay}
          >
            <CardHeader className="text-center p-6 sm:p-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${feature.color} shadow-lg`}>
                {feature.icon}
              </div>
              <CardTitle className="text-lg sm:text-xl text-white mb-3">{feature.title}</CardTitle>
              <CardDescription className="text-gray-400 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
};

export default KeyFeatures;
