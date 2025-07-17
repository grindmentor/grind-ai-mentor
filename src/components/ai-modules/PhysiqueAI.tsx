import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  User, 
  Scale, 
  Ruler, 
  Target,
  Brain,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { FormattedAIResponse } from '@/components/FormattedAIResponse';

interface PhysiqueAIProps {
  onBack: () => void;
}

export const PhysiqueAI: React.FC<PhysiqueAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [userContext, setUserContext] = useState({
    height: '',
    weight: '',
    bodyFat: '',
    goals: ''
  });

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 512px (more aggressive than before)
        let { width, height } = img;
        const maxSize = 512;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoSelection = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedPhoto(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoSelection(file);
    }
  };

  const analyzePhysique = async () => {
    if (!selectedPhoto || !user) {
      toast({
        title: 'Missing Requirements',
        description: 'Please select a photo and ensure you are logged in.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      // Compress image
      const compressedBlob = await compressImage(selectedPhoto);
      const reader = new FileReader();
      
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
      
      // Get fresh session
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Please sign in again');
      }

      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: {
          image: base64Image,
          height: userContext.height || 'Not specified',
          weight: userContext.weight || 'Not specified',
          bodyFat: userContext.bodyFat || 'Unknown',
          goals: userContext.goals || 'General fitness improvement'
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setAnalysis(data);
      
      // Save to database
      await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_name: selectedPhoto.name,
          analysis_result: JSON.stringify(data),
          notes: `Height: ${userContext.height}, Weight: ${userContext.weight}, Goals: ${userContext.goals}`,
          weight_at_time: userContext.weight ? parseFloat(userContext.weight) : null
        });
      
      toast({
        title: 'Analysis Complete!',
        description: 'Your physique has been analyzed.'
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-blue-900/30">
      <MobileHeader 
        title="Physique AI" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photo Upload & Analysis */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/30 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-blue-500/40 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Camera className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">AI Physique Analysis</CardTitle>
                  <CardDescription className="text-purple-200/80">
                    Get detailed feedback on your physique
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User Context Form */}
              <div className="space-y-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <h3 className="text-lg font-semibold text-purple-200 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Your Information (Optional)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200 flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      Height
                    </Label>
                    <Input
                      value={userContext.height}
                      onChange={(e) => setUserContext(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="5'10&quot; or 178cm"
                      className="bg-purple-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-purple-200 flex items-center">
                      <Scale className="w-4 h-4 mr-1" />
                      Weight
                    </Label>
                    <Input
                      value={userContext.weight}
                      onChange={(e) => setUserContext(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="180 lbs or 82 kg"
                      className="bg-purple-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-purple-200 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Current Body Fat % (if known)
                  </Label>
                  <Input
                    value={userContext.bodyFat}
                    onChange={(e) => setUserContext(prev => ({ ...prev, bodyFat: e.target.value }))}
                    placeholder="15%"
                    className="bg-purple-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                  />
                </div>
                
                <div>
                  <Label className="text-purple-200 flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Goals
                  </Label>
                  <Textarea
                    value={userContext.goals}
                    onChange={(e) => setUserContext(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="Lose fat, build muscle, improve posture..."
                    className="bg-purple-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                    rows={2}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-200 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Photo
                </h3>
                
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-800/50"
                        >
                          Change Photo
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-300 hover:bg-red-800/50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-purple-400 mx-auto" />
                      <div>
                        <p className="text-purple-200">Click to upload a physique photo</p>
                        <p className="text-sm text-purple-300/60 mt-1">
                          Best results: Good lighting, front/side pose, minimal clothing
                        </p>
                      </div>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Select Photo
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={analyzePhysique}
                disabled={!selectedPhoto || isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Physique...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Physique
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-200 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tips for Best Results
                </h4>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  <li>• Use good lighting (natural light preferred)</li>
                  <li>• Stand in front/side pose</li>
                  <li>• Wear minimal, fitted clothing</li>
                  <li>• Keep background simple</li>
                  <li>• Take photo from chest height</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500/30 to-red-500/40 rounded-xl flex items-center justify-center border border-orange-500/30">
                  <Brain className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">AI Analysis</CardTitle>
                  <CardDescription className="text-gray-300">
                    Personalized physique feedback
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="min-h-[400px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                  <p className="text-gray-300">Analyzing your physique...</p>
                  <p className="text-sm text-gray-400">This may take up to 30 seconds</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Analysis Complete
                  </Badge>
                  
                  {/* Body Composition Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Body Fat %</h4>
                      <p className="text-2xl font-bold text-white">
                        {analysis.bodyFatPercentage ? `${analysis.bodyFatPercentage}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Muscle Mass</h4>
                      <p className="text-lg font-semibold text-white capitalize">
                        {analysis.muscleMass || 'Average'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">FFMI</h4>
                      <p className="text-2xl font-bold text-white">
                        {analysis.ffmi ? analysis.ffmi.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Frame Size</h4>
                      <p className="text-lg font-semibold text-white capitalize">
                        {analysis.frameSize || 'Medium'}
                      </p>
                    </div>
                  </div>

                  {/* Overall Rating */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
                    <h4 className="text-sm font-medium text-purple-200 mb-2">Overall Physique Rating</h4>
                    <div className="flex items-center space-x-2">
                      <div className="text-3xl font-bold text-white">
                        {analysis.overallRating || 5}/10
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(analysis.overallRating || 5) * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Muscle Groups Analysis */}
                  {analysis.muscleGroups && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                        <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <div className="space-y-2">
                          {analysis.muscleGroups.strengths?.map((strength: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-green-500/30 text-green-300">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
                        <h4 className="text-sm font-medium text-orange-300 mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Areas to Improve
                        </h4>
                        <div className="space-y-2">
                          {analysis.muscleGroups.weaknesses?.map((weakness: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-orange-500/30 text-orange-300">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {analysis.improvements && analysis.improvements.length > 0 && (
                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                      <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysis.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-blue-200 text-sm flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Confidence Level */}
                  <div className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${analysis.confidence === 'high' ? 'border-green-500/30 text-green-300' : 
                          analysis.confidence === 'medium' ? 'border-yellow-500/30 text-yellow-300' : 
                          'border-red-500/30 text-red-300'}
                      `}
                    >
                      Analysis Confidence: {analysis.confidence || 'Medium'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <Camera className="w-16 h-16 text-gray-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Ready for Analysis</h3>
                    <p className="text-gray-400 mb-4">
                      Upload a photo to get detailed AI feedback on your physique, 
                      training recommendations, and progress insights.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Our AI will analyze:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Body composition estimate</li>
                        <li>• Muscle development assessment</li>
                        <li>• Training recommendations</li>
                        <li>• Progress tracking tips</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};