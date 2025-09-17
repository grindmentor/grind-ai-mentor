import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HapticButtonProps extends ButtonProps {
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  soundEffect?: 'click' | 'success' | 'error' | 'notification';
  ripple?: boolean;
  glowOnHover?: boolean;
  pulseOnClick?: boolean;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  className = '',
  hapticFeedback = 'medium',
  soundEffect,
  ripple = true,
  glowOnHover = false,
  pulseOnClick = true,
  onClick,
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [rippleCoords, setRippleCoords] = useState<{ x: number; y: number } | null>(null);

  const triggerHapticFeedback = (type: string) => {
    // Vibration API for mobile devices
    if ('vibrator' in navigator || 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 10, 10],
        warning: [50, 50],
        error: [100, 50, 100]
      };
      
      navigator.vibrate?.(patterns[type as keyof typeof patterns] || patterns.medium);
    }
    
    // Web Vibration API
    if (window.navigator && window.navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 10, 10],
        warning: [50, 50],
        error: [100, 50, 100]
      };
      
      window.navigator.vibrate(patterns[type as keyof typeof patterns] || patterns.medium);
    }
  };

  const playSound = (sound: string) => {
    // Create audio context for sound effects
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      const sounds = {
        click: { frequency: 800, duration: 50 },
        success: { frequency: 523.25, duration: 100 }, // C5
        error: { frequency: 220, duration: 150 }, // A3
        notification: { frequency: 659.25, duration: 80 } // E5
      };
      
      const soundConfig = sounds[sound as keyof typeof sounds];
      if (soundConfig) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = soundConfig.frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + soundConfig.duration / 1000);
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback
    if (hapticFeedback) {
      triggerHapticFeedback(hapticFeedback);
    }
    
    // Play sound effect
    if (soundEffect) {
      playSound(soundEffect);
    }
    
    // Ripple effect
    if (ripple) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setRippleCoords({ x, y });
      
      setTimeout(() => setRippleCoords(null), 600);
    }
    
    // Pulse animation
    if (pulseOnClick) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    }
    
    // Call original onClick
    onClick?.(event);
  };

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        glowOnHover && 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:scale-105',
        isClicked && pulseOnClick && 'scale-95',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple Effect */}
      {ripple && rippleCoords && (
        <span
          className="absolute pointer-events-none rounded-full bg-white/30 animate-ping"
          style={{
            left: rippleCoords.x - 10,
            top: rippleCoords.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      )}
      
      {/* Glow overlay */}
      {glowOnHover && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md" />
      )}
    </Button>
  );
};

export default HapticButton;