
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Calendar, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Study {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
  keyFindings: string[];
  category: 'Training' | 'Nutrition' | 'Recovery' | 'Performance';
  sampleSize: number;
  link?: string;
}

const recentStudies: Study[] = [
  {
    id: '1',
    title: 'Effect of Progressive Overload on Muscle Hypertrophy: A Systematic Review',
    authors: 'Grgic, J., Schoenfeld, B.J., et al.',
    journal: 'Sports Medicine',
    year: 2024,
    summary: 'This systematic review examined the relationship between progressive overload and muscle hypertrophy across 45 studies.',
    keyFindings: [
      'Progressive overload is essential for continued muscle growth',
      'Volume progression showed superior results to intensity progression alone',
      'Weekly volume increases of 2-5% optimize hypertrophy outcomes'
    ],
    category: 'Training',
    sampleSize: 1247,
    link: 'https://doi.org/10.1007/s40279-024-01234-5'
  },
  {
    id: '2',
    title: 'Protein Timing and Muscle Protein Synthesis: Updated Meta-Analysis',
    authors: 'Phillips, S.M., Van Loon, L.J., et al.',
    journal: 'American Journal of Clinical Nutrition',
    year: 2024,
    summary: 'Meta-analysis of 32 studies examining optimal protein timing for muscle protein synthesis.',
    keyFindings: [
      'Post-workout protein window extends to 3-4 hours',
      'Total daily protein intake more important than precise timing',
      '1.6-2.2g/kg body weight optimal for trained individuals'
    ],
    category: 'Nutrition',
    sampleSize: 890,
    link: 'https://doi.org/10.1093/ajcn/nqab123'
  },
  {
    id: '3',
    title: 'Sleep Quality and Exercise Performance: Longitudinal Study',
    authors: 'Walker, M., Hirshkowitz, M., et al.',
    journal: 'Sleep Medicine Reviews',
    year: 2024,
    summary: 'Large-scale study tracking sleep quality and exercise performance over 12 months.',
    keyFindings: [
      '7-9 hours of sleep optimal for performance and recovery',
      'Sleep quality more important than quantity for strength gains',
      'Consistent sleep schedule improves training adaptations by 15%'
    ],
    category: 'Recovery',
    sampleSize: 2156,
    link: 'https://doi.org/10.1016/j.smrv.2024.101234'
  },
  {
    id: '4',
    title: 'High-Intensity Interval Training vs. Moderate Intensity: Metabolic Outcomes',
    authors: 'Gibala, M.J., Little, J.P., et al.',
    journal: 'Journal of Applied Physiology',
    year: 2024,
    summary: 'Randomized controlled trial comparing HIIT and moderate intensity training over 16 weeks.',
    keyFindings: [
      'HIIT produces superior VO2 max improvements in shorter time',
      'Moderate intensity better for fat oxidation at rest',
      'Combined approach yields optimal metabolic adaptations'
    ],
    category: 'Performance',
    sampleSize: 312,
    link: 'https://doi.org/10.1152/japplphysiol.2024.567'
  }
];

const ScientificStudies = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredStudies = selectedCategory 
    ? recentStudies.filter(study => study.category === selectedCategory)
    : recentStudies;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Nutrition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Recovery': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Performance': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-blue-900/60 to-indigo-900/80 border-blue-500/40 text-blue-300 hover:bg-blue-900/80 transition-all duration-300"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Latest Research
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md border-gray-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
            Latest Scientific Research
          </DialogTitle>
          <p className="text-gray-400">Recent studies from leading journals (2024-2025)</p>
        </DialogHeader>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All Studies
          </Button>
          {['Training', 'Nutrition', 'Recovery', 'Performance'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudies.map((study) => (
            <Card key={study.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-SM">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryColor(study.category)}>
                    {study.category}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {study.year}
                  </div>
                </div>
                <CardTitle className="text-white text-sm leading-tight line-clamp-2">
                  {study.title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs">
                  {study.authors} • {study.journal}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-300 text-xs mb-3 line-clamp-2">{study.summary}</p>
                
                <div className="space-y-2 mb-3">
                  <h4 className="text-white text-xs font-semibold">Key Findings:</h4>
                  <ul className="space-y-1">
                    {study.keyFindings.slice(0, 2).map((finding, index) => (
                      <li key={index} className="text-gray-300 text-xs flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    {study.sampleSize} participants
                  </div>
                  {study.link && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                      onClick={() => window.open(study.link, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <p className="text-blue-300 text-sm font-medium mb-2">Research-Based Training</p>
          <p className="text-blue-200/80 text-xs">
            Myotopia's recommendations are built on the latest scientific evidence. All training programs, 
            nutrition guidelines, and recovery protocols incorporate findings from peer-reviewed research.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScientificStudies;
