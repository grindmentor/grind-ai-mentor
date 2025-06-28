
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, ChevronRight, Calendar } from 'lucide-react';
import ScientificStudies from '@/components/ScientificStudies';

const LatestResearch = () => {
  const [showArchive, setShowArchive] = useState(false);

  // Latest 2025 research - most recent study displayed first
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

  // Archive of previous research sorted by date (most recent first)
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
    <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
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
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
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
          
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
            {latestArticle.summary}
          </p>
          
          <div className="mb-4">
            <h4 className="text-white text-xs font-semibold mb-2">Key Findings:</h4>
            <ul className="space-y-1">
              {latestArticle.keyFindings.map((finding, index) => (
                <li key={index} className="text-gray-400 text-xs flex items-start">
                  <ChevronRight className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="text-xs text-gray-500">
              Latest update • {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <ScientificStudies />
            </div>
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
