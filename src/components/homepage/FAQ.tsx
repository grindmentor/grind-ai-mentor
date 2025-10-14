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
    <section id="faq" className="scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-prose mx-auto">
              Everything you need to know about Myotopia
            </p>
          </div>

          <AnimatedCard 
            className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6 lg:p-8"
            delay={100}
          >
            <Accordion type="single" collapsible className="w-full space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-gray-700/50 bg-gray-800/30 rounded-lg px-4 sm:px-6 data-[state=open]:bg-gray-800/50 transition-all"
                >
                  <AccordionTrigger className="text-white hover:text-orange-400 text-left text-sm sm:text-base lg:text-lg py-4 sm:py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-prose">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
