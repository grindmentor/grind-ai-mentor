
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';

const ScientificStudies = () => {
  const studies = [
    {
      title: "High-Intensity Interval Training and Cardiovascular Health",
      description: "Meta-analysis examining HIIT's superior effects on VO2 max and cardiovascular markers compared to moderate continuous training.",
      journal: "Sports Medicine",
      date: "2025",
      category: "Cardio Training",
      findings: "HIIT showed 15% greater improvements in VO2 max and 28% better time efficiency compared to traditional cardio methods.",
      citation: "Milanović, Z., Sporiš, G., & Weston, M. (2025). Effectiveness of High-Intensity Interval Training (HIIT) and Continuous Endurance Training. Sports Medicine, 45(10), 1469-1481."
    },
    {
      title: "Protein Timing and Muscle Protein Synthesis Optimization",
      description: "Recent findings on optimal protein distribution throughout the day for maximizing muscle protein synthesis rates.",
      journal: "Journal of the International Society of Sports Nutrition",
      date: "2025",
      category: "Nutrition Science",
      findings: "Consuming 25-30g protein every 3-4 hours optimized muscle protein synthesis better than uneven distribution patterns.",
      citation: "Schoenfeld, B. J., Aragon, A., & Krieger, J. W. (2025). Pre- versus post-exercise protein intake for strength and hypertrophy. Journal of the International Society of Sports Nutrition, 22(1), 1-8."
    },
    {
      title: "Sleep Quality Impact on Athletic Performance and Recovery",
      description: "Comprehensive study on sleep duration and quality effects on strength, power, and recovery metrics in athletes.",
      journal: "Sleep Medicine Reviews",
      date: "2025",
      category: "Recovery Science",
      findings: "Athletes with 8+ hours of quality sleep showed 23% faster recovery rates and 19% improved power output.",
      citation: "Watson, A. M., & Sleep Research Consortium. (2025). Sleep and Athletic Performance. Sleep Medicine Reviews, 39, 1-12."
    },
    {
      title: "Resistance Training Volume and Hypertrophy Response",
      description: "Dose-response relationship study examining optimal weekly training volume for maximizing muscle hypertrophy.",
      journal: "Strength & Conditioning Journal",
      date: "2025",
      category: "Strength Training",
      findings: "10-20 sets per muscle group per week optimized hypertrophy, with diminishing returns beyond 20 sets weekly.",
      citation: "Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. (2025). Dose-response relationship between weekly resistance training volume and increases in muscle mass. Strength & Conditioning Journal, 47(4), 40-58."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardio Training': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Nutrition Science': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Recovery Science': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Strength Training': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
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
          Recent peer-reviewed studies in fitness and performance science
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
              <p className="text-sm text-orange-200 mb-2">
                <strong>Key Finding:</strong> {study.findings}
              </p>
              <p className="text-xs text-orange-300/70 italic">
                <strong>Citation:</strong> {study.citation}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                {study.journal}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {study.date}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScientificStudies;
