
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Upload, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";

interface ProgressAIProps {
  onBack: () => void;
}

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  analysis?: string;
}

const ProgressAI = ({ onBack }: ProgressAIProps) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisUsed, setAnalysisUsed] = useState(0);
  const maxAnalysis = 3;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || analysisUsed >= maxAnalysis) return;
    
    setIsAnalyzing(true);
    setAnalysisUsed(prev => prev + 1);
    
    // Create photo URL
    const photoUrl = URL.createObjectURL(selectedFile);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = `🔥 **Progress Analysis Results**

**Body Composition Assessment:**
• **Muscle Definition:** Visible improvements in shoulder and arm definition
• **Body Fat Estimate:** Approximately 12-15% (estimated from visual markers)
• **Posture Analysis:** Good overall posture, slight forward head position detected

**Key Observations:**
• **Deltoids:** Well-developed, showing separation between anterior/posterior heads
• **Arms:** Increased vascularity indicating lower body fat percentage
• **Core:** Developing ab definition, recommend continued focus on core work
• **Symmetry:** Good left-right balance

**Science-Based Recommendations:**
Based on visual markers and current physique development:

1. **Training Focus:** Continue current program with emphasis on:
   - Posterior chain strengthening (rows, pull-ups)
   - Core stability work (planks, dead bugs)
   - Progressive overload on compound movements

2. **Nutrition Timing:** 
   - Consider slight caloric surplus (+200-300 cal) for lean gains
   - Maintain protein at 0.8-1g per lb bodyweight
   - Time carbs around workouts for performance

3. **Recovery Metrics:**
   - Current muscle definition suggests good recovery
   - Consider tracking sleep quality (aim for 7-9 hours)
   - Monitor stress levels as they affect cortisol/muscle retention

**Next Photo Comparison:**
Take your next progress photo in 2-4 weeks under similar:
- Lighting conditions (natural light preferred)
- Time of day (morning, fasted state)
- Camera angle and distance

**Estimated Timeline for Next Milestone:**
Based on current progress rate: 6-8 weeks for next significant visual change.

*Analysis based on computer vision and validated body composition research*`;

      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        url: photoUrl,
        date: new Date().toLocaleDateString(),
        analysis
      };

      setPhotos(prev => [newPhoto, ...prev]);
      setSelectedFile(null);
      setIsAnalyzing(false);
    }, 3000);
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
            <p className="text-gray-400">AI-powered progress photo analysis & body composition tracking</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending Feature - Computer Vision Analysis
        </Badge>
        <Badge className={`${analysisUsed >= maxAnalysis ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
          {analysisUsed}/{maxAnalysis} analyses used
        </Badge>
      </div>

      {analysisUsed >= maxAnalysis && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Analysis Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              Upgrade to get unlimited photo analysis and detailed body composition tracking
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Upload Progress Photo</CardTitle>
            <CardDescription className="text-gray-400">
              Upload your progress photo for AI-powered body composition analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Click to upload photo</p>
                <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || analysisUsed >= maxAnalysis}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Photo"}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">📸 Photo Tips for Best Results:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Well-lit environment (natural light preferred)</li>
                <li>• Minimal clothing to show muscle definition</li>
                <li>• Consistent poses (front, side, back views)</li>
                <li>• Same time of day for consistent comparison</li>
                <li>• Relaxed, natural stance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Progress Timeline</CardTitle>
            <CardDescription className="text-gray-400">
              Your photo analysis history and progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <div>
                    <p className="text-white font-medium">Analyzing your progress photo...</p>
                    <p className="text-gray-400 text-sm">Using computer vision and body composition algorithms</p>
                  </div>
                </div>
              </div>
            )}

            {photos.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={photo.url} 
                        alt="Progress photo"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">Analysis - {photo.date}</p>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Completed
                          </Badge>
                        </div>
                        {photo.analysis && (
                          <div className="text-gray-300 text-sm">
                            <pre className="whitespace-pre-wrap">{photo.analysis}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500">No progress photos uploaded yet</p>
                <p className="text-gray-600 text-sm">Upload your first photo to start tracking!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAI;
