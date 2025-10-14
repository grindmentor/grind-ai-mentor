import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How does the AI coaching work?",
      answer: "Our AI analyzes your fitness data, goals, and progress to provide personalized workout plans and nutrition guidance based on the latest scientific research."
    },
    {
      question: "Is this suitable for beginners?",
      answer: "Absolutely! The platform adapts to your fitness level, whether you're just starting out or you're an experienced athlete. We provide guidance tailored to your experience."
    },
    {
      question: "What makes this science-based?",
      answer: "Every recommendation is backed by peer-reviewed research and evidence-based training principles. We constantly update our algorithms with the latest fitness science."
    },
    {
      question: "Can I track my progress?",
      answer: "Yes! The platform includes comprehensive progress tracking with analytics, measurements, and visual representations of your transformation journey."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, you can start for free and explore the basic features. Upgrade anytime to unlock advanced AI coaching and premium features."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 mx-auto max-w-7xl lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Everything you need to know about Myotopia
          </p>
        </div>

        <AnimatedCard 
          className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6"
          delay={100}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-gray-700/50 bg-gray-800/30 rounded-lg px-4 data-[state=open]:bg-gray-800/50 transition-all"
              >
                <AccordionTrigger className="text-white hover:text-orange-400 text-left text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedCard>
      </div>
    </section>
  );
};

export default FAQ;
