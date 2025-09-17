import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microscope, 
  ExternalLink, 
  BookOpen, 
  Award, 
  Calendar,
  Users,
  Target,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface StudyData {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  abstract: string;
  keyFindings: string[];
  relevance: 'high' | 'medium' | 'low';
  studyType: 'RCT' | 'Systematic Review' | 'Meta-Analysis' | 'Cohort' | 'Cross-sectional';
  sampleSize?: number;
  evidenceLevel: 1 | 2 | 3 | 4 | 5; // 1 = highest evidence
  tags: string[];
}

interface ScientificResearchPanelProps {
  topic: string;
  studies: StudyData[];
  className?: string;
  maxStudies?: number;
  showFilters?: boolean;
  onStudyClick?: (study: StudyData) => void;
}

const ScientificResearchPanel: React.FC<ScientificResearchPanelProps> = ({
  topic,
  studies,
  className = '',
  maxStudies = 5,
  showFilters = true,
  onStudyClick
}) => {
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter studies based on relevance and type
  const filteredStudies = studies
    .filter(study => selectedFilter === 'all' || study.relevance === selectedFilter)
    .filter(study => selectedType === 'all' || study.studyType === selectedType)
    .slice(0, maxStudies);

  // Get evidence level styling
  const getEvidenceLevelStyle = (level: number) => {
    switch (level) {
      case 1: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 2: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 3: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 4: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 5: return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get relevance styling
  const getRelevanceStyle = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get study type icon
  const getStudyTypeIcon = (type: string) => {
    switch (type) {
      case 'Meta-Analysis': return <TrendingUp className="w-4 h-4" />;
      case 'Systematic Review': return <BookOpen className="w-4 h-4" />;
      case 'RCT': return <Target className="w-4 h-4" />;
      case 'Cohort': return <Users className="w-4 h-4" />;
      default: return <Microscope className="w-4 h-4" />;
    }
  };

  const evidenceLevels = [
    { level: 1, label: 'Systematic Review/Meta-Analysis', color: 'emerald' },
    { level: 2, label: 'Randomized Controlled Trial', color: 'blue' },
    { level: 3, label: 'Cohort Study', color: 'yellow' },
    { level: 4, label: 'Case-Control Study', color: 'orange' },
    { level: 5, label: 'Expert Opinion', color: 'red' }
  ];

  return (
    <Card className={`glass-card border-primary/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-indigo-600/40 rounded-lg flex items-center justify-center">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gradient">
                Scientific Evidence
              </CardTitle>
              <CardDescription className="text-sm">
                Research supporting {topic}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-info/20 text-info border-info/30 animate-research-glow">
            <Award className="w-3 h-3 mr-1" />
            Evidence-Based
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Relevance:</span>
              {['all', 'high', 'medium', 'low'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter as any)}
                  className="text-xs"
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Type:</span>
              {['all', 'Meta-Analysis', 'Systematic Review', 'RCT', 'Cohort'].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="text-xs"
                >
                  {type === 'all' ? 'All' : type}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Evidence Level Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Evidence Levels
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {evidenceLevels.map((level) => (
              <div key={level.level} className="flex items-center space-x-2 text-xs">
                <Badge className={getEvidenceLevelStyle(level.level)}>
                  {level.level}
                </Badge>
                <span className="text-muted-foreground">{level.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Studies List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Research Studies ({filteredStudies.length})
          </h4>
          
          <AnimatePresence>
            {filteredStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Study header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <h5 className="font-semibold text-sm leading-tight text-foreground">
                            {study.title}
                          </h5>
                          <div className="text-xs text-muted-foreground">
                            {study.authors.slice(0, 3).join(', ')}
                            {study.authors.length > 3 && ` et al.`} ({study.year})
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {study.journal}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1 ml-3">
                          <Badge className={getEvidenceLevelStyle(study.evidenceLevel)}>
                            Level {study.evidenceLevel}
                          </Badge>
                          <Badge className={getRelevanceStyle(study.relevance)}>
                            {study.relevance}
                          </Badge>
                        </div>
                      </div>

                      {/* Study metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center space-x-1">
                          {getStudyTypeIcon(study.studyType)}
                          <span className="text-muted-foreground">{study.studyType}</span>
                        </div>
                        
                        {study.sampleSize && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span className="text-muted-foreground">n={study.sampleSize}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-muted-foreground">{study.year}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {study.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {study.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {study.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{study.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Expand/Collapse button */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedStudy(
                            expandedStudy === study.id ? null : study.id
                          )}
                          className="text-xs"
                        >
                          {expandedStudy === study.id ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              Show Details
                            </>
                          )}
                        </Button>
                        
                        {study.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(study.url, '_blank')}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Study
                          </Button>
                        )}
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedStudy === study.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            <Separator />
                            
                            {/* Abstract */}
                            <div>
                              <h6 className="text-xs font-semibold text-foreground mb-1">
                                Abstract
                              </h6>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {study.abstract}
                              </p>
                            </div>
                            
                            {/* Key findings */}
                            {study.keyFindings.length > 0 && (
                              <div>
                                <h6 className="text-xs font-semibold text-foreground mb-1">
                                  Key Findings
                                </h6>
                                <ul className="space-y-1">
                                  {study.keyFindings.map((finding, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground flex items-start">
                                      <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                                      {finding}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* DOI */}
                            {study.doi && (
                              <div className="text-xs">
                                <span className="font-semibold text-foreground">DOI:</span>
                                <span className="text-muted-foreground ml-1 font-mono">
                                  {study.doi}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredStudies.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Microscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No studies found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScientificResearchPanel;