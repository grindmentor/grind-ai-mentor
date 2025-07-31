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
    if (score >= 90) return '#10b981'; // Emerald-500 - Elite
    if (score >= 80) return '#8b5cf6'; // Violet-500 - Advanced
    if (score >= 70) return '#7c3aed'; // Purple-600 - Intermediate+
    if (score >= 60) return '#6d28d9'; // Purple-700 - Intermediate
    if (score >= 50) return '#5b21b6'; // Purple-800 - Beginner+
    if (score >= 30) return '#4c1d95'; // Purple-900 - Beginner
    return '#6b7280'; // Gray-500 - Untrained
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
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl p-6 border border-slate-500/20">
          <h3 className="text-center text-sm font-medium text-foreground mb-4">Posterior View</h3>
          <svg viewBox="0 0 300 500" className="w-full h-auto">
            {/* Head (back) */}
            <circle cx="150" cy="45" r="25" fill="rgba(100, 116, 139, 0.3)" stroke="#64748b" strokeWidth="1"/>
            
            {/* Neck */}
            <rect x="140" y="70" width="20" height="12" fill="rgba(100, 116, 139, 0.3)" rx="6"/>
            
            {/* Trapezius */}
            <path d="M 120 85 Q 150 75 180 85 Q 190 95 185 110 Q 150 115 115 110 Q 110 95 120 85 Z"
              fill={getMuscleColor(getMuscleScore('traps'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.9"/>
            <text x="150" y="100" textAnchor="middle" className="fill-white text-xs font-medium">
              Traps
            </text>
            
            {/* Rear Delts */}
            <ellipse cx="105" cy="115" rx="12" ry="18" 
              fill={getMuscleColor(getMuscleScore('shoulders'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <ellipse cx="195" cy="115" rx="12" ry="18" 
              fill={getMuscleColor(getMuscleScore('shoulders'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            
            {/* Latissimus Dorsi */}
            <path d="M 110 130 Q 90 160 95 200 Q 120 220 140 210 Q 150 180 150 150 Q 140 140 110 130 Z"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <path d="M 190 130 Q 210 160 205 200 Q 180 220 160 210 Q 150 180 150 150 Q 160 140 190 130 Z"
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <text x="125" y="170" textAnchor="middle" className="fill-white text-xs font-medium">Lats</text>
            <text x="175" y="170" textAnchor="middle" className="fill-white text-xs font-medium">Lats</text>
            
            {/* Rhomboids & Mid Traps */}
            <ellipse cx="150" cy="135" rx="25" ry="15" 
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
            <text x="150" y="140" textAnchor="middle" className="fill-white text-xs font-medium">
              Mid Back
            </text>
            
            {/* Triceps */}
            <ellipse cx="85" cy="160" rx="10" ry="25" 
              fill={getMuscleColor(getMuscleScore('arms'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <ellipse cx="215" cy="160" rx="10" ry="25" 
              fill={getMuscleColor(getMuscleScore('arms'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <text x="85" y="165" textAnchor="middle" className="fill-white text-xs font-medium">Tri</text>
            <text x="215" y="165" textAnchor="middle" className="fill-white text-xs font-medium">Tri</text>
            
            {/* Lower Back / Erector Spinae */}
            <ellipse cx="150" cy="200" rx="20" ry="25" 
              fill={getMuscleColor(getMuscleScore('back'))} 
              stroke="#ffffff" strokeWidth="1" opacity="0.8"/>
            <text x="150" y="205" textAnchor="middle" className="fill-white text-xs font-medium">
              Lower Back
            </text>
            
            {/* Glutes */}
            <ellipse cx="135" cy="240" rx="18" ry="20" 
              fill={getMuscleColor(getMuscleScore('glutes'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
            <ellipse cx="165" cy="240" rx="18" ry="20" 
              fill={getMuscleColor(getMuscleScore('glutes'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
            <text x="150" y="245" textAnchor="middle" className="fill-white text-xs font-medium">
              Glutes
            </text>
            
            {/* Hamstrings */}
            <ellipse cx="130" cy="300" rx="15" ry="40" 
              fill={getMuscleColor(getMuscleScore('legs'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
            <ellipse cx="170" cy="300" rx="15" ry="40" 
              fill={getMuscleColor(getMuscleScore('legs'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
            <text x="150" y="305" textAnchor="middle" className="fill-white text-xs font-medium">
              Hamstrings
            </text>
            
            {/* Calves */}
            <ellipse cx="130" cy="400" rx="12" ry="30" 
              fill={getMuscleColor(getMuscleScore('calves'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
            <ellipse cx="170" cy="400" rx="12" ry="30" 
              fill={getMuscleColor(getMuscleScore('calves'))} 
              stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
            <text x="150" y="405" textAnchor="middle" className="fill-white text-xs font-medium">
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
      <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl p-6 border border-slate-500/20">
        <h3 className="text-center text-sm font-medium text-foreground mb-4">Anterior View</h3>
        <svg viewBox="0 0 300 500" className="w-full h-auto">
          {/* Head */}
          <circle cx="150" cy="45" r="25" fill="rgba(100, 116, 139, 0.3)" stroke="#64748b" strokeWidth="1"/>
          
          {/* Neck */}
          <rect x="140" y="70" width="20" height="12" fill="rgba(100, 116, 139, 0.3)" rx="6"/>
          
          {/* Anterior Deltoids */}
          <ellipse cx="115" cy="105" rx="15" ry="20" 
            fill={getMuscleColor(getMuscleScore('shoulders'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          <ellipse cx="185" cy="105" rx="15" ry="20" 
            fill={getMuscleColor(getMuscleScore('shoulders'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          <text x="115" y="110" textAnchor="middle" className="fill-white text-xs font-medium">Delts</text>
          <text x="185" y="110" textAnchor="middle" className="fill-white text-xs font-medium">Delts</text>
          
          {/* Pectorals */}
          <path d="M 120 120 Q 150 110 180 120 Q 185 140 175 155 Q 150 165 125 155 Q 115 140 120 120 Z"
            fill={getMuscleColor(getMuscleScore('chest'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          <text x="150" y="140" textAnchor="middle" className="fill-white text-xs font-medium">
            Chest
          </text>
          
          {/* Biceps */}
          <ellipse cx="95" cy="155" rx="12" ry="25" 
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
          <ellipse cx="205" cy="155" rx="12" ry="25" 
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
          <text x="95" y="160" textAnchor="middle" className="fill-white text-xs font-medium">Bi</text>
          <text x="205" y="160" textAnchor="middle" className="fill-white text-xs font-medium">Bi</text>
          
          {/* Forearms */}
          <ellipse cx="95" cy="190" rx="8" ry="20" 
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          <ellipse cx="205" cy="190" rx="8" ry="20" 
            fill={getMuscleColor(getMuscleScore('arms'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          
          {/* Rectus Abdominis */}
          <rect x="135" y="165" width="30" height="45" rx="8" 
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          {/* Ab lines for definition */}
          <line x1="150" y1="175" x2="150" y2="200" stroke="#ffffff" strokeWidth="0.5" opacity="0.6"/>
          <line x1="140" y1="185" x2="160" y2="185" stroke="#ffffff" strokeWidth="0.5" opacity="0.6"/>
          <line x1="140" y1="195" x2="160" y2="195" stroke="#ffffff" strokeWidth="0.5" opacity="0.6"/>
          <text x="150" y="190" textAnchor="middle" className="fill-white text-xs font-medium">
            Abs
          </text>
          
          {/* Obliques */}
          <ellipse cx="120" cy="185" rx="8" ry="20" 
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          <ellipse cx="180" cy="185" rx="8" ry="20" 
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          
          {/* Hip Flexors / Lower Abs */}
          <ellipse cx="150" cy="220" rx="25" ry="12" 
            fill={getMuscleColor(getMuscleScore('core'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          <text x="150" y="225" textAnchor="middle" className="fill-white text-xs font-medium">
            Lower Core
          </text>
          
          {/* Quadriceps */}
          <ellipse cx="130" cy="290" rx="18" ry="50" 
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          <ellipse cx="170" cy="290" rx="18" ry="50" 
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
          {/* Quad definition lines */}
          <line x1="125" y1="270" x2="125" y2="310" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
          <line x1="135" y1="270" x2="135" y2="310" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
          <line x1="165" y1="270" x2="165" y2="310" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
          <line x1="175" y1="270" x2="175" y2="310" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
          <text x="150" y="295" textAnchor="middle" className="fill-white text-xs font-medium">
            Quads
          </text>
          
          {/* Tibialis Anterior (Shins) */}
          <ellipse cx="130" cy="380" rx="8" ry="25" 
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
          <ellipse cx="170" cy="380" rx="8" ry="25" 
            fill={getMuscleColor(getMuscleScore('legs'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
          <text x="150" y="385" textAnchor="middle" className="fill-white text-xs font-medium">
            Shins
          </text>
          
          {/* Calves (front view) */}
          <ellipse cx="130" cy="420" rx="10" ry="20" 
            fill={getMuscleColor(getMuscleScore('calves'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          <ellipse cx="170" cy="420" rx="10" ry="20" 
            fill={getMuscleColor(getMuscleScore('calves'))} 
            stroke="#ffffff" strokeWidth="1" opacity="0.7"/>
          <text x="150" y="425" textAnchor="middle" className="fill-white text-xs font-medium">
            Calves
          </text>
        </svg>
      </div>
    </div>
  );
};

export const MuscleMapLegend: React.FC = () => {
  const levels = [
    { color: '#6b7280', label: 'Untrained (0-29%)', description: 'No training data' },
    { color: '#4c1d95', label: 'Beginner (30-49%)', description: 'Starting development' },
    { color: '#5b21b6', label: 'Novice (50-59%)', description: 'Basic foundation' },
    { color: '#6d28d9', label: 'Intermediate (60-69%)', description: 'Solid progress' },
    { color: '#7c3aed', label: 'Advanced (70-79%)', description: 'Well developed' },
    { color: '#8b5cf6', label: 'Expert (80-89%)', description: 'Highly trained' },
    { color: '#10b981', label: 'Elite (90-100%)', description: 'Peak development' },
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