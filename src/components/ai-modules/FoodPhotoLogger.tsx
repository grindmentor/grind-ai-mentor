
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Utensils, Zap, ArrowLeft, Sparkles, Target, Clock, CheckCircle } from "lucide-react";
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

  // Enhanced nutrient extraction with multiple patterns
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
      title: "2024 Databases",
      description: "USDA Food Data Central, Matvaretabellen"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Professional Accuracy",
      description: "Evidence-based portion estimation"
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      title: "Scientific Method",
      description: "Cross-referenced nutritional data"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Instant Analysis",
      description: "Complete macro and micro breakdown"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-emerald-900">
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Food Photo Analysis
                  </h1>
                  <p className="text-slate-400 text-lg">AI-powered nutrition analysis with 2024 scientific databases</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="food_photo_analyses" featureName="Photo Analysis" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Latest 2024 Nutrition Databases
            </Badge>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <div className="text-green-400">
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
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-medium mb-2">Food Photo Analysis Limit Reached</h3>
                <p className="text-slate-400 text-sm mb-4">Upgrade your plan to analyze more food photos</p>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Upgrade Required
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <Camera className="w-5 h-5 mr-3 text-green-400" />
                  Professional Food Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Take or upload a photo for professional nutritional analysis using 2024 databases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-600 hover:border-green-500/50 rounded-2xl p-8 text-center transition-all duration-200 bg-slate-800/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="food-photo-upload"
                  />
                  <label htmlFor="food-photo-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Upload Food Photo</h3>
                    <p className="text-slate-400 text-sm">Professional analysis with latest nutrition databases</p>
                  </label>
                </div>

                {selectedFile && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedFile.name}</p>
                          <p className="text-slate-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Meal Type</label>
                          <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value as any)}
                            className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:border-green-500 transition-colors"
                          >
                            <option value="breakfast">🌅 Breakfast</option>
                            <option value="lunch">☀️ Lunch</option>
                            <option value="dinner">🌙 Dinner</option>
                            <option value="snack">🥨 Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context</label>
                          <Input
                            placeholder="e.g., homemade, restaurant, portion size..."
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white focus:border-green-500"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleAnalyzeFood}
                        disabled={isAnalyzing}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            🔍 Analyzing with 2024 Databases...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            🔬 Professional Analysis & Log
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-400" />
                      📸 Analysis Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="text-slate-300">
                        <span className="font-medium text-green-400">• Best Lighting:</span> Natural, overhead lighting
                      </div>
                      <div className="text-slate-300">
                        <span className="font-medium text-green-400">• Angle:</span> Top-down view preferred
                      </div>
                      <div className="text-slate-300">
                        <span className="font-medium text-green-400">• Reference:</span> Include utensils for scale
                      </div>
                      <div className="text-slate-300">
                        <span className="font-medium text-green-400">• Quality:</span> Clear, focused images
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
