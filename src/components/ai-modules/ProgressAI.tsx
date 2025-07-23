
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft, Camera, LineChart, Target, Zap, BarChart3, Activity, Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FeatureGate from '@/components/FeatureGate';

interface ProgressAIProps {
  onBack: () => void;
}

const ProgressAI = ({ onBack }: ProgressAIProps) => {
  const { user } = useAuth();
  const { currentTier, currentTierData } = useSubscription();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadsUsed, setUploadsUsed] = useState(0);

  const maxUploads = currentTierData?.limits.food_photo_analyses || 1;
  const isUnlimited = maxUploads === -1;
  const canUpload = isUnlimited || uploadsUsed < maxUploads;

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

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a photo under 10MB.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a valid image file.',
          variant: 'destructive'
        });
        return;
      }

      setSelectedPhoto(file);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedPhoto || !user || !canUpload) return;

    setIsAnalyzing(true);
    try {
      // Convert photo to base64 for API
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedPhoto);
      });

      const base64Image = await base64Promise;
      
      // Get user profile data for context
      const { data: profileData } = await supabase
        .from('profiles')
        .select('weight, height')
        .eq('id', user.id)
        .single();

      // Call Supabase edge function for photo analysis
      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: {
          image: base64Image,
          weight: profileData?.weight || null,
          height: profileData?.height || null
        }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Process analysis result
      const result = {
        bodyFat: data.bodyFat || 15,
        muscleMass: data.muscleMass || 60,
        recommendations: data.analysis ? data.analysis.split('•').filter(item => item.trim()).map(item => item.trim()) : [
          'Analysis complete',
          'Continue tracking progress with regular photos'
        ],
        progressScore: Math.min(10, Math.max(1, (100 - data.bodyFat) / 10))
      };

      setAnalysisResult(result);
      setUploadsUsed(prev => prev + 1);
      
      // Save photo analysis to database
      const { error: saveError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_name: selectedPhoto.name,
          taken_date: new Date().toISOString().split('T')[0],
          analysis_result: JSON.stringify(result),
          weight_at_time: profileData?.weight || null
        });

      if (saveError) {
        console.error('Error saving photo analysis:', saveError);
      }
      
      toast({
        title: 'Photo Analyzed! 📸',
        description: `Body fat: ${result.bodyFat}% | Muscle mass: ${result.muscleMass}kg`
      });
    } catch (error) {
      console.error('Photo analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze photo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <FeatureGate featureKey="food_photo_analyses" allowPreview={false}>
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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/40 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white break-words">
                  Physique AI
                </h1>
                <p className="text-slate-400 text-sm md:text-base">AI-powered physique analysis and progress tracking</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 flex-shrink-0">
            <Zap className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">AI Analysis</span>
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

        {/* Usage Indicator */}
        {!isUnlimited && (
          <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/30 backdrop-blur-sm border-indigo-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Photo Analysis Usage</h3>
                  <p className="text-indigo-200/80 text-sm">
                    {uploadsUsed} of {maxUploads} uploads used this month
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-400">
                    {maxUploads - uploadsUsed}
                  </div>
                  <div className="text-xs text-indigo-300">remaining</div>
                </div>
              </div>
              {currentTier === 'free' && (
                <div className="mt-3 pt-3 border-t border-indigo-500/20">
                  <p className="text-xs text-indigo-200/60">
                    Upgrade to Premium for 30 photo uploads per month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              {!canUpload && (
                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 text-sm">Upload limit reached for this month.</p>
                    <p className="text-red-300/70 text-xs mt-1">
                      {currentTier === 'free' 
                        ? 'Upgrade to Premium for 30 uploads per month.'
                        : 'Your limit will reset next month.'}
                    </p>
                  </div>
                </div>
              )}

              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                canUpload 
                  ? 'border-indigo-500/30 hover:border-indigo-400/50 bg-slate-800/20'
                  : 'border-gray-600/30 bg-gray-800/20'
              }`}>
                {selectedPhoto ? (
                  <div className="space-y-4">
                    <img 
                      src={URL.createObjectURL(selectedPhoto)} 
                      alt="Selected physique"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-indigo-200 text-sm">{selectedPhoto.name}</p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setSelectedPhoto(null)}
                        variant="outline"
                        className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-800/30"
                      >
                        Change Photo
                      </Button>
                      <Button
                        onClick={analyzePhoto}
                        disabled={isAnalyzing || !canUpload}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Analyze Photo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-400/30">
                      <Camera className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">Upload Progress Photos</h3>
                      <p className="text-slate-400 text-sm">
                        Front, side, and back views for comprehensive analysis
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      disabled={!canUpload}
                      className="hidden"
                      id="physique-photo-upload"
                    />
                    <label
                      htmlFor="physique-photo-upload"
                      className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                        canUpload
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>
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
              {analysisResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/40">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{analysisResult.bodyFat}%</div>
                      <div className="text-sm text-slate-400">Body Fat</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/40">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{analysisResult.muscleMass}kg</div>
                      <div className="text-sm text-slate-400">Muscle Mass</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-green-200/80 text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-400 mb-1">{analysisResult.progressScore}/10</div>
                    <div className="text-sm text-slate-400">Overall Progress Score</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/40">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{uploadsUsed}</div>
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
                </div>
              )}
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
    </FeatureGate>
  );
};

export default ProgressAI;
