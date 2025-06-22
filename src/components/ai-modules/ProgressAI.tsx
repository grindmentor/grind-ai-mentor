import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Upload, Zap, TrendingUp, FileText, Download, Save, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { aiService } from "@/services/aiService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back' | 'custom'>('front');
  const [showHistory, setShowHistory] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

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
    }
  };

  const saveProgressPhoto = async (fileName: string, analysis: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_name: fileName,
          analysis_result: analysis,
          photo_type: photoType,
          weight_at_time: weight ? parseFloat(weight) : null,
          notes: notes || null,
          taken_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Progress photo saved!",
        description: "Your analysis has been saved to your profile.",
      });

      await loadProgressPhotos();
    } catch (error) {
      console.error('Error saving progress photo:', error);
      toast({
        title: "Error saving photo",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !canUseFeature('progress_analyses')) return;
    
    setIsAnalyzing(true);
    
    const isImage = selectedFile.type.startsWith('image/');
    
    try {
      // Create analysis prompt based on file type
      const analysisPrompt = isImage ? 
        `Analyze this progress photo for body composition, muscle definition, and provide science-based recommendations for training and nutrition. Include specific observations about muscle development, body fat percentage estimates, posture, and actionable next steps. Weight: ${weight || 'Not provided'} lbs. Notes: ${notes || 'None'}.` :
        `Analyze this workout program or fitness document. Provide detailed feedback on exercise selection, volume, progression, and optimization recommendations based on exercise science research.`;

      // Get AI analysis
      const analysis = await aiService.getCoachingAdvice(`${analysisPrompt}\n\nFile: ${selectedFile.name}\nType: ${isImage ? 'Progress Photo' : 'Workout Program'}`);
      
      const success = await incrementUsage('progress_analyses');
      if (!success) {
        setIsAnalyzing(false);
        return;
      }

      // Save to database
      await saveProgressPhoto(selectedFile.name, analysis);

      // Reset form
      setSelectedFile(null);
      setNotes("");
      setWeight("");
      
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">ProgressAI</h1>
            <p className="text-gray-400">AI-powered progress photo & workout program analysis</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          Computer Vision & Program Analysis
        </Badge>
        <UsageIndicator featureKey="progress_analyses" featureName="Progress Analysis" compact />
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <History className="w-4 h-4 mr-2" />
          History ({photos.length})
        </Button>
      </div>

      {showHistory && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Progress History</CardTitle>
            <CardDescription className="text-gray-400">
              Your saved progress photos and analyses
            </CardDescription>
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
                        {photo.weight_at_time && ` • ${photo.weight_at_time} lbs`}
                      </p>
                      {photo.notes && (
                        <p className="text-gray-300 text-sm mt-1">{photo.notes}</p>
                      )}
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
            <CardTitle className="text-white">Upload Progress Content</CardTitle>
            <CardDescription className="text-gray-400">
              Upload photos for body composition analysis or workout programs for optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Click to upload file</p>
                <p className="text-gray-400 text-sm">Images, PDFs, or text files up to 10MB</p>
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedFile.type.startsWith('image/') ? (
                      <Camera className="w-5 h-5 text-purple-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {selectedFile.type.startsWith('image/') && (
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

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Current Weight (lbs)</label>
                        <Input
                          type="number"
                          placeholder="e.g., 175"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Notes (optional)</label>
                        <Input
                          placeholder="Any additional context..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !canUseFeature('progress_analyses')}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Content"}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-2">📸 Upload Tips for Best Results:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Photos:</strong> Well-lit, minimal clothing, consistent poses</li>
                <li>• <strong>Programs:</strong> Clear exercise names, sets, reps, and progression</li>
                <li>• <strong>Format:</strong> PDF, Word docs, or clear images work best</li>
                <li>• <strong>Detail:</strong> Include goals, experience level, available equipment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
            <CardDescription className="text-gray-400">
              Live analysis and saved progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <div>
                    <p className="text-white font-medium">Analyzing your content...</p>
                    <p className="text-gray-400 text-sm">Using AI algorithms for detailed analysis</p>
                  </div>
                </div>
              </div>
            )}

            {!selectedFile && !isAnalyzing && (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500">Upload content to see analysis</p>
                <p className="text-gray-600 text-sm">All results are automatically saved to your profile</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAI;
