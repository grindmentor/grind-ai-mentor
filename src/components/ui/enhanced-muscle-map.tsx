import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eye, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MuscleGroupData {
  name: string;
  score: number;
  volume: number;
  frequency: number;
  intensity: number;
  exercises: string[];
  lastTrained: Date | null;
  progressTrend: 'up' | 'down' | 'stable';
}

interface EnhancedMuscleMapProps {
  muscleGroups: MuscleGroupData[];
  viewMode?: 'front' | 'back';
  onViewModeChange?: (mode: 'front' | 'back') => void;
  interactive?: boolean;
  showLegend?: boolean;
  className?: string;
}

// Enhanced muscle group positioning with more precise anatomical mapping
const muscleDefinitions = {
  front: [
    // Chest - More detailed segmentation
    { name: 'chest', region: 'upper-chest', x: 45, y: 22, width: 10, height: 6 },
    { name: 'chest', region: 'mid-chest', x: 45, y: 28, width: 10, height: 6 },
    { name: 'chest', region: 'lower-chest', x: 46, y: 34, width: 8, height: 4 },
    
    // Shoulders - Detailed deltoid mapping
    { name: 'shoulders', region: 'anterior-delt-left', x: 35, y: 20, width: 6, height: 8 },
    { name: 'shoulders', region: 'anterior-delt-right', x: 59, y: 20, width: 6, height: 8 },
    { name: 'shoulders', region: 'medial-delt-left', x: 32, y: 22, width: 4, height: 6 },
    { name: 'shoulders', region: 'medial-delt-right', x: 64, y: 22, width: 4, height: 6 },
    
    // Arms - Biceps and forearms
    { name: 'arms', region: 'biceps-left', x: 28, y: 25, width: 5, height: 8 },
    { name: 'arms', region: 'biceps-right', x: 67, y: 25, width: 5, height: 8 },
    { name: 'arms', region: 'forearms-left', x: 26, y: 33, width: 6, height: 12 },
    { name: 'arms', region: 'forearms-right', x: 68, y: 33, width: 6, height: 12 },
    
    // Core - Detailed abdominal mapping
    { name: 'core', region: 'upper-abs', x: 44, y: 38, width: 12, height: 6 },
    { name: 'core', region: 'mid-abs', x: 44, y: 44, width: 12, height: 6 },
    { name: 'core', region: 'lower-abs', x: 45, y: 50, width: 10, height: 6 },
    { name: 'core', region: 'obliques-left', x: 38, y: 42, width: 4, height: 10 },
    { name: 'core', region: 'obliques-right', x: 58, y: 42, width: 4, height: 10 },
    
    // Legs - Quadriceps detailed
    { name: 'legs', region: 'quads-left', x: 40, y: 58, width: 8, height: 20 },
    { name: 'legs', region: 'quads-right', x: 52, y: 58, width: 8, height: 20 },
    { name: 'legs', region: 'hip-flexors-left', x: 42, y: 55, width: 4, height: 6 },
    { name: 'legs', region: 'hip-flexors-right', x: 54, y: 55, width: 4, height: 6 },
    
    // Calves
    { name: 'calves', region: 'calves-left', x: 41, y: 82, width: 6, height: 15 },
    { name: 'calves', region: 'calves-right', x: 53, y: 82, width: 6, height: 15 },
  ],
  back: [
    // Traps and upper back
    { name: 'traps', region: 'upper-traps', x: 42, y: 16, width: 16, height: 6 },
    { name: 'traps', region: 'mid-traps', x: 40, y: 22, width: 20, height: 6 },
    
    // Shoulders - Posterior delts
    { name: 'shoulders', region: 'posterior-delt-left', x: 30, y: 20, width: 6, height: 8 },
    { name: 'shoulders', region: 'posterior-delt-right', x: 64, y: 20, width: 6, height: 8 },
    
    // Back - Detailed latissimus and rhomboids
    { name: 'back', region: 'rhomboids', x: 40, y: 28, width: 20, height: 8 },
    { name: 'back', region: 'lats-left', x: 32, y: 32, width: 12, height: 16 },
    { name: 'back', region: 'lats-right', x: 56, y: 32, width: 12, height: 16 },
    { name: 'back', region: 'lower-back', x: 42, y: 45, width: 16, height: 8 },
    
    // Arms - Triceps
    { name: 'arms', region: 'triceps-left', x: 25, y: 25, width: 6, height: 12 },
    { name: 'arms', region: 'triceps-right', x: 69, y: 25, width: 6, height: 12 },
    
    // Glutes - Detailed mapping
    { name: 'glutes', region: 'glute-max-left', x: 38, y: 50, width: 8, height: 10 },
    { name: 'glutes', region: 'glute-max-right', x: 54, y: 50, width: 8, height: 10 },
    { name: 'glutes', region: 'glute-med-left', x: 36, y: 48, width: 6, height: 8 },
    { name: 'glutes', region: 'glute-med-right', x: 58, y: 48, width: 6, height: 8 },
    
    // Legs - Hamstrings
    { name: 'legs', region: 'hamstrings-left', x: 40, y: 62, width: 8, height: 18 },
    { name: 'legs', region: 'hamstrings-right', x: 52, y: 62, width: 8, height: 18 },
    
    // Calves
    { name: 'calves', region: 'calves-left', x: 41, y: 82, width: 6, height: 15 },
    { name: 'calves', region: 'calves-right', x: 53, y: 82, width: 6, height: 15 },
  ]
};

const EnhancedMuscleMap: React.FC<EnhancedMuscleMapProps> = ({
  muscleGroups,
  viewMode = 'front',
  onViewModeChange,
  interactive = true,
  showLegend = true,
  className = ''
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [animationStage, setAnimationStage] = useState(0);

  // Progressive animation for muscle loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStage < muscleGroups.length) {
        setAnimationStage(prev => prev + 1);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [animationStage, muscleGroups.length]);

  // Enhanced muscle color calculation with scientific precision
  const getMuscleVisualization = (score: number, progressTrend: 'up' | 'down' | 'stable') => {
    let baseColor: string;
    let intensity: number;
    let scientificLevel: string;

    if (score >= 90) {
      baseColor = '142 76% 36%'; // Elite - Deep green
      intensity = 0.9;
      scientificLevel = 'Elite';
    } else if (score >= 80) {
      baseColor = '142 71% 45%'; // Expert - Green
      intensity = 0.8;
      scientificLevel = 'Expert';
    } else if (score >= 70) {
      baseColor = '142 85% 55%'; // Advanced - Light green
      intensity = 0.7;
      scientificLevel = 'Advanced';
    } else if (score >= 60) {
      baseColor = '47 96% 53%'; // Intermediate - Yellow
      intensity = 0.6;
      scientificLevel = 'Intermediate';
    } else if (score >= 50) {
      baseColor = '25 95% 53%'; // Novice - Orange
      intensity = 0.5;
      scientificLevel = 'Novice';
    } else if (score >= 30) {
      baseColor = '0 84% 60%'; // Beginner - Red
      intensity = 0.4;
      scientificLevel = 'Beginner';
    } else {
      baseColor = '220 9% 46%'; // Untrained - Gray
      intensity = 0.3;
      scientificLevel = 'Untrained';
    }

    // Add trend indicators
    let trendModifier = '';
    if (progressTrend === 'up') trendModifier = ' ring-2 ring-emerald-400/50';
    else if (progressTrend === 'down') trendModifier = ' ring-2 ring-red-400/50';

    return {
      backgroundColor: `hsl(${baseColor})`,
      opacity: intensity,
      borderColor: `hsl(${baseColor})`,
      scientificLevel,
      trendModifier,
      glowEffect: score > 70 ? `drop-shadow-[0_0_8px_hsl(${baseColor}/0.6)]` : ''
    };
  };

  const getMuscleScore = (muscleName: string): MuscleGroupData => {
    return muscleGroups.find(m => 
      m.name.toLowerCase().includes(muscleName.toLowerCase()) ||
      muscleName.toLowerCase().includes(m.name.toLowerCase())
    ) || {
      name: muscleName,
      score: 0,
      volume: 0,
      frequency: 0,
      intensity: 0,
      exercises: [],
      lastTrained: null,
      progressTrend: 'stable'
    };
  };

  const currentMuscleAreas = muscleDefinitions[viewMode];

  const groupedMuscles = useMemo(() => {
    const groups: { [key: string]: typeof currentMuscleAreas } = {};
    currentMuscleAreas.forEach(muscle => {
      if (!groups[muscle.name]) groups[muscle.name] = [];
      groups[muscle.name].push(muscle);
    });
    return groups;
  }, [currentMuscleAreas]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <TooltipProvider>
      <div className={`relative w-full max-w-lg mx-auto ${className}`}>
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gradient">
                Muscle Development Map
              </CardTitle>
              {interactive && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewModeChange?.(viewMode === 'front' ? 'back' : 'front')}
                    className="glass-button"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {viewMode === 'front' ? 'Anterior' : 'Posterior'}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pb-6">
            {/* Main muscle map container */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-gray-900/20 to-gray-800/20 rounded-xl overflow-hidden">
              {/* Base anatomical silhouette */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700/10 to-gray-600/20 rounded-xl">
                {/* Anatomical outline */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  {/* Human silhouette outline */}
                  <path
                    d={viewMode === 'front' 
                      ? "M50 5 C55 5 60 10 60 15 L65 20 L70 30 L68 50 L65 60 L62 80 L60 95 L55 98 L45 98 L40 95 L38 80 L35 60 L32 50 L30 30 L35 20 L40 15 C40 10 45 5 50 5"
                      : "M50 5 C55 5 60 10 60 15 L65 20 L70 25 L68 45 L65 55 L62 75 L60 95 L55 98 L45 98 L40 95 L38 75 L35 55 L32 45 L30 25 L35 20 L40 15 C40 10 45 5 50 5"
                    }
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              
              {/* Muscle overlays with enhanced visualization */}
              <div className="absolute inset-0">
                {Object.entries(groupedMuscles).map(([muscleName, areas]) => {
                  const muscleData = getMuscleScore(muscleName);
                  const visualization = getMuscleVisualization(muscleData.score, muscleData.progressTrend);
                  const isAnimated = animationStage >= Object.keys(groupedMuscles).indexOf(muscleName) + 1;
                  
                  return areas.map((area, index) => (
                    <Tooltip key={`${muscleName}-${index}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            absolute rounded-lg border-2 transition-all duration-500 cursor-pointer
                            ${visualization.trendModifier}
                            ${visualization.glowEffect}
                            ${hoveredMuscle === muscleName ? 'scale-110 z-20' : 'z-10'}
                            ${selectedMuscle === muscleName ? 'ring-4 ring-primary/50' : ''}
                            ${isAnimated ? 'animate-fade-in' : 'opacity-0'}
                            muscle-overlay
                          `}
                          style={{
                            left: `${area.x}%`,
                            top: `${area.y}%`,
                            width: `${area.width}%`,
                            height: `${area.height}%`,
                            backgroundColor: visualization.backgroundColor,
                            opacity: visualization.opacity,
                            borderColor: visualization.borderColor,
                            mixBlendMode: 'multiply',
                            animationDelay: `${index * 100}ms`
                          }}
                          onClick={() => interactive && setSelectedMuscle(selectedMuscle === muscleName ? null : muscleName)}
                          onMouseEnter={() => setHoveredMuscle(muscleName)}
                          onMouseLeave={() => setHoveredMuscle(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="glass-card border-primary/20">
                        <div className="text-center space-y-1">
                          <div className="font-semibold text-primary capitalize">
                            {muscleName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: {muscleData.score}% ({visualization.scientificLevel})
                          </div>
                          <div className="flex items-center justify-center space-x-1 text-xs">
                            <TrendIcon trend={muscleData.progressTrend} />
                            <span className="capitalize">{muscleData.progressTrend}</span>
                          </div>
                          {muscleData.lastTrained && (
                            <div className="text-xs text-muted-foreground">
                              Last: {muscleData.lastTrained.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ));
                })}
              </div>

              {/* Selected muscle details overlay */}
              {selectedMuscle && (
                <div className="absolute top-4 left-4 right-4 z-30">
                  <Card className="glass-card border-primary/30 animate-scale-in">
                    <CardContent className="p-4">
                      {(() => {
                        const data = getMuscleScore(selectedMuscle);
                        const viz = getMuscleVisualization(data.score, data.progressTrend);
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-primary capitalize">{selectedMuscle}</h3>
                              <Badge style={{ backgroundColor: viz.backgroundColor }} className="text-white">
                                {viz.scientificLevel}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Score: <span className="font-semibold">{data.score}%</span></div>
                              <div>Volume: <span className="font-semibold">{data.volume.toLocaleString()}</span></div>
                              <div>Frequency: <span className="font-semibold">{data.frequency}x/week</span></div>
                              <div>Intensity: <span className="font-semibold">{data.intensity.toFixed(1)}/10</span></div>
                            </div>
                            {data.exercises.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Top Exercises:</div>
                                <div className="text-xs">
                                  {data.exercises.slice(0, 3).join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Legend */}
        {showLegend && (
          <Card className="glass-card border-primary/20 mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Development Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { level: 'Elite', color: '142 76% 36%', range: '90-100%' },
                  { level: 'Expert', color: '142 71% 45%', range: '80-89%' },
                  { level: 'Advanced', color: '142 85% 55%', range: '70-79%' },
                  { level: 'Intermediate', color: '47 96% 53%', range: '60-69%' },
                  { level: 'Novice', color: '25 95% 53%', range: '50-59%' },
                  { level: 'Beginner', color: '0 84% 60%', range: '30-49%' },
                  { level: 'Untrained', color: '220 9% 46%', range: '0-29%' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: `hsl(${item.color})` }}
                    />
                    <span className="font-medium">{item.level}</span>
                    <span className="text-muted-foreground ml-auto">{item.range}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedMuscleMap;