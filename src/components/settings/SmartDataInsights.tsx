
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Database, RefreshCw, Sparkles } from "lucide-react";
import { useSmartUserData } from '@/hooks/useSmartUserData';

const SmartDataInsights = () => {
  const { 
    smartData, 
    isLoading, 
    getFormattedValue, 
    refreshData,
    hasBasicInfo,
    hasFitnessProfile,
    hasCalculatedData
  } = useSmartUserData();

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-orange-500" />
            Smart Memory System
          </CardTitle>
          <CardDescription>Loading your saved data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCompletionBadge = (hasData: boolean, label: string) => (
    <Badge 
      className={hasData 
        ? "bg-green-500/20 text-green-400 border-green-500/30" 
        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }
    >
      {hasData ? '✓' : '○'} {label}
    </Badge>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-orange-500" />
              Smart Memory System
            </CardTitle>
            <CardDescription>
              Your data is automatically saved and pre-filled across all modules
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Completion Status */}
        <div className="space-y-3">
          <h4 className="text-white font-medium flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Data Completion
          </h4>
          <div className="flex flex-wrap gap-2">
            {getCompletionBadge(hasBasicInfo, 'Basic Info')}
            {getCompletionBadge(hasFitnessProfile, 'Fitness Profile')}
            {getCompletionBadge(hasCalculatedData, 'Calculated Data')}
          </div>
        </div>

        {/* Saved Data Overview */}
        {smartData && (
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Available for Auto-Fill
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {smartData.age && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white">{getFormattedValue('age')}</span>
                </div>
              )}
              {smartData.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white">{getFormattedValue('weight')}</span>
                </div>
              )}
              {smartData.height && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Height:</span>
                  <span className="text-white">{getFormattedValue('height')}</span>
                </div>
              )}
              {smartData.activityLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Activity:</span>
                  <span className="text-white">{smartData.activityLevel}</span>
                </div>
              )}
              {smartData.experienceLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience:</span>
                  <span className="text-white">{smartData.experienceLevel}</span>
                </div>
              )}
              {smartData.fitnessGoals && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Goal:</span>
                  <span className="text-white">{smartData.fitnessGoals}</span>
                </div>
              )}
              {smartData.tdee && (
                <div className="flex justify-between">
                  <span className="text-gray-400">TDEE:</span>
                  <span className="text-white">{getFormattedValue('tdee')}</span>
                </div>
              )}
              {smartData.bodyFatPercentage && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Body Fat:</span>
                  <span className="text-white">{getFormattedValue('bodyFatPercentage')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h4 className="text-white font-medium text-sm">How Smart Memory Works</h4>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Your data is automatically saved when you use any calculator or form</li>
            <li>• New modules will pre-fill with your most recent information</li>
            <li>• You can accept or modify suggested values in each form</li>
            <li>• Data updates everywhere when you save new information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartDataInsights;
