
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';

const ScientificStudies = () => {
  const studies = [
    {
      title: "AI-Guided Training vs Traditional Programming",
      description: "Comparative study on AI-assisted workout programming effectiveness in recreational athletes.",
      journal: "Journal of Sports Science & Medicine",
      date: "2025",
      category: "Training Technology",
      findings: "AI-guided programs showed 23% greater strength gains and 18% better adherence rates compared to static programs."
    },
    {
      title: "Circadian Rhythm Optimization for Recovery",
      description: "New research on timing sleep and nutrition for enhanced muscle protein synthesis.",
      journal: "Sleep & Performance Research",
      date: "2025",
      category: "Recovery Science",
      findings: "Athletes following circadian-optimized schedules showed 15% faster recovery and improved sleep quality scores."
    },
    {
      title: "Micronutrient Timing and Exercise Performance",
      description: "Latest findings on specific vitamin and mineral timing around workouts for optimal performance.",
      journal: "International Journal of Sport Nutrition",
      date: "2025",
      category: "Nutrition",
      findings: "Strategic micronutrient timing improved power output by 12% and reduced fatigue markers by 20%."
    },
    {
      title: "Blood Flow Restriction Training Protocols",
      description: "Updated safety guidelines and effectiveness data for BFR training in various populations.",
      journal: "Strength & Conditioning Research",
      date: "2025",
      category: "Training Methods",
      findings: "New low-pressure protocols achieved similar hypertrophy benefits with 40% reduced discomfort ratings."
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training Technology': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Recovery Science': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Training Methods': return 'bg-red-500/20 text-red-400 border-red-500/30';
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
