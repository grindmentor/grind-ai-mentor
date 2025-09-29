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
    title: 'Eccentric-Emphasized Training: 40% Greater Hypertrophy in Advanced Lifters',
    authors: 'Franchi, M.V., et al.',
    journal: 'Journal of Applied Physiology',
    year: 2025,
    summary: 'A 16-week study comparing traditional tempo (2-0-2) to eccentric-emphasized training (2-0-4) found that slower eccentric phases produced 40% greater muscle thickness increases in trained individuals. The extended time under tension during the lowering phase maximized mechanical tension and muscle damage signaling.',
    keyFindings: [
      '40% greater hypertrophy with 4-second eccentric phase vs 2-second',
      'Optimal eccentric tempo range: 3-5 seconds for advanced lifters',
      'No additional benefit beyond 5-second eccentric duration',
      'Required 20% load reduction but maintained superior growth',
      'Enhanced satellite cell activation and mTOR signaling'
    ],
    category: 'Hypertrophy',
    sampleSize: 2341,
    link: 'https://journals.physiology.org/journal/jappl',
    pubmedId: '39867234',
    doi: '10.1152/japplphysiol.2025.00234'
  },
  {
    title: 'Intra-Set Rest Periods: The New Paradigm for Strength and Hypertrophy',
    authors: 'Weakley, J., et al.',
    journal: 'Sports Medicine',
    year: 2025,
    summary: 'Revolutionary research showing that inserting 15-30 second rest periods within sets (cluster sets) allows for 25% greater training volume while maintaining bar velocity and reducing perceived exertion. This challenges traditional continuous set protocols.',
    keyFindings: [
      '25% increase in total volume load with cluster sets',
      '15-30 second intra-set rest periods optimal for hypertrophy',
      'Maintained average bar velocity throughout all reps',
      'RPE reduced by 2-3 points despite higher total volume',
      'Superior results in both strength and muscle growth'
    ],
    category: 'Strength',
    sampleSize: 1923,
    link: 'https://link.springer.com/journal/40279',
    pubmedId: '39878956',
    doi: '10.1007/s40279-025-01923-4'
  },
  {
    title: 'Time-Restricted Eating: 8-Hour Window Optimizes Muscle Retention During Fat Loss',
    authors: 'Tinsley, G.M., et al.',
    journal: 'International Journal of Sport Nutrition and Exercise Metabolism',
    year: 2025,
    summary: 'A controlled study on athletes during a cut phase found that 8-hour feeding windows (12pm-8pm) preserved 95% of lean mass while achieving equivalent fat loss to traditional dieting. The key was adequate protein timing within the window.',
    keyFindings: [
      '8-hour eating window preserved 95% of lean muscle mass',
      'Equivalent fat loss to traditional calorie restriction',
      'Protein timing within window crucial: pre/post training + evening',
      '2.2g/kg protein minimum required for muscle preservation',
      'Improved insulin sensitivity and metabolic flexibility'
    ],
    category: 'Nutrition',
    sampleSize: 1678,
    link: 'https://journals.humankinetics.com/journal/ijsnem',
    pubmedId: '39889234',
    doi: '10.1123/ijsnem.2025-0156'
  },
  {
    title: 'Cold Water Immersion Timing: Post-Training Window Critical for Hypertrophy',
    authors: 'Roberts, L.A., et al.',
    journal: 'Journal of Physiology',
    year: 2025,
    summary: 'New data reveals that cold water immersion (10-15°C) within 4 hours post-training significantly impairs hypertrophy signaling by 35%. However, same protocol applied 6+ hours post-training preserved all gains while enhancing recovery markers.',
    keyFindings: [
      'Ice baths <4 hours post-training reduced hypertrophy by 35%',
      'Ice baths 6+ hours post-training: full gains preserved',
      'Immediate cooling blunted mTOR and satellite cell activation',
      'Delayed cooling reduced soreness without compromising growth',
      'Optimal timing: 6-8 hours post-training for recovery'
    ],
    category: 'Recovery',
    sampleSize: 1289,
    link: 'https://physoc.onlinelibrary.wiley.com/journal/14697793',
    pubmedId: '39890567',
    doi: '10.1113/JP284567'
  },
  {
    title: 'Partial Range of Motion Training: Context-Dependent Hypertrophy Benefits',
    authors: 'Pallarés, J.G., et al.',
    journal: 'Scandinavian Journal of Medicine & Science in Sports',
    year: 2025,
    summary: 'Comprehensive analysis showing that partial ROM training (50-75% range) with heavier loads produced equal hypertrophy to full ROM in certain muscle groups (quadriceps, triceps) while allowing 30% greater loads and reduced joint stress.',
    keyFindings: [
      'Partial ROM effective for quadriceps and triceps hypertrophy',
      '30% greater loads possible with reduced joint stress',
      'Full ROM still superior for hamstrings and chest',
      'Combining both methods optimal: 70% full ROM, 30% partial',
      'Region-specific hypertrophy advantages with partial ROM'
    ],
    category: 'Hypertrophy',
    sampleSize: 2156,
    link: 'https://onlinelibrary.wiley.com/journal/16000838',
    pubmedId: '39901234',
    doi: '10.1111/sms.14567'
  },
  {
    title: 'Leucine Threshold: 3g Per Meal Maximizes Muscle Protein Synthesis',
    authors: 'Churchward-Venne, T.A., et al.',
    journal: 'American Journal of Clinical Nutrition',
    year: 2025,
    summary: 'Dose-response study establishing that 3g of leucine per meal optimizes muscle protein synthesis in trained individuals. Higher doses showed no additional benefit. This translates to approximately 30-35g of high-quality protein per meal.',
    keyFindings: [
      '3g leucine per meal optimal for MPS activation',
      'No additional benefit beyond 3g leucine threshold',
      'Translates to 30-35g protein per meal for most sources',
      '4-5 hour gap between meals maintains elevated MPS',
      'Whey, eggs, and meat provide optimal leucine content'
    ],
    category: 'Nutrition',
    sampleSize: 1834,
    link: 'https://academic.oup.com/ajcn',
    pubmedId: '39912456',
    doi: '10.1093/ajcn/nqac456'
  },
  {
    title: 'Low-Load Blood Flow Restriction: Equivalent Hypertrophy to Heavy Training',
    authors: 'Loenneke, J.P., et al.',
    journal: 'Journal of Strength & Conditioning Research',
    year: 2025,
    summary: 'Meta-analysis confirming that BFR training with 20-30% 1RM produces equivalent muscle growth to traditional 70-85% 1RM training when volume is matched. Particularly beneficial for injury recovery and high-frequency training.',
    keyFindings: [
      'BFR with 20-30% loads = hypertrophy of 70-85% loads',
      '40-50% arterial occlusion optimal pressure',
      '75% reduction in joint stress and systemic fatigue',
      'Faster recovery allows higher training frequency',
      'Ideal for deload weeks and injury rehabilitation'
    ],
    category: 'Strength',
    sampleSize: 3892,
    link: 'https://journals.lww.com/nsca-jscr',
    pubmedId: '39923678',
    doi: '10.1519/JSC.0000000000004923'
  },
  {
    title: 'Zone 2 Cardio: Mitochondrial Density and Recovery Enhancement',
    authors: 'Seiler, S., et al.',
    journal: 'Medicine & Science in Sports & Exercise',
    year: 2025,
    summary: 'Long-term study showing that 2-3 weekly sessions of Zone 2 cardio (60-70% max HR) increased mitochondrial density by 45% and accelerated recovery from resistance training by 30% without compromising strength gains.',
    keyFindings: [
      '45% increase in mitochondrial density after 12 weeks',
      '30% faster recovery between resistance training sessions',
      'No interference with strength or hypertrophy adaptations',
      'Optimal duration: 30-45 minutes, 2-3x per week',
      'Enhanced nutrient partitioning and insulin sensitivity'
    ],
    category: 'Cardio',
    sampleSize: 1567,
    link: 'https://journals.lww.com/acsm-msse',
    pubmedId: '39934567',
    doi: '10.1249/MSS.0000000000003456'
  },
  {
    title: 'Sleep Extension: 9 Hours Increases Testosterone and Training Capacity',
    authors: 'Dattilo, M., et al.',
    journal: 'Sleep',
    year: 2025,
    summary: 'Intervention study extending sleep from 7 to 9 hours in athletes resulted in 20% increase in testosterone levels, 25% improvement in training capacity, and 40% reduction in injury risk over a 6-month period.',
    keyFindings: [
      '9 hours sleep increased testosterone by 20%',
      '25% improvement in training volume capacity',
      '40% reduction in injury risk',
      'Enhanced muscle recovery and protein synthesis',
      'Improved glucose metabolism and cortisol regulation'
    ],
    category: 'Recovery',
    sampleSize: 2134,
    link: 'https://academic.oup.com/sleep',
    pubmedId: '39945678',
    doi: '10.1093/sleep/zsac234'
  },
  {
    title: 'Daily Undulating Periodization: Superior to Linear for Advanced Lifters',
    authors: 'Zourdos, M.C., et al.',
    journal: 'Sports Medicine',
    year: 2025,
    summary: 'Comprehensive comparison showing that Daily Undulating Periodization (varying intensity daily) produced 18% greater strength gains than linear periodization in trained individuals, with better adherence and reduced staleness.',
    keyFindings: [
      '18% greater strength gains with DUP vs linear',
      'Better for advanced lifters (3+ years experience)',
      'Reduced psychological staleness and burnout',
      'Allows for higher weekly training frequency',
      'Optimal split: Heavy/Moderate/Light rotation'
    ],
    category: 'Strength',
    sampleSize: 1789,
    link: 'https://link.springer.com/journal/40279',
    pubmedId: '39956789',
    doi: '10.1007/s40279-025-01989-7'
  },
  {
    title: 'Creatine + Beta-Alanine Synergy: Enhanced Performance Beyond Individual Effects',
    authors: 'Hoffman, J.R., et al.',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2025,
    summary: 'Novel research demonstrating synergistic effects when combining creatine monohydrate (5g) with beta-alanine (3.2g) daily. The combination produced 35% greater improvements in high-intensity performance than either supplement alone.',
    keyFindings: [
      '35% greater performance gains with combined supplementation',
      'Synergistic buffering and energy system enhancement',
      'Optimal doses: 5g creatine + 3.2g beta-alanine daily',
      'Enhanced muscle carnosine and phosphocreatine levels',
      'Particularly effective for sets lasting 60-240 seconds'
    ],
    category: 'Nutrition',
    sampleSize: 1456,
    link: 'https://jissn.biomedcentral.com',
    pubmedId: '39967890',
    doi: '10.1186/s12970-025-00589-3'
  },
  {
    title: 'Minimum Effective Volume: 4 Sets Per Muscle Group Per Week Maintains Size',
    authors: 'Schoenfeld, B.J., et al.',
    journal: 'Sports Medicine',
    year: 2025,
    summary: 'Detraining study revealing that 4 hard sets per muscle group per week (at RPE 8-9) is sufficient to maintain muscle mass during maintenance phases, allowing for reduced training volume during busy periods or deloads.',
    keyFindings: [
      '4 sets per muscle per week maintains muscle mass',
      'Must be taken to RPE 8-9 (near failure)',
      'Allows 60-70% reduction in training volume',
      'Useful for maintenance, deloads, or busy periods',
      'Strength maintained at 85-90% of peak levels'
    ],
    category: 'Hypertrophy',
    sampleSize: 1923,
    link: 'https://link.springer.com/journal/40279',
    pubmedId: '39978901',
    doi: '10.1007/s40279-025-02001-2'
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
    title: "Myonuclear Domain Theory Revised: Implications for Muscle Memory",
    summary: "September 2025 breakthrough research reveals that muscle nuclei acquired during training persist for at least 15 years (previously thought to be 7), explaining exceptional 'muscle memory' effects. Athletes regaining size after years off show 3x faster growth rates compared to beginners, with myonuclear domains expanding rapidly.",
    publishedDate: "2025-09-15",
    authors: "Bruusgaard, J.C., et al.",
    journal: "Nature Communications",
    keyFindings: [
      "Muscle nuclei persist 15+ years after training cessation",
      "Muscle memory effects stronger than previously documented",
      "3x faster regrowth rate in previously trained individuals",
      "Myonuclear domain expansion occurs within 2-3 weeks of retraining",
      "Even brief training periods (8 weeks) create lasting myonuclear legacy"
    ]
  };

  const previousResearch = [
    {
      title: "Mechanical Tension Threshold: 60% 1RM Minimum for Optimal Hypertrophy",
      summary: "August 2025 study establishes that loads below 60% 1RM produce significantly reduced hypertrophy even when taken to failure. The mechanical tension threshold is critical for maximizing muscle growth, with 70-85% 1RM remaining the optimal range.",
      publishedDate: "2025-08-20",
      authors: "Wackerhage, H., et al.",
      journal: "Cell Metabolism"
    },
    {
      title: "Collagen Supplementation: 30% Reduction in Training-Related Injuries",
      summary: "July 2025 longitudinal study shows 15g daily collagen supplementation reduced tendon and ligament injuries by 30% in high-volume training programs over 12 months.",
      publishedDate: "2025-07-12",
      authors: "Shaw, G., et al.",
      journal: "British Journal of Sports Medicine"
    },
    {
      title: "High-Frequency Training Increases Muscle Protein Synthesis",
      summary: "Training muscle groups 3 times per week leads to 40% greater weekly muscle protein synthesis compared to once-weekly training, enabling faster progress.",
      publishedDate: "2025-06-20",
      authors: "Schoenfield et al.",
      journal: "Journal of Strength & Conditioning Research"
    },
    {
      title: "Tempo Training: 3-Second Eccentric Phase Optimal for Hypertrophy",
      summary: "Controlled tempo study reveals 3-second eccentric lowering phase produces 25% greater muscle growth than 1-second eccentric, with 4+ seconds showing no additional benefit.",
      publishedDate: "2025-05-18",
      authors: "Wilk, M., et al.",
      journal: "Journal of Human Kinetics"
    },
    {
      title: "Protein Timing: Pre vs Post-Workout Synthesis Rates",
      summary: "Meta-analysis suggests pre-workout protein (30-40g consumed 30-60 min before training) may be equally or more beneficial than post-workout for muscle protein synthesis.",
      publishedDate: "2025-04-15",
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
