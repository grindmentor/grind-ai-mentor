import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Crown, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  isPremium?: boolean;
  isNew?: boolean;
  isBeta?: boolean;
  component: React.ComponentType<any>;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  scientificBacking?: boolean;
}

interface EnhancedModuleCardProps {
  module: ModuleData;
  isFavorited: boolean;
  onToggleFavorite: (moduleId: string) => void;
  onClick: () => void;
  onHover?: () => void;
  className?: string;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

// Particle animation component for premium modules
const PremiumParticles: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 3 + i * 0.5
  }));

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '100%', 
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: '-20%', 
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Glassmorphism overlay effect
const GlassOverlay: React.FC<{ isHovered: boolean }> = ({ isHovered }) => (
  <motion.div
    className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
    animate={{
      opacity: isHovered ? 1 : 0,
      background: isHovered 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
        : 'transparent'
    }}
    transition={{ duration: 0.3 }}
  />
);

// Enhanced module theme calculator
const getEnhancedModuleTheme = (title: string, category?: string) => {
  const themes: { [key: string]: any } = {
    // AI/Coaching modules
    'CoachGPT': {
      gradient: 'from-cyan-600/20 via-blue-600/20 to-indigo-600/20',
      border: 'border-cyan-500/30',
      iconBg: 'bg-gradient-to-br from-cyan-500/30 to-blue-600/40',
      glow: 'shadow-cyan-500/20',
      particles: false,
      accent: 'cyan'
    },
    
    // Physique Analysis
    'Physique AI': {
      gradient: 'from-purple-600/20 via-indigo-600/20 to-blue-600/20',
      border: 'border-purple-500/30',
      iconBg: 'bg-gradient-to-br from-purple-500/30 to-indigo-600/40',
      glow: 'shadow-purple-500/20',
      particles: true,
      accent: 'purple'
    },
    
    // Workout modules
    'Workout Logger': {
      gradient: 'from-emerald-600/20 via-teal-600/20 to-cyan-600/20',
      border: 'border-emerald-500/30',
      iconBg: 'bg-gradient-to-br from-emerald-500/30 to-teal-600/40',
      glow: 'shadow-emerald-500/20',
      particles: false,
      accent: 'emerald'
    },
    
    // Nutrition modules
    'Smart Food Log': {
      gradient: 'from-orange-600/20 via-amber-600/20 to-yellow-600/20',
      border: 'border-orange-500/30',
      iconBg: 'bg-gradient-to-br from-orange-500/30 to-amber-600/40',
      glow: 'shadow-orange-500/20',
      particles: false,
      accent: 'orange'
    },
    
    // Premium modules get enhanced styling
    'Recovery Coach': {
      gradient: 'from-violet-600/20 via-purple-600/20 to-indigo-600/20',
      border: 'border-violet-500/30',
      iconBg: 'bg-gradient-to-br from-violet-500/30 to-purple-600/40',
      glow: 'shadow-violet-500/20',
      particles: true,
      accent: 'violet'
    }
  };

  return themes[title] || {
    gradient: 'from-gray-600/20 via-gray-700/20 to-gray-800/20',
    border: 'border-gray-500/30',
    iconBg: 'bg-gradient-to-br from-gray-500/30 to-gray-600/40',
    glow: 'shadow-gray-500/20',
    particles: false,
    accent: 'gray'
  };
};

const EnhancedModuleCard: React.FC<EnhancedModuleCardProps> = ({
  module,
  isFavorited,
  onToggleFavorite,
  onClick,
  onHover,
  className = '',
  showDetails = true,
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const theme = getEnhancedModuleTheme(module.title, module.category);
  const IconComponent = module.icon;

  // Handle ripple effect on click
  const handleClick = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { id: rippleIdRef.current++, x, y };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    onClick();
  };

  // Progressive enhancement based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'max-h-32 p-3';
      case 'featured':
        return 'min-h-48 p-6 ring-2 ring-primary/20';
      default:
        return 'min-h-36 p-4';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.();
      }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      layout
    >
      <Card className={`
        relative overflow-hidden transition-all duration-500 h-full
        bg-gradient-to-br ${theme.gradient}
        backdrop-blur-xl border-2 ${theme.border}
        hover:${theme.glow} hover:shadow-2xl
        ${getVariantStyles()}
        glass-card card-hover card-press
      `}>
        {/* Glassmorphism overlay */}
        <GlassOverlay isHovered={isHovered} />
        
        {/* Premium particle effects */}
        {module.isPremium && <PremiumParticles isVisible={isHovered} />}
        
        {/* Click ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-start justify-between">
            {/* Icon with enhanced styling */}
            <motion.div 
              className={`
                relative w-12 h-12 rounded-xl ${theme.iconBg} 
                flex items-center justify-center border border-white/10
                shadow-lg backdrop-blur-sm
              `}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
              
              {/* Scientific backing indicator */}
              {module.scientificBacking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </motion.div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(module.id);
                }}
                className={`
                  transition-all duration-200 p-2 rounded-lg
                  ${isFavorited 
                    ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                  }
                `}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              
              {variant !== 'compact' && (
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  whileHover={{ scale: 1.1 }}
                >
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Title and badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-bold tracking-tight drop-shadow-lg">
                {module.title}
              </CardTitle>
            </div>
            
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-1">
              {module.isBeta && (
                <Badge className="bg-gradient-to-r from-orange-500/50 to-amber-500/50 text-white border border-orange-400/60 text-xs font-semibold animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  BETA
                </Badge>
              )}
              {module.isNew && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
              {module.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-100 border border-yellow-400/50 text-xs backdrop-blur-sm">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              {module.difficulty && variant !== 'compact' && (
                <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          <CardDescription className="text-white/80 leading-relaxed font-medium drop-shadow-sm">
            {module.description}
          </CardDescription>
          
          {/* Additional details for non-compact variants */}
          {showDetails && variant !== 'compact' && (
            <motion.div 
              className="mt-3 space-y-2 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {module.estimatedTime && (
                <div className="text-xs text-white/60">
                  Est. time: {module.estimatedTime}
                </div>
              )}
              
              {module.scientificBacking && (
                <div className="flex items-center space-x-1 text-xs text-emerald-400/80">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span>Evidence-based</span>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default EnhancedModuleCard;