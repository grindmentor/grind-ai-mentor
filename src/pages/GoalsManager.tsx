
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/page-transition';
import GoalCreationDialog from '@/components/GoalCreationDialog';
import GoalsAchievementsHub from '@/components/GoalsAchievementsHub';

const GoalsManager = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <button
                onClick={() => navigate('/app')}
                className="text-white hover:text-orange-400 transition-colors font-medium flex items-center space-x-2 p-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Dashboard</span>
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-center flex-1 px-2 sm:px-4 truncate">
                Goals & Achievements Manager
              </h1>
              <div className="w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
              Manage Your Goals
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Create, track, and celebrate your fitness achievements
            </p>
          </div>

          <GoalsAchievementsHub />
        </div>
      </div>
    </PageTransition>
  );
};

export default GoalsManager;
