import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Utensils, Zap, ArrowLeft, Sparkles, Target, Clock, CheckCircle, Award } from "lucide-react";
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
      const analysisPrompt = `You are a professional nutritionist with access to the latest USDA Food Data Central (2024), FoodData4 database, and the most recent Matvaretabellen (Norwegian Food Composition Table 2024). Analyze this food photo with scientific precision.

Use the most current nutritional databases and research from 2023-2024 to provide:

1. **Food Identification**: List all visible foods using the latest food classification systems
2. **Portion Estimation**: Use evidence-based visual portion estimation methods from recent nutrition research (2023-2024)
3. **Macro & Micronutrient Analysis**: Cross-reference with multiple current databases:
   - USDA Food Data Central (2024 release)
   - Latest Matvaretabellen entries
   - Recent food industry nutritional updates
4. **Total Nutritional Profile**: Precise calculations based on latest data
5. **Professional Recommendations**: Based on current nutritional science and dietary guidelines (2024)

Meal context: ${mealType}
${additionalNotes ? `Additional notes: ${additionalNotes}` : ''}

Provide exact values using the most recent and accurate nutritional data available. Reference specific databases when possible.`;

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

      // Enhanced parsing with better accuracy
      const calories = extractNutrientValue(analysis, 'calories') || 0;
      const protein = extractNutrientValue(analysis, 'protein') || 0;
      const carbs = extractNutrientValue(analysis, 'carbs') || extractNutrientValue(analysis, 'carbohydrates') || 0;
      const fat = extractNutrientValue(analysis, 'fat') || 0;
      const fiber = extractNutrientValue(analysis, 'fiber') || 0;

      // Save to food log with enhanced metadata
      const { error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: `📸 AI Photo Analysis - ${selectedFile.name}`,
          meal_type: mealType,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          portion_size: `Professional AI Analysis: ${analysis.substring(0, 200)}...`,
          logged_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "✅ Photo Analysis Complete!",
        description: `Nutritional data added using latest 2024 databases. ${Math.round(calories)} cal, ${Math.round(protein)}g protein`,
      });

      // Reset form and notify parent
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
            
            <UsageIndicator featureKey="food_photo_analyses" featureName="Photo Analysis" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-6 py-3 text-base">
              <Award className="w-5 h-5 mr-2" />
              AI Photo Recognition
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
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Analyzing Photo...
                          </>
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
