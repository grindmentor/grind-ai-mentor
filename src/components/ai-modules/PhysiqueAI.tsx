
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Zap, TrendingUp, Target, Users, Eye, Camera, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/MobileHeader';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';

interface PhysiqueAIProps {
  onBack: () => void;
}

const PhysiqueAI: React.FC<PhysiqueAIProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'analysis' | 'progress' | 'goals'>('analysis');

  const analysisSections = [
    {
      title: 'Body Composition Analysis',
      description: 'AI-powered analysis of muscle mass, body fat percentage, and overall physique composition',
      icon: BarChart3,
      status: 'available',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Posture Assessment',
      description: 'Detailed evaluation of posture alignment and muscle imbalances',
      icon: Users,
      status: 'available',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Progress Tracking',
      description: 'Visual comparison and measurement of physique changes over time',
      icon: TrendingUp,
      status: 'available',
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Targeted Recommendations',
      description: 'Personalized training and nutrition suggestions based on your physique analysis',
      icon: Target,
      status: 'coming-soon',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const mockAnalysisData = {
    bodyFat: 15,
    muscleMass: 78,
    symmetry: 92,
    posture: 85
  };

  return (
    <UsageLimitGuard featureKey="physique_analyses" featureName="Physique AI">
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/50 to-purple-900/30">
        {/* Mobile Header */}
        {isMobile ? (
          <MobileHeader title="Physique AI" onBack={onBack} />
        ) : (
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="default"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-white">Physique AI</h1>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Header Card */}
          <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/30 backdrop-blur-sm border-indigo-500/30 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/30 to-purple-500/40 rounded-xl flex items-center justify-center border border-indigo-500/30">
                    <Eye className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Physique AI</CardTitle>
                    <CardDescription className="text-indigo-200/80">
                      AI-powered physique analysis and body composition insights
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Advanced AI
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-900/40 rounded-lg p-1">
            {[
              { id: 'analysis', label: 'Analysis', icon: Eye },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Target }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={`flex-1 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/30 text-indigo-300 hover:bg-indigo-500/40'
                    : 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Photo Upload Section */}
              <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/30 backdrop-blur-sm border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-indigo-400" />
                    Upload Photos for Analysis
                  </CardTitle>
                  <CardDescription className="text-indigo-200/70">
                    Upload front, side, and back photos for comprehensive physique analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Front View', 'Side View', 'Back View'].map((view, index) => (
                      <div key={view} className="border-2 border-dashed border-indigo-500/30 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
                        <Camera className="w-8 h-8 text-indigo-400/60 mx-auto mb-2" />
                        <p className="text-indigo-300/80 text-sm">{view}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Start AI Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisSections.map((section, index) => (
                  <Card
                    key={index}
                    className="bg-gradient-to-br from-gray-900/40 to-gray-800/60 backdrop-blur-sm border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center opacity-80`}>
                            <section.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                          </div>
                        </div>
                        <Badge
                          variant={section.status === 'available' ? 'default' : 'secondary'}
                          className={section.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}
                        >
                          {section.status === 'available' ? 'Available' : 'Coming Soon'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-300 leading-relaxed">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/30 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Progress Overview</CardTitle>
                  <CardDescription className="text-purple-200/70">
                    Track your physique transformation over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mock Progress Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Body Fat %', value: mockAnalysisData.bodyFat, target: 12, color: 'text-blue-400' },
                      { label: 'Muscle Mass', value: mockAnalysisData.muscleMass, target: 85, color: 'text-green-400' },
                      { label: 'Symmetry Score', value: mockAnalysisData.symmetry, target: 95, color: 'text-purple-400' },
                      { label: 'Posture Score', value: mockAnalysisData.posture, target: 90, color: 'text-orange-400' }
                    ].map((metric, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                        <p className={`text-2xl font-bold ${metric.color} mb-2`}>{metric.value}%</p>
                        <Progress value={metric.value} className="h-2" />
                        <p className="text-gray-500 text-xs mt-1">Target: {metric.target}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center py-8 border-2 border-dashed border-gray-700/50 rounded-lg">
                    <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Progress Data Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Upload your first analysis to start tracking progress
                    </p>
                    <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                      Upload First Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/30 backdrop-blur-sm border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Physique Goals</CardTitle>
                  <CardDescription className="text-orange-200/70">
                    Set and track your physique transformation goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Goal Setting Coming Soon</h3>
                    <p className="text-gray-400 mb-4">
                      Advanced goal setting and tracking features will be available soon
                    </p>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Under Development
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default PhysiqueAI;
