
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import ScientificStudies from '@/components/ScientificStudies';

const LatestResearch = () => {
  // Mock latest research article - in a real app this would come from an API
  const latestArticle = {
    title: "High-Frequency Training Increases Muscle Protein Synthesis",
    summary: "Recent research shows that training muscle groups 2-3 times per week leads to greater muscle protein synthesis compared to once-weekly training, supporting higher frequency approaches for muscle growth.",
    publishedDate: "2024-06-20",
    authors: "Schoenfeld et al.",
    journal: "Journal of Strength & Conditioning Research",
    keyFindings: [
      "2-3x weekly training frequency optimal for muscle growth",
      "Higher protein synthesis rates maintained longer",
      "Volume equated between groups for fair comparison"
    ]
  };

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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
          <div className="mb-3">
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
      </CardContent>
    </Card>
  );
};

export default LatestResearch;
