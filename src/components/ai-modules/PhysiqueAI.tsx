
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Target, Zap, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { optimizedAiService } from '@/services/optimizedAiService';
import { LoadingSpinner } from '@/components/ui/loading-screen';

interface PhysiqueAIProps {
  onBack: () => void;
}

export const PhysiqueAI: React.FC<PhysiqueAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentWeight: '',
    height: '',
    bodyFat: '',
    goal: '',
    timeframe: '',
    experience: '',
    description: ''
  });
  const [result, setResult] = useState<string>('');

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const prompt = `Analyze this physique transformation request and provide science-backed recommendations:

Current Stats:
- Weight: ${formData.currentWeight} lbs
- Height: ${formData.height}
- Body Fat: ${formData.bodyFat}%
- Experience: ${formData.experience}

Goal: ${formData.goal}
Timeframe: ${formData.timeframe}
Additional Details: ${formData.description}

Provide:
1. Realistic body composition targets
2. Recommended rate of change
3. Key training principles
4. Nutrition approach
5. Timeline expectations

Keep it science-based and actionable.`;

      const response = await optimizedAiService.getResponse(prompt, {
        useCache: true,
        priority: 'normal',
        maxTokens: 800
      });

      setResult(response);
    } catch (error) {
      console.error('Error generating physique analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate physique analysis. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-purple-900/30">
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

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/30 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-pink-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Physique Analysis</CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Get science-backed body transformation guidance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="weight" className="text-purple-200">Current Weight (lbs)</Label>
                    <Input
                      id="weight"
                      value={formData.currentWeight}
                      onChange={(e) => handleInputChange('currentWeight', e.target.value)}
                      placeholder="180"
                      className="bg-purple-900/30 border-purple-500/50 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-purple-200">Height</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="5'10\""
                      className="bg-purple-900/30 border-purple-500/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bodyFat" className="text-purple-200">Body Fat % (optional)</Label>
                  <Input
                    id="bodyFat"
                    value={formData.bodyFat}
                    onChange={(e) => handleInputChange('bodyFat', e.target.value)}
                    placeholder="15"
                    className="bg-purple-900/30 border-purple-500/50 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="goal" className="text-purple-200">Primary Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                    <SelectTrigger className="bg-purple-900/30 border-purple-500/50 text-white">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 backdrop-blur-md border-purple-500/40">
                      <SelectItem value="muscle-gain">Build Muscle</SelectItem>
                      <SelectItem value="fat-loss">Lose Fat</SelectItem>
                      <SelectItem value="recomp">Body Recomposition</SelectItem>
                      <SelectItem value="strength">Increase Strength</SelectItem>
                      <SelectItem value="athletic">Athletic Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="timeframe" className="text-purple-200">Timeframe</Label>
                    <Select value={formData.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                      <SelectTrigger className="bg-purple-900/30 border-purple-500/50 text-white">
                        <SelectValue placeholder="Timeline" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-md border-purple-500/40">
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="long-term">Long Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-purple-200">Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger className="bg-purple-900/30 border-purple-500/50 text-white">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 backdrop-blur-md border-purple-500/40">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-purple-200">Additional Details</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Any specific concerns, preferences, or additional context..."
                    className="bg-purple-900/30 border-purple-500/50 text-white"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.currentWeight || !formData.height || !formData.goal}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Physique
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/30 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-pink-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">Analysis Results</CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Science-backed transformation guidance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {result ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-purple-100 whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">Ready for Analysis</h3>
                  <p className="text-purple-300/70">
                    Fill out the form to get your personalized physique transformation plan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhysiqueAI;
