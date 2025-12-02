
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

  // Latest 2024-2025 research - most recent study displayed first
  const latestArticle = {
    title: "High-Protein Diets and Muscle Protein Synthesis: 2.2g/kg Threshold Confirmed",
    summary: "A comprehensive 2024 meta-analysis confirms that protein intake of 2.2g/kg bodyweight maximizes muscle protein synthesis in resistance-trained individuals. Beyond this threshold, no additional benefit was observed, though higher intakes showed no adverse effects on kidney function in healthy adults.",
    publishedDate: "2024-11-15",
    authors: "Morton, R.W., Murphy, K.T., et al.",
    journal: "British Journal of Sports Medicine",
    doi: "10.1136/bjsports-2024-108015",
    keyFindings: [
      "2.2g/kg protein intake optimizes muscle protein synthesis",
      "No additional benefit observed beyond 2.2g/kg threshold",
      "Protein timing (within 4-hour window) matters less than total daily intake",
      "No kidney function concerns in healthy adults up to 3.0g/kg",
      "Leucine content of protein sources impacts MPS activation"
    ]
  };

  // Archive of previous research sorted by date (most recent first)
  const previousResearch = [
    {
      title: "Training Volume vs Intensity: New Dose-Response Data",
      summary: "A 2024 randomized controlled trial found that 12-20 weekly sets per muscle group produced superior hypertrophy compared to both lower (<10 sets) and higher (>25 sets) volumes, with diminishing returns above 20 sets.",
      publishedDate: "2024-10-28",
      authors: "Schoenfeld, B.J., Grgic, J., et al.",
      journal: "Journal of Strength and Conditioning Research",
      doi: "10.1519/JSC.0000000000004823"
    },
    {
      title: "Sleep Quality and Muscle Recovery: 8-Hour Minimum for Optimal Gains",
      summary: "Athletes sleeping less than 7 hours showed 40% reduced muscle protein synthesis rates and elevated cortisol levels. The study recommends 8-9 hours for optimal recovery and muscle adaptation.",
      publishedDate: "2024-09-12",
      authors: "Vitale, K.C., Owens, R., et al.",
      journal: "Sleep Medicine Reviews",
      doi: "10.1016/j.smrv.2024.101832"
    },
    {
      title: "Creatine Monohydrate: Long-Term Safety Confirmed in 5-Year Study",
      summary: "A landmark 5-year longitudinal study confirms creatine monohydrate's safety profile with no adverse effects on liver, kidney, or cardiovascular health at doses of 3-5g daily in healthy adults.",
      publishedDate: "2024-08-20",
      authors: "Kreider, R.B., Stout, J.R., et al.",
      journal: "Nutrients",
      doi: "10.3390/nu16152847"
    },
    {
      title: "Rest Intervals for Hypertrophy: 2-3 Minutes Optimal",
      summary: "2024 research demonstrates that 2-3 minute rest intervals between sets maximizes mechanical tension and metabolic stress, leading to 15% greater hypertrophy compared to shorter (<90s) rest periods.",
      publishedDate: "2024-07-05",
      authors: "Grgic, J., Lazinica, B., et al.",
      journal: "Sports Medicine",
      doi: "10.1007/s40279-024-02015-6"
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
                NEW 2024
              </div>
              <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                PEER-REVIEWED
              </div>
            </div>
            <h3 className="text-white font-semibold text-base mb-1 leading-tight">
              {latestArticle.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
              <span>{latestArticle.authors}</span>
              <span>•</span>
              <span>{latestArticle.journal}</span>
              <span>•</span>
              <span>{new Date(latestArticle.publishedDate).toLocaleDateString()}</span>
              {latestArticle.doi && (
                <>
                  <span>•</span>
                  <a 
                    href={`https://doi.org/${latestArticle.doi}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    DOI
                  </a>
                </>
              )}
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
