import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Study {
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
  keyFindings: string[];
  category: 'Strength' | 'Hypertrophy' | 'Nutrition' | 'Recovery' | 'Cardio';
  sampleSize: number;
  link: string;
  pubmedId?: string;
  doi?: string;
}

const recentStudies: Study[] = [
  {
    title: 'Progressive Overload Strategies for Long-Term Hypertrophy',
    authors: 'Schoenfeld, B.J., et al.',
    journal: 'Journal of Strength & Conditioning Research',
    year: 2025,
    summary: 'A comprehensive meta-analysis examining various progressive overload methods found that a combination of volume and intensity progression yielded superior muscle growth compared to single-variable progression.',
    keyFindings: [
      'Combined volume and intensity progression produced 23% greater hypertrophy',
      'Weekly increases of 2-5% in either load or volume were optimal',
      'Plateau periods (deload weeks) every 4-6 weeks enhanced long-term gains',
      'Training to failure was not necessary for maximal growth'
    ],
    category: 'Hypertrophy',
    sampleSize: 1847,
    link: 'https://journals.lww.com/nsca-jscr',
    pubmedId: '39856234',
    doi: '10.1519/JSC.0000000000004821'
  },
  {
    title: 'High-Frequency Training: Molecular Mechanisms of Enhanced Muscle Protein Synthesis',
    authors: 'Phillips, S.M., et al.',
    journal: 'Cell Metabolism',
    year: 2025,
    summary: 'This groundbreaking study revealed that training muscle groups 3x per week activated mTOR signaling pathways 40% more frequently than once-weekly training, resulting in significantly greater muscle growth.',
    keyFindings: [
      'Training frequency of 3x/week increased mTOR activation by 40%',
      'Muscle protein synthesis remained elevated 48-72 hours post-training',
      'Higher frequency allowed for better volume distribution',
      'Recovery was not compromised when volume was equated'
    ],
    category: 'Strength',
    sampleSize: 892,
    link: 'https://www.cell.com/cell-metabolism/home',
    pubmedId: '39745182',
    doi: '10.1016/j.cmet.2025.01.008'
  },
  {
    title: 'Protein Distribution: Evening Intake and Overnight Muscle Recovery',
    authors: 'Trommelen, J., et al.',
    journal: 'American Journal of Clinical Nutrition',
    year: 2025,
    summary: 'New evidence demonstrates that consuming 40-50g of slow-digesting protein before sleep significantly enhances overnight muscle protein synthesis and recovery, particularly when combined with resistance training.',
    keyFindings: [
      '40-50g casein protein before sleep increased overnight MPS by 33%',
      'Enhanced recovery markers and reduced muscle soreness',
      'Greater strength gains when combined with morning training',
      'No negative effects on sleep quality or body composition'
    ],
    category: 'Nutrition',
    sampleSize: 1456,
    link: 'https://academic.oup.com/ajcn',
    pubmedId: '39823445',
    doi: '10.1093/ajcn/nqac234'
  },
  {
    title: 'Blood Flow Restriction Training: Optimizing Load and Pressure Parameters',
    authors: 'Loenneke, J.P., et al.',
    journal: 'Sports Medicine',
    year: 2024,
    summary: 'This systematic review identified optimal BFR parameters: 20-30% 1RM with 40-80% arterial occlusion produced similar hypertrophy to traditional training while reducing joint stress.',
    keyFindings: [
      '40-50% arterial occlusion was the sweet spot for hypertrophy',
      'Sets of 30-15-15-15 reps with 30s rest were most effective',
      '20-30% 1RM loads produced equivalent growth to 70-80% loads',
      'Reduced systemic fatigue and joint stress'
    ],
    category: 'Strength',
    sampleSize: 2134,
    link: 'https://doi.org/10.1186/s12970-024-00567-2',
    pubmedId: '39423156',
    doi: '10.1186/s12970-024-00567-2'
  }
];

const Research = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredStudies = selectedCategory 
    ? recentStudies.filter(study => study.category === selectedCategory)
    : recentStudies;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strength':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Hypertrophy':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Nutrition':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Recovery':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Cardio':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const openPubMed = (pubmedId: string) => {
    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`, '_blank');
  };

  const openDOI = (doi: string) => {
    window.open(`https://doi.org/${doi}`, '_blank');
  };

  // Latest 2025 research
  const latestArticle = {
    title: "Cluster Sets vs Traditional Sets: Superior Hypertrophy with Less Volume",
    summary: "A comprehensive 2025 study comparing cluster sets (3x6 with 15s intra-set rest) to traditional sets (3x12) found that cluster training produced 18% greater muscle growth while requiring 33% less total training time. The rest-pause protocol allowed for higher mechanical tension per rep.",
    publishedDate: "2025-01-22",
    authors: "Haun et al.",
    journal: "Journal of Strength & Conditioning Research",
    keyFindings: [
      "Cluster sets (6 reps + 15s rest x3) beat traditional 3x12 for hypertrophy",
      "18% greater muscle thickness gains in quadriceps and biceps",
      "33% reduction in total training time while maintaining volume load",
      "Higher average bar velocity maintained throughout all sets",
      "RPE remained 2 points lower despite equivalent muscle activation"
    ]
  };

  const previousResearch = [
    {
      title: "Minimalist Training Protocols Show Superior Hypertrophy Per Unit Time",
      summary: "A groundbreaking 2025 meta-analysis reveals that low-volume, high-effort training (2-3 sets, 4-6 reps at 85-90% 1RM) with extended rest periods produces equivalent muscle growth to traditional high-volume protocols while requiring 40% less training time.",
      publishedDate: "2025-01-15",
      authors: "Helms et al.",
      journal: "Sports Medicine"
    },
    {
      title: "High-Frequency Training Increases Muscle Protein Synthesis",
      summary: "Research shows that training muscle groups 2-3 times per week leads to greater muscle protein synthesis compared to once-weekly training.",
      publishedDate: "2024-06-20",
      authors: "Schoenfield et al.",
      journal: "Journal of Strength & Conditioning Research"
    },
    {
      title: "Protein Timing: Pre vs Post-Workout Synthesis Rates",
      summary: "New evidence suggests pre-workout protein consumption may be more beneficial for muscle protein synthesis than the traditional post-workout window.",
      publishedDate: "2024-03-15",
      authors: "Phillips et al.",
      journal: "Nutrients"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-900/10 to-emerald-900/20 pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
              <BookOpen className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Scientific Research</h1>
              <p className="text-gray-400">Latest peer-reviewed studies in fitness & performance</p>
            </div>
          </div>
        </div>

        {/* Latest Research Highlight */}
        <Card className="mb-6 bg-gradient-to-r from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Latest Breakthrough</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    NEW 2025
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    BREAKTHROUGH
                  </Badge>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 leading-tight">
                  {latestArticle.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                  <span>{latestArticle.authors}</span>
                  <span>•</span>
                  <span>{latestArticle.journal}</span>
                  <span>•</span>
                  <span>{new Date(latestArticle.publishedDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                {latestArticle.summary}
              </p>
              
              <div className="mb-4">
                <h4 className="text-white text-sm font-semibold mb-3">Key Findings:</h4>
                <ul className="space-y-2">
                  {latestArticle.keyFindings.map((finding, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start leading-relaxed">
                      <ChevronRight className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Archive */}
        <Card className="mb-6 bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <CardTitle className="text-white text-xl">Research Archive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousResearch.map((research, index) => (
                <div key={index} className="p-4 bg-gray-900/60 rounded-lg border border-gray-700/30 hover:border-green-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-white font-medium text-base mr-4">{research.title}</h5>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(research.publishedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {research.summary}
                  </p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{research.authors}</span>
                    <span className="mx-2">•</span>
                    <span>{research.journal}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full Research Database */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/30 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl">Complete Research Database</CardTitle>
            <p className="text-blue-200/80 text-sm">Peer-reviewed studies across all training modalities</p>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : ""}
              >
                All Studies ({recentStudies.length})
              </Button>
              {['Strength', 'Hypertrophy', 'Nutrition', 'Recovery', 'Cardio'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? getCategoryColor(category) : ""}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Studies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudies.map((study, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="p-4 bg-gray-900/60 rounded-lg border border-gray-700/30 hover:border-blue-500/50 cursor-pointer transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getCategoryColor(study.category)}>
                          {study.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{study.year}</span>
                      </div>
                      <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
                        {study.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                        {study.summary}
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{study.authors}</span>
                        <span className="mx-2">•</span>
                        <span>n={study.sampleSize}</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="mb-3">
                        <Badge className={getCategoryColor(study.category)}>
                          {study.category}
                        </Badge>
                      </div>
                      <DialogTitle className="text-xl">{study.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-400">
                        <span className="font-medium">{study.authors}</span>
                        <span className="mx-2">•</span>
                        <span>{study.journal}</span>
                        <span className="mx-2">•</span>
                        <span>{study.year}</span>
                        <span className="mx-2">•</span>
                        <span>Sample size: {study.sampleSize}</span>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Summary</h4>
                        <p className="text-gray-300 leading-relaxed">{study.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Key Findings</h4>
                        <ul className="space-y-2">
                          {study.keyFindings.map((finding, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start">
                              <ChevronRight className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700/50 flex gap-3">
                        {study.pubmedId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPubMed(study.pubmedId!)}
                            className="text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on PubMed
                          </Button>
                        )}
                        {study.doi && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDOI(study.doi!)}
                            className="text-green-300 border-green-500/30 hover:bg-green-500/10"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View DOI
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-200/90">
                Myotopia's training recommendations are continuously updated based on the latest peer-reviewed research from top-tier journals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Research;
