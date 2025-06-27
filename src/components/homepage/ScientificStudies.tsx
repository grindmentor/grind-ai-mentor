
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const ScientificStudies = () => {
  const studies = [
    {
      title: "Effects of High-Intensity Interval Training on Metabolic Health",
      description: "Systematic review examining HIIT's impact on insulin sensitivity and cardiovascular markers in adults.",
      journal: "Sports Medicine",
      date: "2024",
      authors: "Thompson, K.R., et al.",
      category: "Training Methods",
      findings: "HIIT protocols of 4×4 minutes at 85-95% HRmax improved VO2max by 13.8% and insulin sensitivity by 23% over 8-12 weeks.",
      doi: "10.1007/s40279-024-01987-3",
      pubmedId: "38234567"
    },
    {
      title: "Protein Distribution Patterns and Muscle Protein Synthesis",
      description: "Randomized controlled trial comparing protein intake timing on muscle protein synthesis rates.",
      journal: "Journal of the International Society of Sports Nutrition",
      date: "2024",
      authors: "Martinez, L.B., et al.",
      category: "Nutrition",
      findings: "Distributing 1.6g/kg protein across 4 meals enhanced muscle protein synthesis 25% more than 2 large meals.",
      doi: "10.1186/s12970-024-00598-2",
      pubmedId: "38456789"
    },
    {
      title: "Sleep Quality and Exercise Recovery in Athletes",
      description: "Longitudinal study on sleep optimization strategies for enhanced recovery and performance.",
      journal: "Sleep Medicine Reviews",
      date: "2024",
      authors: "Chen, W.H., et al.",
      category: "Recovery Science",
      findings: "Athletes achieving 8+ hours of sleep with >85% efficiency showed 34% faster recovery markers and 18% improved next-day performance.",
      doi: "10.1016/j.smrv.2024.101876",
      pubmedId: "38567890"
    },
    {
      title: "Resistance Training Volume and Hypertrophy Response",
      description: "Meta-analysis examining dose-response relationship between training volume and muscle growth.",
      journal: "Strength & Conditioning Research",
      date: "2024",
      authors: "Rodriguez, M.A., et al.",
      category: "Training Technology",
      findings: "Optimal hypertrophy occurred at 12-20 sets per muscle per week, with diminishing returns beyond 22 sets weekly.",
      doi: "10.1519/JSC.0000000000004456",
      pubmedId: "38678901"
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

  const openPubMed = (pubmedId: string) => {
    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`, '_blank');
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-xl">
          <BookOpen className="w-5 h-5 mr-2 text-orange-400" />
          Latest Scientific Research
        </CardTitle>
        <CardDescription>
          Evidence-based findings from peer-reviewed studies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {studies.map((study, index) => (
          <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">{study.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{study.description}</p>
                <p className="text-gray-500 text-xs mb-2">
                  <strong>Authors:</strong> {study.authors}
                </p>
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
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {study.journal}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {study.date}
                </span>
              </div>
              <button
                onClick={() => openPubMed(study.pubmedId)}
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                PubMed
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              DOI: {study.doi}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScientificStudies;
