
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Upload, Zap, TrendingUp, FileText, Download } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { aiService } from "@/services/aiService";

interface ProgressAIProps {
  onBack: () => void;
}

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  type: 'image' | 'file';
  fileName?: string;
  analysis?: string;
}

const ProgressAI = ({ onBack }: ProgressAIProps) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !canUseFeature('progress_analyses')) return;
    
    setIsAnalyzing(true);
    
    const photoUrl = URL.createObjectURL(selectedFile);
    const isImage = selectedFile.type.startsWith('image/');
    
    try {
      // Create analysis prompt based on file type
      const analysisPrompt = isImage ? 
        `Analyze this progress photo for body composition, muscle definition, and provide science-based recommendations for training and nutrition. Include specific observations about muscle development, body fat percentage estimates, posture, and actionable next steps.` :
        `Analyze this workout program or fitness document. Provide detailed feedback on exercise selection, volume, progression, and optimization recommendations based on exercise science research.`;

      // Get AI analysis
      const analysis = await aiService.getCoachingAdvice(`${analysisPrompt}\n\nFile: ${selectedFile.name}\nType: ${isImage ? 'Progress Photo' : 'Workout Program'}`);
      
      const success = await incrementUsage('progress_analyses');
      if (!success) {
        setIsAnalyzing(false);
        return;
      }

      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        url: photoUrl,
        date: new Date().toLocaleDateString(),
        type: isImage ? 'image' : 'file',
        fileName: selectedFile.name,
        analysis
      };

      setPhotos(prev => [newPhoto, ...prev]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Analysis error:', error);
      // Don't increment usage on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
      </div>

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
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !canUseFeature('progress_analyses')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
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
              Your uploaded content and AI analysis results
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

            {photos.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-start space-x-4">
                      {photo.type === 'image' ? (
                        <img 
                          src={photo.url} 
                          alt="Progress content"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">
                              {photo.type === 'image' ? 'Photo Analysis' : 'Program Analysis'} - {photo.date}
                            </p>
                            {photo.fileName && (
                              <p className="text-gray-400 text-sm">{photo.fileName}</p>
                            )}
                          </div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Completed
                          </Badge>
                        </div>
                        {photo.analysis && (
                          <div className="text-gray-300 text-sm">
                            <pre className="whitespace-pre-wrap font-sans">{photo.analysis}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500">No content uploaded yet</p>
                <p className="text-gray-600 text-sm">Upload photos or workout programs to start analyzing!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAI;
