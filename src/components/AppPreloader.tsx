
import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';

interface AppPreloaderProps {
  onComplete: () => void;
  minDuration?: number;
}

const AppPreloader: React.FC<AppPreloaderProps> = ({ 
  onComplete, 
  minDuration = 1000 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 20;
      });
    }, minDuration / 5);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-white animate-pulse" />
          </div>
          <span className="text-3xl font-bold text-white">GrindMentor</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-gray-400 text-sm">
          Initializing your AI fitness coach...
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;
