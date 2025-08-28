import React from 'react';

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

  if (viewMode === 'back') {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-center text-sm font-medium text-foreground mb-4">Posterior View</h3>
          <svg viewBox="0 0 300 500" className="w-full h-auto">
            {/* Head (back) */}
            <circle cx="150" cy="45" r="25" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2"/>
            
            {/* Neck */}
            <rect x="140" y="70" width="20" height="12" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" rx="6"/>
            
            {/* Trapezius */}
            <path d="M 120 85 L 180 85 L 185 110 L 115 110 Z"
              fill={getMuscleColor(getMuscleScore('traps'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="100" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Traps
            </text>
            
            {/* Rear Delts */}
            <rect x="93" y="97" width="24" height="36" rx="12"
              fill={getMuscleColor(getMuscleScore('shoulders'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <rect x="183" y="97" width="24" height="36" rx="12"
              fill={getMuscleColor(getMuscleScore('shoulders'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="105" y="118" textAnchor="middle" className="fill-foreground text-xs font-medium">Rear</text>
            <text x="195" y="118" textAnchor="middle" className="fill-foreground text-xs font-medium">Rear</text>
            
            {/* Latissimus Dorsi */}
            <polygon points="110,130 90,160 95,200 140,210 150,150"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <polygon points="190,130 210,160 205,200 160,210 150,150"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="125" y="170" textAnchor="middle" className="fill-foreground text-xs font-medium">Lats</text>
            <text x="175" y="170" textAnchor="middle" className="fill-foreground text-xs font-medium">Lats</text>
            
            {/* Mid Back */}
            <rect x="125" y="120" width="50" height="30" rx="8"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="138" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Mid Back
            </text>
            
            {/* Triceps */}
            <rect x="75" y="135" width="20" height="50" rx="10"
              fill={getMuscleColor(getMuscleScore('arms'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <rect x="205" y="135" width="20" height="50" rx="10"
              fill={getMuscleColor(getMuscleScore('arms'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="85" y="163" textAnchor="middle" className="fill-foreground text-xs font-medium">Tri</text>
            <text x="215" y="163" textAnchor="middle" className="fill-foreground text-xs font-medium">Tri</text>
            
            {/* Lower Back */}
            <rect x="130" y="175" width="40" height="50" rx="8"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="203" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Lower Back
            </text>
            
            {/* Glutes */}
            <rect x="117" y="220" width="36" height="40" rx="8"
              fill={getMuscleColor(getMuscleScore('glutes'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <rect x="147" y="220" width="36" height="40" rx="8"
              fill={getMuscleColor(getMuscleScore('glutes'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="243" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Glutes
            </text>
            
            {/* Hamstrings */}
            <rect x="115" y="260" width="30" height="80" rx="8"
              fill={getMuscleColor(getMuscleScore('legs'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <rect x="155" y="260" width="30" height="80" rx="8"
              fill={getMuscleColor(getMuscleScore('legs'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="303" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Hamstrings
            </text>
            
            {/* Calves */}
            <rect x="118" y="370" width="24" height="60" rx="8"
              fill={getMuscleColor(getMuscleScore('calves'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <rect x="158" y="370" width="24" height="60" rx="8"
              fill={getMuscleColor(getMuscleScore('calves'))} 
              stroke="hsl(var(--border))" strokeWidth="2"/>
            <text x="150" y="403" textAnchor="middle" className="fill-foreground text-xs font-medium">
              Calves
            </text>
          </svg>
        </div>
      </div>
    );
  }

  // Front view (default)
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-center text-sm font-medium text-foreground mb-4">Anterior View</h3>
        <svg viewBox="0 0 300 500" className="w-full h-auto">
          {/* Head */}
          <circle cx="150" cy="45" r="25" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2"/>
          
          {/* Neck */}
          <rect x="140" y="70" width="20" height="12" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" rx="6"/>
          
          {/* Anterior Deltoids */}
          <rect x="100" y="85" width="30" height="40" rx="15"
            fill={getMuscleColor(getMuscleScore('shoulders'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="170" y="85" width="30" height="40" rx="15"
            fill={getMuscleColor(getMuscleScore('shoulders'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="115" y="108" textAnchor="middle" className="fill-foreground text-xs font-medium">Delts</text>
          <text x="185" y="108" textAnchor="middle" className="fill-foreground text-xs font-medium">Delts</text>
          
          {/* Pectorals */}
          <polygon points="120,120 180,120 175,155 125,155"
            fill={getMuscleColor(getMuscleScore('chest'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="150" y="140" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Chest
          </text>
          
          {/* Biceps */}
          <rect x="83" y="130" width="24" height="50" rx="12"
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="193" y="130" width="24" height="50" rx="12"
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="95" y="158" textAnchor="middle" className="fill-foreground text-xs font-medium">Bi</text>
          <text x="205" y="158" textAnchor="middle" className="fill-foreground text-xs font-medium">Bi</text>
          
          {/* Forearms */}
          <rect x="87" y="170" width="16" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="197" y="170" width="16" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          
          {/* Rectus Abdominis */}
          <rect x="135" y="155" width="30" height="55" rx="8" 
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          {/* Ab divisions */}
          <line x1="150" y1="170" x2="150" y2="200" stroke="hsl(var(--border))" strokeWidth="1"/>
          <line x1="140" y1="180" x2="160" y2="180" stroke="hsl(var(--border))" strokeWidth="1"/>
          <line x1="140" y1="190" x2="160" y2="190" stroke="hsl(var(--border))" strokeWidth="1"/>
          <text x="150" y="185" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Abs
          </text>
          
          {/* Obliques */}
          <rect x="112" y="165" width="16" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="172" y="165" width="16" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          
          {/* Lower Core */}
          <rect x="125" y="208" width="50" height="24" rx="8"
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="150" y="223" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Lower Core
          </text>
          
          {/* Quadriceps */}
          <rect x="112" y="240" width="36" height="100" rx="8"
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="152" y="240" width="36" height="100" rx="8"
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          {/* Quad divisions */}
          <line x1="124" y1="250" x2="124" y2="330" stroke="hsl(var(--border))" strokeWidth="1"/>
          <line x1="136" y1="250" x2="136" y2="330" stroke="hsl(var(--border))" strokeWidth="1"/>
          <line x1="164" y1="250" x2="164" y2="330" stroke="hsl(var(--border))" strokeWidth="1"/>
          <line x1="176" y1="250" x2="176" y2="330" stroke="hsl(var(--border))" strokeWidth="1"/>
          <text x="150" y="293" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Quads
          </text>
          
          {/* Shins */}
          <rect x="122" y="355" width="16" height="50" rx="8"
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="162" y="355" width="16" height="50" rx="8"
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="150" y="383" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Shins
          </text>
          
          {/* Calves (front view) */}
          <rect x="120" y="410" width="20" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('calves'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <rect x="160" y="410" width="20" height="40" rx="8"
            fill={getMuscleColor(getMuscleScore('calves'))} 
            stroke="hsl(var(--border))" strokeWidth="2"/>
          <text x="150" y="433" textAnchor="middle" className="fill-foreground text-xs font-medium">
            Calves
          </text>
        </svg>
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