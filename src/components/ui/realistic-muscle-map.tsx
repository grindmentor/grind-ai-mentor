import React from 'react';
import backAnatomyImage from '@/assets/realistic-muscle-anatomy.jpg';

interface RealisticMuscleMapProps {
  muscleGroups: Array<{
    name: string;
    score: number;
    progressTrend: 'up' | 'down' | 'stable';
  }>;
  viewMode?: 'front' | 'back';
}

export const RealisticMuscleMap: React.FC<RealisticMuscleMapProps> = ({ 
  muscleGroups, 
  viewMode = 'front' 
}) => {
  const getMuscleColor = (score: number): string => {
    if (score >= 90) return 'hsl(var(--primary))'; // Elite - primary theme color
    if (score >= 80) return 'hsl(142 76% 36%)'; // Advanced - green
    if (score >= 70) return 'hsl(142 71% 45%)'; // Intermediate+ - light green
    if (score >= 60) return 'hsl(47 96% 53%)'; // Intermediate - yellow
    if (score >= 50) return 'hsl(25 95% 53%)'; // Beginner+ - orange
    if (score >= 30) return 'hsl(var(--muted))'; // Beginner - muted
    return 'hsl(var(--muted-foreground))'; // Untrained - very muted
  };

  const getMuscleScore = (muscleName: string): number => {
    const muscle = muscleGroups.find(m => 
      m.name.toLowerCase().includes(muscleName.toLowerCase()) ||
      muscleName.toLowerCase().includes(m.name.toLowerCase())
    );
    return muscle?.score || 0;
  };

  const getMuscleOpacity = (score: number): number => {
    // Higher scores get more opacity (more visible color overlay)
    return Math.max(0.3, Math.min(0.8, score / 100));
  };

  // Define muscle group positions for front view
  const frontMuscleAreas = [
    { name: 'chest', x: 45, y: 25, width: 10, height: 12, score: getMuscleScore('chest') },
    { name: 'shoulders', x: 35, y: 20, width: 8, height: 8, score: getMuscleScore('shoulders') },
    { name: 'shoulders', x: 57, y: 20, width: 8, height: 8, score: getMuscleScore('shoulders') },
    { name: 'arms', x: 28, y: 25, width: 6, height: 15, score: getMuscleScore('arms') },
    { name: 'arms', x: 66, y: 25, width: 6, height: 15, score: getMuscleScore('arms') },
    { name: 'core', x: 43, y: 38, width: 14, height: 18, score: getMuscleScore('core') },
    { name: 'legs', x: 40, y: 58, width: 8, height: 25, score: getMuscleScore('legs') },
    { name: 'legs', x: 52, y: 58, width: 8, height: 25, score: getMuscleScore('legs') },
    { name: 'calves', x: 41, y: 85, width: 6, height: 12, score: getMuscleScore('calves') },
    { name: 'calves', x: 53, y: 85, width: 6, height: 12, score: getMuscleScore('calves') }
  ];

  // Define muscle group positions for back view
  const backMuscleAreas = [
    { name: 'traps', x: 42, y: 18, width: 16, height: 8, score: getMuscleScore('traps') },
    { name: 'shoulders', x: 30, y: 20, width: 8, height: 8, score: getMuscleScore('shoulders') },
    { name: 'shoulders', x: 62, y: 20, width: 8, height: 8, score: getMuscleScore('shoulders') },
    { name: 'back', x: 38, y: 28, width: 24, height: 20, score: getMuscleScore('back') },
    { name: 'arms', x: 25, y: 25, width: 6, height: 15, score: getMuscleScore('arms') },
    { name: 'arms', x: 69, y: 25, width: 6, height: 15, score: getMuscleScore('arms') },
    { name: 'glutes', x: 42, y: 50, width: 16, height: 12, score: getMuscleScore('glutes') },
    { name: 'legs', x: 40, y: 64, width: 8, height: 20, score: getMuscleScore('legs') },
    { name: 'legs', x: 52, y: 64, width: 8, height: 20, score: getMuscleScore('legs') },
    { name: 'calves', x: 41, y: 85, width: 6, height: 12, score: getMuscleScore('calves') },
    { name: 'calves', x: 53, y: 85, width: 6, height: 12, score: getMuscleScore('calves') }
  ];

  const currentMuscleAreas = viewMode === 'front' ? frontMuscleAreas : backMuscleAreas;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-center text-sm font-medium text-foreground mb-4">
          {viewMode === 'front' ? 'Anterior View' : 'Posterior View'}
        </h3>
        
        <div className="relative w-full aspect-[4/3]">
          {/* Base anatomical image */}
          <img
            src={viewMode === 'front' ? '/lovable-uploads/a2f0ea8c-f9d9-4353-a43f-af6cc4628401.png' : backAnatomyImage}
            alt={viewMode === 'front' ? 'Myotopia realistic muscle anatomy map (anterior view)' : 'Myotopia realistic muscle anatomy map (posterior view)'}
            className="w-full h-full object-contain rounded-lg"
            loading="eager"
            decoding="async"
          />
          
          {/* Color overlays for muscle development */}
          <div className="absolute inset-0">
            {currentMuscleAreas.map((muscle, index) => (
              <div
                key={`${muscle.name}-${index}`}
                className="absolute rounded-md transition-all duration-300 hover:scale-105"
                style={{
                  left: `${muscle.x}%`,
                  top: `${muscle.y}%`,
                  width: `${muscle.width}%`,
                  height: `${muscle.height}%`,
                  backgroundColor: getMuscleColor(muscle.score),
                  opacity: getMuscleOpacity(muscle.score),
                  mixBlendMode: 'multiply',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                title={`${muscle.name.charAt(0).toUpperCase() + muscle.name.slice(1)}: ${muscle.score}%`}
              />
            ))}
          </div>
          
          {/* Muscle labels */}
          <div className="absolute inset-0 pointer-events-none">
            {currentMuscleAreas
              .filter((muscle, index, self) => 
                index === self.findIndex(m => m.name === muscle.name)
              )
              .map((muscle, index) => (
                <div
                  key={muscle.name}
                  className="absolute text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm"
                  style={{
                    left: `${muscle.x + muscle.width/2}%`,
                    top: `${muscle.y + muscle.height + 2}%`,
                    transform: 'translateX(-50%)',
                    fontSize: '10px'
                  }}
                >
                  {muscle.name.charAt(0).toUpperCase() + muscle.name.slice(1)}
                  <br />
                  <span className="text-muted-foreground">{muscle.score}%</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const MuscleMapLegend: React.FC = () => {
  const levels = [
    { color: 'hsl(var(--muted-foreground))', label: 'Untrained (0-29%)', description: 'No training data' },
    { color: 'hsl(var(--muted))', label: 'Beginner (30-49%)', description: 'Starting development' },
    { color: 'hsl(25 95% 53%)', label: 'Novice (50-59%)', description: 'Basic foundation' },
    { color: 'hsl(47 96% 53%)', label: 'Intermediate (60-69%)', description: 'Solid progress' },
    { color: 'hsl(142 71% 45%)', label: 'Advanced (70-79%)', description: 'Well developed' },
    { color: 'hsl(142 76% 36%)', label: 'Expert (80-89%)', description: 'Highly trained' },
    { color: 'hsl(var(--primary))', label: 'Elite (90-100%)', description: 'Peak development' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-center text-foreground mb-3">
        Muscle Development Scale
      </h4>
      <div className="grid grid-cols-1 gap-2 text-xs">
        {levels.map((level, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full border border-white/20" 
                style={{ backgroundColor: level.color }}
              />
              <span className="font-medium text-foreground">{level.label}</span>
            </div>
            <span className="text-muted-foreground text-xs">{level.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};