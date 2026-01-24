import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Utensils, Zap, ArrowLeft, Sparkles, Target, Clock, CheckCircle, Award, AlertTriangle } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SmartLoading from "@/components/ui/smart-loading";
import { compressImage, HIGH_QUALITY_OPTIONS } from "@/utils/imageCompression";

interface FoodPhotoLoggerProps {
  onBack: () => void;
  onFoodLogged: () => void;
}

const FoodPhotoLogger = ({ onBack, onFoodLogged }: FoodPhotoLoggerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [additionalNotes, setAdditionalNotes] = useState("");
  const { canUseFeature, incrementUsage, currentUsage, limits } = useUsageTracking();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!selectedFile || !user || !canUseFeature('food_photo_analyses')) return;
    
    setIsAnalyzing(true);
    
    try {
      // Compress image with high-quality settings for better OCR
      console.log('[FoodPhotoLogger] Compressing image...');
      const compressedFile = await compressImage(selectedFile, {
        ...HIGH_QUALITY_OPTIONS,
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.92,
      });
      
      // Convert to base64
      const imageBase64 = await convertFileToBase64(compressedFile);
      console.log('[FoodPhotoLogger] Image compressed, size:', Math.round(imageBase64.length / 1024), 'KB');
      
      // Call the food-photo-ai edge function
      const { data, error } = await supabase.functions.invoke('food-photo-ai', {
        body: {
          image: imageBase64,
          mealType,
          additionalNotes
        }
      });

      if (error) {
        console.error('Food photo analysis error:', error);
        throw new Error(error.message || 'Failed to analyze food photo');
      }

      // Check usage limits
      const success = await incrementUsage('food_photo_analyses');
      if (!success) {
        toast({
          title: "Usage limit reached",
          description: "You've reached your limit for food photo analysis this month.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Handle the structured response from the AI
      const analysis = data;
      
      if (analysis.confidence === 'low') {
        toast({
          title: "⚠️ Low Confidence Analysis",
          description: analysis.analysis || "Food detection confidence is low. Consider taking a clearer photo.",
          variant: "destructive",
        });
      }

      // Extract nutrition from the structured response
      const totalNutrition = analysis.totalNutrition || {};
      const calories = totalNutrition.calories || 0;
      const protein = totalNutrition.protein || 0;
      const carbs = totalNutrition.carbs || 0;
      const fat = totalNutrition.fat || 0;
      const fiber = totalNutrition.fiber || 0;

      // Create detailed food name with detected items
      const detectedFoods = analysis.foodsDetected || [];
      const foodNames = detectedFoods.map(food => food.name).join(', ') || 'Mixed Foods';
      const foodName = `📸 ${foodNames}`;

      // Create detailed portion description
      const portionDetails = detectedFoods.map(food => 
        `${food.name}: ${food.quantity}`
      ).join(' | ');
      const portionSize = portionDetails || 'AI Photo Analysis';

      // Save to food log with enhanced data
      const { error: logError } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: foodName,
          meal_type: mealType,
          calories: Math.round(calories),
          protein: Math.round((protein || 0) * 10) / 10,
          carbs: Math.round((carbs || 0) * 10) / 10,
          fat: Math.round((fat || 0) * 10) / 10,
          fiber: Math.round((fiber || 0) * 10) / 10,
          portion_size: `${portionSize} | Analysis: ${analysis.analysis?.substring(0, 100) || 'AI processed'}`,
          logged_date: new Date().toISOString().split('T')[0]
        });

      if (logError) throw logError;

      // Show success message based on confidence
      const confidenceEmoji = analysis.confidence === 'high' ? '✅' : analysis.confidence === 'medium' ? '⚡' : '⚠️';
      
      toast({
        title: `${confidenceEmoji} Photo Analysis Complete!`,
        description: `${Math.round(calories)} cal, ${Math.round(protein)}g protein detected. Confidence: ${analysis.confidence}`,
      });

      // Show recommendations if available
      if (analysis.recommendations) {
        setTimeout(() => {
          toast({
            title: "💡 Nutrition Insight",
            description: analysis.recommendations,
          });
        }, 2000);
      }

      // Reset form and notify parent
      setSelectedFile(null);
      setAdditionalNotes("");
      onFoodLogged();
      
    } catch (error) {
      console.error('Food analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again or log the food manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractNutrientValue = (text: string, nutrient: string): number | null => {
    const patterns = [
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)`, 'i'),
      new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*g?\\s*${nutrient}`, 'i'),
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)\\s*g`, 'i'),
      new RegExp(`total\\s+${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    return null;
  };

  const features = [
    {
      icon: <Target className="w-4 h-4" />,
      title: "AI Recognition",
      description: "Advanced food identification"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Macro Analysis",
      description: "Precise nutritional breakdown"
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      title: "Smart Logging",
      description: "Automatic food diary entry"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Quick Process",
      description: "Instant photo analysis"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-pink-900 text-white">
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-8">
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
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/25 border-2 border-pink-400/30">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Food Photo Logger
                  </h1>
                  <p className="text-slate-400 text-lg">AI-powered nutrition analysis from photos</p>
                </div>
              </div>
            </div>
            {/* Usage Counter */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-slate-300">
                  <span className="font-semibold text-white">
                    {currentUsage.food_photo_analyses || 0}
                  </span>
                  <span className="text-slate-400">
                    /{limits?.food_photo_analyses === -1 ? '∞' : (limits?.food_photo_analyses || 30)} used this month
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-6 py-3 text-base">
              <AlertTriangle className="w-5 h-5 mr-2" />
              BETA - Photo analysis may not work consistently
            </Badge>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-pink-400/20">
                    <div className="text-pink-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-xs">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {!canUseFeature('food_photo_analyses') ? (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">Photo Analysis Limit Reached</h3>
                <p className="text-slate-400 mb-4">Upgrade your plan to analyze more food photos</p>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  Upgrade Required
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-2xl flex items-center">
                  <Camera className="w-6 h-6 mr-3 text-pink-400" />
                  Food Photo Analysis
                </CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Upload a photo for instant nutritional analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-pink-500/30 hover:border-pink-400/50 rounded-2xl p-8 text-center transition-all duration-200 bg-slate-800/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="food-photo-upload"
                  />
                  <label htmlFor="food-photo-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-400/20">
                      <Camera className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-white font-semibold text-xl mb-2">Upload Food Photo</h3>
                    <p className="text-slate-400">AI analysis with nutritional breakdown</p>
                  </label>
                </div>

                {selectedFile && (
                  <Card className="bg-slate-800/40 border-slate-600/40">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-400/20">
                          <Utensils className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{selectedFile.name}</p>
                          <p className="text-slate-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Meal Type</label>
                          <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value as any)}
                            className="w-full p-3 bg-slate-700/40 border border-slate-600/50 text-white rounded-xl focus:border-pink-500 transition-colors"
                          >
                            <option value="breakfast">🌅 Breakfast</option>
                            <option value="lunch">☀️ Lunch</option>
                            <option value="dinner">🌙 Dinner</option>
                            <option value="snack">🥨 Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                          <Input
                            placeholder="e.g., homemade, restaurant..."
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            className="bg-slate-700/40 border-slate-600/50 text-white focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleAnalyzeFood}
                        disabled={isAnalyzing}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-medium py-4 rounded-xl transition-all duration-200 shadow-xl shadow-pink-500/25"
                      >
                        {isAnalyzing ? (
                          <SmartLoading 
                            message="Analyzing Photo..." 
                            type="analysis" 
                            size="sm"
                            className="text-white"
                          />
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-3" />
                            Analyze & Log Food
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="bg-slate-800/30 border-slate-600/40">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-pink-400" />
                      📸 Photo Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="text-slate-400">
                        <span className="font-medium text-slate-300">• Lighting:</span> Good natural light
                      </div>
                      <div className="text-slate-400">
                        <span className="font-medium text-slate-300">• Angle:</span> Top-down view
                      </div>
                      <div className="text-slate-400">
                        <span className="font-medium text-slate-300">• Reference:</span> Include utensils for scale
                      </div>
                      <div className="text-slate-400">
                        <span className="font-medium text-slate-300">• Quality:</span> Clear, focused images
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodPhotoLogger;
