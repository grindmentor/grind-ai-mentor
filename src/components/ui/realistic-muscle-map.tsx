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

const RealisticMuscleMapComponent: React.FC<RealisticMuscleMapProps> = ({ 
  muscleGroups, 
  viewMode = 'front' 
}) => {
  const getMuscleColor = (score: number): string => {
    if (score >= 90) return 'hsl(271 100% 50%)'; // Elite - Purple
    if (score >= 80) return 'hsl(262 83% 58%)'; // Expert - Blue Purple  
    if (score >= 70) return 'hsl(142 76% 36%)'; // Advanced - Green
    if (score >= 60) return 'hsl(47 96% 53%)'; // Intermediate - Yellow
    if (score >= 50) return 'hsl(25 95% 53%)'; // Novice - Orange
    if (score >= 30) return 'hsl(200 100% 70%)'; // Beginner - Light Blue
    return 'hsl(220 13% 69%)'; // Untrained - Gray
  };

  const getMuscleLevel = (score: number): string => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Expert'; 
    if (score >= 70) return 'Advanced';
    if (score >= 60) return 'Intermediate';
    if (score >= 50) return 'Novice';
    if (score >= 30) return 'Beginner';
    return 'Untrained';
  };

  const getMuscleScore = (muscleName: string): number => {
    const muscle = muscleGroups.find(m => 
      m.name.toLowerCase().includes(muscleName.toLowerCase()) ||
      muscleName.toLowerCase().includes(m.name.toLowerCase())
    );
    return muscle?.score || 0;
  };

  const getMuscleOpacity = (score: number): number => {
    // Higher scores get more opacity with better visibility
    return Math.max(0.4, Math.min(0.85, (score + 20) / 100));
  };

  const getGlowIntensity = (score: number): string => {
    if (score >= 80) return '0 0 20px rgba(139, 92, 246, 0.6)';
    if (score >= 60) return '0 0 15px rgba(34, 197, 94, 0.4)';
    return '0 0 8px rgba(59, 130, 246, 0.3)';
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

  // Get unique muscle groups with their data
  const uniqueMuscles = currentMuscleAreas
    .filter((muscle, index, self) => 
      index === self.findIndex(m => m.name === muscle.name)
    )
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl p-6 border border-border/50 shadow-lg backdrop-blur-sm">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Muscle Development Map
          </h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'front' ? 'Anterior View' : 'Posterior View'}
          </p>
        </div>
        
        <div className="flex gap-6 items-start">
          {/* Muscle Groups List - Left Side */}
          <div className="flex-shrink-0 w-64 space-y-3">
            <h4 className="font-semibold text-foreground mb-4">Muscle Groups</h4>
            {uniqueMuscles.map((muscle) => (
              <div
                key={muscle.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-border/30 hover:border-border transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white/30 flex-shrink-0"
                    style={{ 
                      backgroundColor: getMuscleColor(muscle.score),
                      boxShadow: getGlowIntensity(muscle.score)
                    }}
                  />
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {muscle.name.charAt(0).toUpperCase() + muscle.name.slice(1)}
                    </div>
                    <div className="text-xs" style={{ color: getMuscleColor(muscle.score) }}>
                      {getMuscleLevel(muscle.score)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {muscle.score}%
                </div>
              </div>
            ))}
          </div>

          {/* Muscle Map - Right Side */}
          <div className="flex-1 relative aspect-[4/3] bg-gradient-to-b from-muted/10 to-muted/20 rounded-xl overflow-hidden">
            {/* Base anatomical image */}
            <img
              src={viewMode === 'front' ? '/lovable-uploads/a2f0ea8c-f9d9-4353-a43f-af6cc4628401.png' : backAnatomyImage}
              alt={viewMode === 'front' ? 'Myotopia realistic muscle anatomy map (anterior view)' : 'Myotopia realistic muscle anatomy map (posterior view)'}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={1024}
              height={768}
            />
            
            {/* Enhanced color overlays for muscle development */}
            <div className="absolute inset-0">
              {currentMuscleAreas.map((muscle, index) => (
                <div
                  key={`${muscle.name}-${index}`}
                  className="absolute rounded-lg transition-all duration-500 hover:scale-110 cursor-pointer group"
                  style={{
                    left: `${muscle.x}%`,
                    top: `${muscle.y}%`,
                    width: `${muscle.width}%`,
                    height: `${muscle.height}%`,
                    backgroundColor: getMuscleColor(muscle.score),
                    opacity: getMuscleOpacity(muscle.score),
                    mixBlendMode: 'soft-light',
                    border: `2px solid ${getMuscleColor(muscle.score)}60`,
                    boxShadow: getGlowIntensity(muscle.score),
                  }}
                  title={`${muscle.name.charAt(0).toUpperCase() + muscle.name.slice(1)}: ${getMuscleLevel(muscle.score)} (${muscle.score}%)`}
                >
                  {/* Subtle inner glow effect */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${getMuscleColor(muscle.score)} 0%, transparent 70%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Development summary */}
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground">
            Hover over colored areas on the image to see muscle details
          </div>
        </div>
      </div>
    </div>
  );
};

export const RealisticMuscleMap = React.memo(RealisticMuscleMapComponent);

export const MuscleMapLegend: React.FC = () => {
  const levels = [
    { color: 'hsl(220 13% 69%)', label: 'Untrained (0-29%)', description: 'No training data', glow: '0 0 8px rgba(156, 163, 175, 0.3)' },
    { color: 'hsl(200 100% 70%)', label: 'Beginner (30-49%)', description: 'Starting development', glow: '0 0 8px rgba(59, 130, 246, 0.3)' },
    { color: 'hsl(25 95% 53%)', label: 'Novice (50-59%)', description: 'Basic foundation', glow: '0 0 10px rgba(251, 146, 60, 0.4)' },
    { color: 'hsl(47 96% 53%)', label: 'Intermediate (60-69%)', description: 'Solid progress', glow: '0 0 12px rgba(250, 204, 21, 0.4)' },
    { color: 'hsl(142 76% 36%)', label: 'Advanced (70-79%)', description: 'Well developed', glow: '0 0 15px rgba(34, 197, 94, 0.4)' },
    { color: 'hsl(262 83% 58%)', label: 'Expert (80-89%)', description: 'Highly trained', glow: '0 0 18px rgba(139, 92, 246, 0.5)' },
    { color: 'hsl(271 100% 50%)', label: 'Elite (90-100%)', description: 'Peak development', glow: '0 0 20px rgba(139, 92, 246, 0.6)' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-foreground mb-2">
          Muscle Development Scale
        </h4>
        <p className="text-sm text-muted-foreground">
          Color-coded training progression levels
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {levels.map((level, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-border/50 hover:border-border transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-5 h-5 rounded-full border-2 border-white/30 transition-all duration-300 group-hover:scale-110" 
                  style={{ 
                    backgroundColor: level.color,
                    boxShadow: level.glow
                  }}
                />
                <div>
                  <span className="font-semibold text-foreground text-sm">{level.label}</span>
                  <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: level.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Higher intensity colors and glow effects indicate advanced development
        </p>
      </div>
    </div>
  );
};