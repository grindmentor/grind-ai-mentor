
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft, Camera, LineChart, Target, Zap, BarChart3, Activity } from "lucide-react";
import { useState } from "react";

interface ProgressAIProps {
  onBack: () => void;
}

const ProgressAI = ({ onBack }: ProgressAIProps) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const features = [
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Photo Analysis",
      description: "AI-powered physique assessment"
    },
    {
      icon: <LineChart className="w-5 h-5" />,
      title: "Progress Tracking",
      description: "Advanced measurement analytics"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Goal Setting",
      description: "Personalized target recommendations"
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: "Body Composition",
      description: "Detailed physique breakdown"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 border-2 border-indigo-400/40">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Physique AI
                </h1>
                <p className="text-slate-400 text-lg">AI-powered physique analysis and progress tracking</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            AI Analysis
          </Badge>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-indigo-400/30">
                  <div className="text-indigo-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-xs">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Analysis Panel */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Camera className="w-5 h-5 mr-3 text-indigo-400" />
                Physique Analysis
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload photos for AI-powered body composition analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/50 rounded-2xl p-8 text-center transition-all duration-200 bg-slate-800/20">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-400/30">
                  <Camera className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Upload Progress Photos</h3>
                <p className="text-slate-400 text-sm">Front, side, and back views for comprehensive analysis</p>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium py-3 shadow-lg shadow-indigo-500/25">
                <Camera className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Progress Dashboard */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <BarChart3 className="w-5 h-5 mr-3 text-indigo-400" />
                Progress Dashboard
              </CardTitle>
              <CardDescription className="text-slate-400">
                Track your physique development over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/40">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">0</div>
                  <div className="text-sm text-slate-400">Photos Analyzed</div>
                </div>
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/40">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">0%</div>
                  <div className="text-sm text-slate-400">Progress Made</div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm">Upload your first photos to start tracking progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Muscle Groups Tracked", value: "12+", icon: Target },
            { label: "Analysis Points", value: "50+", icon: Activity },
            { label: "Progress Metrics", value: "25+", icon: BarChart3 }
          ].map((stat, index) => (
            <Card key={index} className="bg-slate-900/30 border-slate-700/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <stat.icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressAI;
