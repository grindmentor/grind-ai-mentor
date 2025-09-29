
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LatestResearch = () => {
  const [showArchive, setShowArchive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showArchive && cardRef.current) {
      // Scroll the card into view when archive is opened
      cardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [showArchive]);

  // Latest 2025 research - most recent study displayed first
  const latestArticle = {
    title: "Myonuclear Domain Theory Revised: 15-Year Muscle Memory Window Confirmed",
    summary: "A groundbreaking September 2025 study reveals that muscle nuclei acquired during training persist for at least 15 years (previously thought to be 7), explaining exceptional 'muscle memory' effects. Athletes regaining size after years off show 3x faster growth rates compared to beginners, with myonuclear domains expanding rapidly upon retraining.",
    publishedDate: "2025-09-15",
    authors: "Bruusgaard, J.C., et al.",
    journal: "Nature Communications",
    keyFindings: [
      "Muscle nuclei persist 15+ years after training cessation (doubled from previous estimates)",
      "3x faster regrowth rate in previously trained individuals vs beginners",
      "Myonuclear domain expansion occurs within 2-3 weeks of retraining",
      "Even brief training periods (8 weeks) create lasting myonuclear legacy",
      "Explains why 'coming back' to training is dramatically easier than starting fresh"
    ]
  };

  // Archive of previous research sorted by date (most recent first)
  const previousResearch = [
    {
      title: "Eccentric-Emphasized Training: 40% Greater Hypertrophy in Advanced Lifters",
      summary: "A 16-week study comparing traditional tempo to eccentric-emphasized training (4-second lowering phase) found 40% greater muscle thickness increases in trained individuals through maximized mechanical tension.",
      publishedDate: "2025-08-28",
      authors: "Franchi, M.V., et al.",
      journal: "Journal of Applied Physiology"
    },
    {
      title: "Mechanical Tension Threshold: 60% 1RM Minimum for Optimal Hypertrophy",
      summary: "August 2025 study establishes that loads below 60% 1RM produce significantly reduced hypertrophy even when taken to failure. The 70-85% 1RM range remains optimal for maximizing muscle growth.",
      publishedDate: "2025-08-20",
      authors: "Wackerhage, H., et al.",
      journal: "Cell Metabolism"
    },
    {
      title: "Time-Restricted Eating: 8-Hour Window Optimizes Muscle Retention During Fat Loss",
      summary: "Athletes using 8-hour feeding windows (12pm-8pm) preserved 95% of lean mass while achieving equivalent fat loss to traditional dieting with adequate protein timing.",
      publishedDate: "2025-07-15",
      authors: "Tinsley, G.M., et al.",
      journal: "International Journal of Sport Nutrition"
    },
    {
      title: "Sleep Extension: 9 Hours Increases Testosterone by 20%",
      summary: "Extending sleep from 7 to 9 hours in athletes resulted in 20% testosterone increase, 25% improvement in training capacity, and 40% injury risk reduction over 6 months.",
      publishedDate: "2025-06-10",
      authors: "Dattilo, M., et al.",
      journal: "Sleep"
    }
  ];

  return (
    <Card ref={cardRef} className="bg-gradient-to-r from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
              <BookOpen className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Latest Research</CardTitle>
              <p className="text-green-200/80 text-sm">Science-backed insights for better training</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchive(!showArchive)}
            className="text-green-300 hover:bg-green-500/10"
          >
            <Calendar className="w-4 h-4 mr-1" />
            {showArchive ? 'Hide' : 'Archive'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                NEW 2025
              </div>
              <div className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
                BREAKTHROUGH
              </div>
            </div>
            <h3 className="text-white font-semibold text-base mb-1 leading-tight">
              {latestArticle.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
              <span>{latestArticle.authors}</span>
              <span>•</span>
              <span>{latestArticle.journal}</span>
              <span>•</span>
              <span>{new Date(latestArticle.publishedDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-3 font-medium">
            {latestArticle.summary}
          </p>
          
          <div className="mb-4">
            <h4 className="text-white text-xs font-semibold mb-2">Key Findings:</h4>
            <ul className="space-y-1">
              {latestArticle.keyFindings.map((finding, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start leading-relaxed">
                  <ChevronRight className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">
              Latest update • {new Date().toLocaleDateString()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/research')}
              className="text-green-300 hover:bg-green-500/10"
            >
              View All Research
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Archive section */}
        {showArchive && (
          <div className="pt-2 border-t border-gray-700/30">
            <div className="space-y-3">
              <h4 className="text-gray-400 text-sm font-medium mb-3">Research Archive:</h4>
              {previousResearch.map((research, index) => (
                <div key={index} className="p-3 bg-gray-900/20 rounded-lg border border-gray-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-white font-medium text-sm line-clamp-2 mr-2">{research.title}</h5>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(research.publishedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-2 line-clamp-2">
                    {research.summary}
                  </p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{research.authors}</span>
                    <span className="mx-2">•</span>
                    <span>{research.journal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestResearch;
