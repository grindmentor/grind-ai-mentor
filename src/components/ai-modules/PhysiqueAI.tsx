
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, Upload, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface PhysiqueAIProps {
  onBack: () => void;
}

export const PhysiqueAI: React.FC<PhysiqueAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState({
    goals: '',
    currentStats: '',
    timeframe: '',
    experience: ''
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image under 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhysique = async () => {
    if (!uploadedImage || !analysisData.goals) {
      toast({
        title: 'Missing Information',
        description: 'Please upload an image and fill in your goals',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        bodyFatPercentage: '12-15%',
        muscleGroups: {
          chest: { development: 'Good', recommendation: 'Focus on upper chest development' },
          shoulders: { development: 'Excellent', recommendation: 'Maintain current training' },
          arms: { development: 'Good', recommendation: 'Increase bicep volume' },
          back: { development: 'Fair', recommendation: 'Focus on width and thickness' },
          legs: { development: 'Good', recommendation: 'Increase quad development' },
          core: { development: 'Fair', recommendation: 'Add more direct ab work' }
        },
        recommendations: [
          'Increase caloric intake by 200-300 calories for lean bulk',
          'Focus on compound movements: deadlifts, squats, bench press',
          'Add 2-3 direct ab exercises per week',
          'Consider a push/pull/legs split for better recovery'
        ],
        timeline: `Based on your goals and current physique, expect visible changes in 8-12 weeks with consistent training and nutrition.`
      };

      setAnalysisResult(mockAnalysis);
      
      toast({
        title: 'Analysis Complete! 📊',
        description: 'Your physique analysis is ready with personalized recommendations.'
      });
    } catch (error) {
      console.error('Error analyzing physique:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDevelopmentColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'good': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'fair': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'needs work': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  return (
    <UsageLimitGuard featureKey="progress_analyses" featureName="Physique AI">
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-purple-900/30">
        <MobileHeader 
          title="Physique AI" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/30 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Camera className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">Physique AI</CardTitle>
                  <CardDescription className="text-purple-200/80 text-sm sm:text-base">
                    AI-powered physique analysis and personalized recommendations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!analysisResult ? (
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <Label className="text-purple-200 text-sm sm:text-base">Upload Your Photo</Label>
                    <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-6 text-center">
                      {uploadedImage ? (
                        <div className="space-y-4">
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded physique" 
                            className="max-h-64 mx-auto rounded-lg object-cover"
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                            size="sm"
                          >
                            Change Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-purple-400/50 mx-auto" />
                          <div>
                            <p className="text-purple-200 mb-2 text-sm sm:text-base">Upload a clear photo of your physique</p>
                            <p className="text-purple-300/60 text-xs sm:text-sm">
                              Front-facing pose recommended • Max 10MB • JPG, PNG supported
                            </p>
                          </div>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Choose Photo
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Analysis Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm sm:text-base">Primary Goals</Label>
                      <Textarea
                        value={analysisData.goals}
                        onChange={(e) => setAnalysisData({...analysisData, goals: e.target.value})}
                        placeholder="e.g., Build muscle, lose fat, improve definition..."
                        className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-200/50 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm sm:text-base">Current Stats (Optional)</Label>
                      <Textarea
                        value={analysisData.currentStats}
                        onChange={(e) => setAnalysisData({...analysisData, currentStats: e.target.value})}
                        placeholder="Height, weight, body fat % if known..."
                        className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-200/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm sm:text-base">Target Timeframe</Label>
                      <Input
                        value={analysisData.timeframe}
                        onChange={(e) => setAnalysisData({...analysisData, timeframe: e.target.value})}
                        placeholder="e.g., 3 months, 6 months, 1 year"
                        className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-200/50 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm sm:text-base">Training Experience</Label>
                      <Input
                        value={analysisData.experience}
                        onChange={(e) => setAnalysisData({...analysisData, experience: e.target.value})}
                        placeholder="e.g., Beginner, 2 years, Advanced"
                        className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-200/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={analyzePhysique}
                    disabled={isAnalyzing || !uploadedImage || !analysisData.goals}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-3 text-sm sm:text-base"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Analyzing Your Physique...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze My Physique
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Analysis Results</h2>
                      <p className="text-purple-200 text-sm sm:text-base">AI-powered physique assessment and recommendations</p>
                    </div>
                    <Button onClick={() => setAnalysisResult(null)} variant="outline" size="sm">
                      New Analysis
                    </Button>
                  </div>

                  {/* Body Fat Percentage */}
                  <Card className="bg-purple-900/40 border-purple-500/40">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-purple-400" />
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Estimated Body Fat</h3>
                          <p className="text-2xl sm:text-3xl font-bold text-purple-300">{analysisResult.bodyFatPercentage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Muscle Group Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-purple-200 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Muscle Group Development
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(analysisResult.muscleGroups).map(([muscle, data]: [string, any]) => (
                        <Card key={muscle} className="bg-purple-900/40 border-purple-500/40">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white capitalize text-sm sm:text-base">{muscle}</h4>
                              <Badge className={getDevelopmentColor(data.development)}>
                                {data.development}
                              </Badge>
                            </div>
                            <p className="text-purple-300 text-xs sm:text-sm">{data.recommendation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-purple-200 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Personalized Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.recommendations.map((rec: string, index: number) => (
                        <Card key={index} className="bg-purple-900/40 border-purple-500/40">
                          <CardContent className="p-3">
                            <p className="text-purple-200 text-sm sm:text-base">{rec}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <Card className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500/50">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Expected Timeline</h3>
                      <p className="text-purple-200 text-sm sm:text-base">{analysisResult.timeline}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default PhysiqueAI;
