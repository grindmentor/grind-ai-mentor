
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Utensils, Zap, ArrowLeft } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { aiService } from "@/services/aiService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const { canUseFeature, incrementUsage } = useUsageTracking();

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
      const analysisPrompt = `Analyze this food photo using the latest USDA and international food database information (2023-2024). Provide detailed nutritional information based on current nutritional science. Identify all visible foods and estimate their quantities using evidence-based portion size guidelines. Provide:

1. List of foods identified with scientific accuracy
2. Estimated portion sizes based on visual analysis research
3. Nutritional breakdown using latest database values (calories, protein, carbs, fat, fiber)
4. Total estimated values for the entire meal
5. Evidence-based nutritional recommendations and observations
6. Cross-reference with multiple reliable food databases for accuracy
      
Additional context: Meal type is ${mealType}. ${additionalNotes ? `Notes: ${additionalNotes}` : ''}
      
Please be as accurate as possible with portion size estimates using the latest research on visual portion estimation and provide scientific-based nutritional data from current food composition databases.`;

      const analysis = await aiService.getCoachingAdvice(analysisPrompt);
      
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

      // Parse the analysis to extract nutritional values (basic parsing)
      const calories = extractNutrientValue(analysis, 'calories') || 0;
      const protein = extractNutrientValue(analysis, 'protein') || 0;
      const carbs = extractNutrientValue(analysis, 'carbs') || extractNutrientValue(analysis, 'carbohydrates') || 0;
      const fat = extractNutrientValue(analysis, 'fat') || 0;
      const fiber = extractNutrientValue(analysis, 'fiber') || 0;

      // Save to food log
      const { error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: `Photo Analysis - ${selectedFile.name}`,
          meal_type: mealType,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          portion_size: `AI Analysis: ${analysis.substring(0, 200)}...`,
          logged_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Food photo analyzed!",
        description: "Nutritional information has been added to your food log.",
      });

      // Reset form
      setSelectedFile(null);
      setAdditionalNotes("");
      onFoodLogged();
      
    } catch (error) {
      console.error('Food analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again or log the food manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simple function to extract nutrient values from AI response
  const extractNutrientValue = (text: string, nutrient: string): number | null => {
    const patterns = [
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)`, 'i'),
      new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*g?\\s*${nutrient}`, 'i'),
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)\\s*g`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Food Photo Analysis</h1>
            <p className="text-gray-400">AI-powered nutrition analysis with scientific accuracy</p>
          </div>
        </div>
      </div>

      {!canUseFeature('food_photo_analyses') ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Food Photo Analysis</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Analyze food photos to automatically log nutritional information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Food photo analysis limit reached</p>
              <p className="text-gray-600 text-sm">Upgrade your plan to analyze more food photos</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Food Photo Analysis</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Take or upload a photo to automatically analyze and log nutritional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Nutrition Analysis
              </Badge>
              <UsageIndicator featureKey="food_photo_analyses" featureName="Food Photo Analysis" compact />
            </div>

            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="food-photo-upload"
              />
              <label htmlFor="food-photo-upload" className="cursor-pointer">
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Upload Food Photo</p>
                <p className="text-gray-400 text-sm">Take a clear photo of your meal for AI analysis</p>
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <Utensils className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Meal Type</label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as any)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes (optional)</label>
                      <Input
                        placeholder="e.g., homemade, restaurant meal, portion size..."
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyzeFood}
                    disabled={isAnalyzing}
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
                  >
                    {isAnalyzing ? "Analyzing Food..." : "Analyze & Log Food"}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-2">📸 Photo Tips for Best Results:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Lighting:</strong> Use natural light when possible</li>
                <li>• <strong>Angle:</strong> Take photos from above (bird's eye view)</li>
                <li>• <strong>Include reference:</strong> Place common items (fork, coin) for scale</li>
                <li>• <strong>Show all items:</strong> Capture the entire meal in one photo</li>
                <li>• <strong>Clear focus:</strong> Ensure all food items are clearly visible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodPhotoLogger;
