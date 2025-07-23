
import React from 'react';

interface AppBackgroundProps {
  children: React.ReactNode;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      {/* Base background */}
      <div className="fixed inset-0 bg-background z-0" />
      
      {/* Orange gradient overlay - subtle like Habit Tracker */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-orange-900/20 to-orange-800/30 z-0" />
      
      {/* Optional subtle pattern overlay */}
      <div className="fixed inset-0 opacity-5 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,88,12,0.08),transparent_50%)]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AppBackground;
