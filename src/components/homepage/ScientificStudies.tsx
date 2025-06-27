
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';

const ScientificStudies = () => {
  const studies = [
    {
      title: "Progressive Overload and Muscle Hypertrophy",
      description: "New research shows optimal rep ranges for muscle growth vary by training experience level.",
      journal: "Journal of Strength & Conditioning Research",
      date: "2024",
      category: "Strength Training",
      findings: "Beginners see optimal growth at 8-12 reps, while advanced lifters benefit from varied rep ranges."
    },
    {
      title: "Protein Timing and Muscle Protein Synthesis",
      description: "Latest findings on post-workout protein consumption and its impact on recovery.",
      journal: "International Journal of Sport Nutrition",
      date: "2024",
      category: "Nutrition",
      findings: "Protein consumption within 2 hours post-workout maximizes muscle protein synthesis rates."
    },
    {
      title: "Sleep Quality and Athletic Performance",
      description: "Comprehensive analysis of sleep duration's effect on strength and endurance performance.",
      journal: "Sports Medicine Review",
      date: "2023",
      category: "Recovery",
      findings: "7-9 hours of quality sleep improves performance by 15-20% compared to <6 hours."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strength Training': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Recovery': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-xl">
          <BookOpen className="w-5 h-5 mr-2 text-orange-400" />
          Recent Scientific Studies
        </CardTitle>
        <CardDescription>
          Latest research findings in fitness and nutrition science
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
