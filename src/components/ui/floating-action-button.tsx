import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, X, Dumbbell, Apple, Target, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  description?: string;
}

interface FloatingActionButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'extended';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  className = '',
  position = 'bottom-right',
  size = 'md',
  variant = 'default'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Hide/show based on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: { main: 'w-12 h-12', action: 'w-10 h-10', icon: 'w-5 h-5' },
    md: { main: 'w-14 h-14', action: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { main: 'w-16 h-16', action: 'w-14 h-14', icon: 'w-7 h-7' }
  };

  const config = sizeConfig[size];

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'workout',
      label: 'Log Workout',
      icon: Dumbbell,
      action: () => navigate('/app?module=workout-logger'),
      color: 'from-emerald-500 to-teal-600',
      description: 'Track your exercises'
    },
    {
      id: 'food',
      label: 'Log Food',
      icon: Apple,
      action: () => navigate('/app?module=smart-food-log'),
      color: 'from-orange-500 to-amber-600',
      description: 'Track your nutrition'
    },
    {
      id: 'progress',
      label: 'View Progress',
      icon: BarChart3,
      action: () => navigate('/app?module=progress-hub'),
      color: 'from-purple-500 to-indigo-600',
      description: 'Check your stats'
    },
    {
      id: 'goal',
      label: 'Set Goal',
      icon: Target,
      action: () => navigate('/app?module=goal-tracker'),
      color: 'from-blue-500 to-cyan-600',
      description: 'Create new goal'
    }
  ];

  const handleMainClick = () => {
    if (variant === 'minimal') {
      // For minimal variant, directly navigate to most common action
      navigate('/app?module=workout-logger');
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsExpanded(false);
    
    // Haptic feedback on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = () => setIsExpanded(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses[position]} ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Quick action menu */}
          <AnimatePresence>
            {isExpanded && variant !== 'minimal' && (
              <motion.div
                className="absolute bottom-full mb-4 right-0 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Action label */}
                    <motion.div
                      className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-white/10"
                      whileHover={{ scale: 1.05 }}
                    >
                      {action.label}
                      {action.description && (
                        <div className="text-xs text-white/60 mt-1">
                          {action.description}
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Action button */}
                    <motion.button
                      className={`
                        ${config.action} rounded-full shadow-lg border border-white/20
                        bg-gradient-to-r ${action.color}
                        hover:shadow-xl active:scale-95
                        flex items-center justify-center
                        transition-all duration-200
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(action);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <action.icon className={`${config.icon} text-white`} />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <motion.button
            className={`
              ${config.main} rounded-full shadow-xl
              bg-gradient-to-r from-primary to-primary-variant
              hover:shadow-2xl active:scale-95
              flex items-center justify-center
              border-2 border-white/20 backdrop-blur-sm
              transition-all duration-300
              group
            `}
            onClick={handleMainClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              filter: isExpanded ? 'brightness(1.2)' : 'brightness(1)',
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {isExpanded ? (
                <X className={`${config.icon} text-white`} />
              ) : (
                <Plus className={`${config.icon} text-white`} />
              )}
            </motion.div>
            
            {/* Pulsing ring for emphasis */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>

          {/* Extended variant with text */}
          {variant === 'extended' && !isExpanded && (
            <motion.div
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10">
                Quick Actions
              </div>
            </motion.div>
          )}

          {/* Tooltip for minimal variant */}
          {variant === 'minimal' && (
            <motion.div
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
            >
              <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium border border-white/10 whitespace-nowrap">
                Log Workout
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionButton;