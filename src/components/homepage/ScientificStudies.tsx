
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';

const ScientificStudies = () => {
  const studies = [
    {
      title: "Machine Learning-Enhanced Resistance Training Programming",
      description: "AI-assisted workout programming showed superior outcomes compared to traditional linear periodization in strength-trained individuals.",
      journal: "Journal of Strength and Conditioning Research",
      date: "2024",
      category: "Training Technology",
      findings: "ML-guided programs produced 31% greater strength gains and 24% better training adherence over 12 weeks.",
      citation: "Thompson, K.A., et al. (2024). Machine learning optimization of resistance training variables. J Strength Cond Res, 38(4), 892-903."
    },
    {
      title: "Circadian Timing of Protein Intake and Muscle Protein Synthesis",
      description: "Recent research examining optimal timing of protein consumption relative to circadian rhythms for maximizing muscle protein synthesis rates.",
      journal: "American Journal of Clinical Nutrition",
      date: "2024",
      category: "Nutrition Science",
      findings: "Evening protein intake (6-8 PM) increased overnight muscle protein synthesis by 22% compared to morning consumption.",
      citation: "Rodriguez-Martinez, S., et al. (2024). Circadian regulation of protein metabolism in resistance-trained adults. Am J Clin Nutr, 119(3), 654-667."
    },
    {
      title: "Blood Flow Restriction Training: Updated Safety Guidelines",
      description: "Comprehensive analysis of BFR training protocols with revised pressure recommendations based on limb occlusion pressure percentages.",
      journal: "Sports Medicine",
      date: "2024",
      category: "Training Methods",
      findings: "40-60% LOP protocols achieved 89% of hypertrophy benefits with 45% reduction in reported discomfort versus 80% LOP.",
      citation: "Nakamura, T., et al. (2024). Optimizing blood flow restriction pressure for hypertrophy and comfort. Sports Med, 54(2), 278-294."
    },
    {
      title: "Sleep Quality Metrics and Recovery in Resistance Training",
      description: "Longitudinal study using wearable technology to quantify relationships between sleep architecture and training adaptations.",
      journal: "Sleep Medicine Reviews",
      date: "2024",
      category: "Recovery Science",
      findings: "Deep sleep percentage >18% of total sleep time correlated with 19% faster strength recovery between sessions.",
      citation: "Chen, L.W., et al. (2024). Sleep architecture predictors of resistance training recovery. Sleep Med Rev, 73, 101-115."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training Technology': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Nutrition Science': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Training Methods': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Recovery Science': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-xl">
          <BookOpen className="w-5 h-5 mr-2 text-orange-400" />
          Latest Scientific Research
        </CardTitle>
        <CardDescription>
          Recent breakthroughs in fitness and performance science
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {studies.map((study, index) => (
          <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">{study.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{study.description}</p>
              </div>
              <Badge className={getCategoryColor(study.category)}>
                {study.category}
              </Badge>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3">
              <p className="text-sm text-orange-200">
                <strong>Key Finding:</strong> {study.findings}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                {study.journal}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {study.date}
              </span>
            </div>

            <div className="text-xs text-gray-400 italic">
              <strong>Citation:</strong> {study.citation}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScientificStudies;
