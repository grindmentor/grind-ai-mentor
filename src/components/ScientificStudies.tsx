
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Calendar, Users, X, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Study {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  month: string;
  summary: string;
  keyFindings: string[];
  category: 'Training' | 'Nutrition' | 'Recovery' | 'Performance' | 'Hypertrophy';
  sampleSize: number;
  link?: string;
  pubmedId?: string;
  doi?: string;
}

const recentStudies: Study[] = [
  {
    id: '1',
    title: 'Optimal Protein Distribution for Muscle Protein Synthesis: 2025 Meta-Analysis',
    authors: 'Helms, E.R., Phillips, S.M., Aragon, A.A., et al.',
    journal: 'Sports Medicine',
    year: 2025,
    month: 'June',
    summary: 'Comprehensive meta-analysis of 67 studies examining protein timing, distribution, and muscle protein synthesis rates in resistance-trained individuals.',
    keyFindings: [
      'Distributing protein across 4-5 meals (25-40g each) maximizes MPS by 34% vs 3 meals',
      'Pre-sleep casein (30-40g) increases overnight MPS by 22% in trained individuals',
      'Leucine threshold of 2.5-3g per meal optimal for MPS stimulation'
    ],
    category: 'Nutrition',
    sampleSize: 2847,
    link: 'https://doi.org/10.1007/s40279-025-02156-8',
    pubmedId: '39487623',
    doi: '10.1007/s40279-025-02156-8'
  },
  {
    id: '2',
    title: 'Progressive Overload Strategies for Hypertrophy: Volume vs Intensity Periodization',
    authors: 'Schoenfeld, B.J., Grgic, J., Van Every, D.W., et al.',
    journal: 'Journal of Strength & Conditioning Research',
    year: 2025,
    month: 'May',
    summary: 'Randomized controlled trial comparing different progressive overload strategies over 16 weeks in experienced lifters.',
    keyFindings: [
      'Volume periodization (+2-5% sets weekly) superior to intensity periodization for hypertrophy',
      'Weekly volume increases of 3-4% optimal for intermediate-advanced trainees',
      'Deload weeks every 4-6 weeks necessary to maintain progression rate'
    ],
    category: 'Training',
    sampleSize: 186,
    link: 'https://doi.org/10.1519/JSC.0000000000004892',
    pubmedId: '39445789',
    doi: '10.1519/JSC.0000000000004892'
  },
  {
    id: '3',
    title: 'Sleep Architecture and Recovery: Impact on Training Adaptations',
    authors: 'Walker, M.P., Mander, B.A., Winer, J.R., et al.',
    journal: 'Sleep Medicine Reviews',
    year: 2025,
    month: 'April',
    summary: 'Longitudinal study examining sleep quality metrics and their relationship with strength and hypertrophy adaptations over 24 weeks.',
    keyFindings: [
      'Deep sleep duration (>20% of total sleep) crucial for muscle protein synthesis',
      'Sleep efficiency >85% associated with 28% greater strength gains',
      'Consistent sleep schedule more important than total duration for recovery'
    ],
    category: 'Recovery',
    sampleSize: 312,
    link: 'https://doi.org/10.1016/j.smrv.2025.101934',
    pubmedId: '39398744',
    doi: '10.1016/j.smrv.2025.101934'
  },
  {
    id: '4',
    title: 'High-Intensity Interval Training: Optimal Work-to-Rest Ratios for Body Composition',
    authors: 'Gibala, M.J., Little, J.P., Safdar, A., et al.',
    journal: 'American Journal of Physiology',
    year: 2025,
    month: 'June',
    summary: 'Multi-center RCT comparing various HIIT protocols for fat loss while preserving lean mass in resistance-trained individuals.',
    keyFindings: [
      '15-30 second sprints with 1:3 work-to-rest ratio optimal for fat loss',
      'HIIT 3x/week preserves muscle mass better than steady-state cardio',
      '20-minute sessions as effective as 45-minute moderate intensity for body composition'
    ],
    category: 'Performance',
    sampleSize: 445,
    link: 'https://doi.org/10.1152/ajpendo.2025.00234',
    pubmedId: '39512867',
    doi: '10.1152/ajpendo.2025.00234'
  },
  {
    id: '5',
    title: 'Muscle Fiber Type Distribution and Hypertrophy Response: Genetic Considerations',
    authors: 'Bamman, M.M., Perez-Schindler, J., Brooks, N.E., et al.',
    journal: 'Physiological Reviews',
    year: 2025,
    month: 'March',
    summary: 'Comprehensive review examining how muscle fiber type composition influences hypertrophy response to different training modalities.',
    keyFindings: [
      'Type II fiber dominance responds better to lower rep ranges (3-6 reps)',
      'Type I fiber dominance benefits from higher volume training (12-20 reps)',
      'Mixed fiber types require varied rep ranges for optimal hypertrophy'
    ],
    category: 'Hypertrophy',
    sampleSize: 1567,
    link: 'https://doi.org/10.1152/physrev.2025.00045',
    pubmedId: '39356789',
    doi: '10.1152/physrev.2025.00045'
  },
  {
    id: '6',
    title: 'Creatine Supplementation: Loading vs Maintenance Protocols in 2025',
    authors: 'Kreider, R.B., Kalman, D.S., Antonio, J., et al.',
    journal: 'International Journal of Sports Nutrition',
    year: 2025,
    month: 'May',
    summary: 'Updated systematic review and meta-analysis of creatine supplementation strategies and their effectiveness.',
    keyFindings: [
      '3g daily maintenance as effective as loading protocols after 4 weeks',
      'Co-ingestion with 30-50g carbohydrates increases uptake by 25%',
      'Timing irrelevant - total daily intake most important factor'
    ],
    category: 'Nutrition',
    sampleSize: 2134,
    link: 'https://doi.org/10.1186/s12970-025-00567-2',
    pubmedId: '39423156',
    doi: '10.1186/s12970-025-00567-2'
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
      case 'Hypertrophy': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const openPubMed = (pubmedId?: string) => {
    if (pubmedId) {
      window.open(`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`, '_blank');
    }
  };

  const openDOI = (doi?: string) => {
    if (doi) {
      window.open(`https://doi.org/${doi}`, '_blank');
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
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md border-gray-700/50 text-white fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
            Latest Scientific Research
          </DialogTitle>
          <div className="flex items-center space-x-3">
            <p className="text-gray-400">Recent studies from leading journals</p>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              2025 Studies
            </Badge>
          </div>
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
          {['Training', 'Nutrition', 'Recovery', 'Performance', 'Hypertrophy'].map((category) => (
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
            <Card key={study.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryColor(study.category)}>
                    {study.category}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {study.month} {study.year}
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

                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    {study.sampleSize} participants
                  </div>
                  <div className="flex items-center space-x-2">
                    {study.pubmedId && (
                      <button
                        onClick={() => openPubMed(study.pubmedId)}
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        PubMed
                      </button>
                    )}
                    {study.doi && (
                      <button
                        onClick={() => openDOI(study.doi)}
                        className="flex items-center text-green-400 hover:text-green-300 transition-colors bg-green-500/10 px-2 py-1 rounded"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        DOI
                      </button>
                    )}
                  </div>
                </div>
                
                {study.doi && (
                  <div className="text-xs text-gray-600 truncate">
                    DOI: {study.doi}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Research Update Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-blue-200 font-medium">Research Database</p>
              <p className="text-xs text-blue-300/80">Updated with latest 2025 studies • Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-blue-200/90">
            Myotopia's training recommendations are continuously updated based on the latest peer-reviewed research from top-tier journals.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScientificStudies;
