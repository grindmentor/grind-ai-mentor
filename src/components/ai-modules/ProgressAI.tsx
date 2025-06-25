
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Upload, TrendingUp, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { aiService } from "@/services/aiService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/contexts/PreferencesContext";
import { convertWeight, formatWeight } from "@/lib/unitConversions";
import { SoundButton } from "@/components/SoundButton";

interface ProgressAIProps {
  onBack: () => void;
}

interface ProgressPhoto {
  id: string;
  file_name: string;
  file_url?: string;
  analysis_result?: string;
  photo_type?: string;
  weight_at_time?: number;
  notes?: string;
  taken_date: string;
  created_at: string;
}

const ProgressAI = ({ onBack }: ProgressAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { preferences } = usePreferences();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back' | 'custom'>('front');
  const [showHistory, setShowHistory] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    bodyFat: number;
    muscleMass: number;
    analysis: string;
  } | null>(null);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const weightUnit = preferences?.weight_unit || 'lbs';

  useEffect(() => {
    if (user) {
      loadProgressPhotos();
    }
  }, [user]);

  const loadProgressPhotos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading progress photos:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !canUseFeature('progress_analyses')) return;
    
    setIsAnalyzing(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const weightInLbs = weight ? (weightUnit === 'kg' ? convertWeight(parseFloat(weight), 'kg', 'lbs') : parseFloat(weight)) : undefined;
        const heightNum = height ? parseFloat(height) : undefined;

        try {
          const result = await aiService.analyzeProgressPhoto(base64, weightInLbs, heightNum);
          setAnalysisResult(result);
          
          const success = await incrementUsage('progress_analyses');
          if (!success) {
            setIsAnalyzing(false);
            return;
          }

          // Save to database
          await saveProgressPhoto(selectedFile.name, result.analysis, result.bodyFat, result.muscleMass);

          toast({
            title: "Photo analyzed successfully!",
            description: "Your physique analysis is ready.",
          });

        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: "Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const saveProgressPhoto = async (fileName: string, analysis: string, bodyFat?: number, muscleMass?: number) => {
    if (!user) return;

    try {
      const weightInLbs = weight ? (weightUnit === 'kg' ? convertWeight(parseFloat(weight), 'kg', 'lbs') : parseFloat(weight)) : null;

      const { error } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_name: fileName,
          analysis_result: `Body Fat: ${bodyFat}%\nMuscle Mass: ${muscleMass}kg\n\n${analysis}`,
          photo_type: photoType,
          weight_at_time: weightInLbs,
          notes: notes || null,
          taken_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      await loadProgressPhotos();
    } catch (error) {
      console.error('Error saving progress photo:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <SoundButton variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </SoundButton>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Physique AI</h1>
            <p className="text-gray-400">Photo analysis of your physique</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          Instant Physique Analysis
        </Badge>
        <UsageIndicator featureKey="progress_analyses" featureName="Physique Analysis" compact />
        <SoundButton
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <History className="w-4 h-4 mr-2" />
          History ({photos.length})
        </SoundButton>
      </div>

      {showHistory && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Progress History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Camera className="w-4 h-4 text-purple-400" />
                        <p className="text-white font-medium">{photo.file_name}</p>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          {photo.photo_type}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {new Date(photo.taken_date).toLocaleDateString()}
                        {photo.weight_at_time && ` • ${formatWeight(
                          weightUnit === 'kg' ? convertWeight(photo.weight_at_time, 'lbs', 'kg') : photo.weight_at_time,
                          weightUnit
                        )}`}
                      </p>
                    </div>
                  </div>
                  {photo.analysis_result && (
                    <div className="mt-3 p-3 bg-gray-700 rounded text-gray-300 text-sm">
                      <pre className="whitespace-pre-wrap font-sans">{photo.analysis_result}</pre>
                    </div>
                  )}
                </div>
              ))}
              {photos.length === 0 && (
                <p className="text-gray-500 text-center py-4">No progress photos yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Upload Progress Photo</CardTitle>
            <CardDescription className="text-gray-400">
              Get instant body composition analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Click to upload photo</p>
                <p className="text-gray-400 text-sm">Images up to 10MB</p>
              </label>
            </div>

            {previewUrl && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-60 object-contain rounded"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Photo Type</label>
                    <select
                      value={photoType}
                      onChange={(e) => setPhotoType(e.target.value as any)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                    >
                      <option value="front">Front View</option>
                      <option value="side">Side View</option>
                      <option value="back">Back View</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Weight ({weightUnit})</label>
                      <Input
                        type="number"
                        placeholder={`${weightUnit === 'kg' ? '80' : '175'}`}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                      <Input
                        type="number"
                        placeholder="175"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <SoundButton
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !canUseFeature('progress_analyses')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
                    soundType="success"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Photo"}
                  </SoundButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
            <CardDescription className="text-gray-400">
              Instant body composition data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <div>
                    <p className="text-white font-medium">Analyzing your photo...</p>
                    <p className="text-gray-400 text-sm">Getting body composition data</p>
                  </div>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Body Fat</p>
                    <p className="text-2xl font-bold text-orange-400">{analysisResult.bodyFat}%</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm">Muscle Mass</p>
                    <p className="text-2xl font-bold text-green-400">{analysisResult.muscleMass}kg</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Detailed Analysis:</h4>
                  <div className="text-gray-300 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{analysisResult.analysis}</pre>
                  </div>
                </div>
              </div>
            )}

            {!selectedFile && !isAnalyzing && !analysisResult && (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500">Upload a photo to get instant analysis</p>
                <p className="text-gray-600 text-sm">Body fat percentage and muscle mass estimates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAI;
