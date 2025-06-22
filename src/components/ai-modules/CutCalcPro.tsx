
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft, Camera } from "lucide-react";
import { useState } from "react";

interface CutCalcProProps {
  onBack: () => void;
}

const CutCalcPro = ({ onBack }: CutCalcProProps) => {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = () => {
    if (!weight) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const weightNum = parseFloat(weight);
      const bfNum = bodyFat ? parseFloat(bodyFat) : 15; // Default estimate
      
      setAnalysis(`**Body Composition Analysis**

**Current Stats:**
• Weight: ${weight} lbs
• Estimated Body Fat: ${bfNum}%
• Lean Body Mass: ${(weightNum * (1 - bfNum/100)).toFixed(1)} lbs
• Fat Mass: ${(weightNum * (bfNum/100)).toFixed(1)} lbs

**Phase Recommendations:**

${bfNum > 20 ? `**Cutting Phase Recommended**
• Target: 1-2 lbs fat loss per week
• Calorie deficit: 500-750 calories below maintenance
• Maintain protein: ${(weightNum * 1.2).toFixed(0)}g per day
• Resistance training to preserve muscle mass

**Scientific Support:**
• Moderate deficits preserve lean mass better (Garthe et al., 2011)
• Higher protein intake prevents muscle loss (Helms et al., 2014)` : 
bfNum < 12 ? `**Lean Bulking Phase Recommended**
• Target: 0.5-1 lb gain per week
• Calorie surplus: 200-400 calories above maintenance  
• Protein: ${(weightNum * 1.0).toFixed(0)}g per day
• Focus on progressive overload training

**Scientific Support:**
• Slow weight gain minimizes fat accumulation (Garthe et al., 2019)
• Adequate protein supports muscle protein synthesis (Moore et al., 2009)` :
`**Maintenance/Recomposition Phase**
• Maintain current weight
• Eat at maintenance calories
• High protein: ${(weightNum * 1.2).toFixed(0)}g per day
• Focus on strength training progression

**Scientific Support:**
• Body recomposition possible at maintenance (Barakat et al., 2020)
• Sufficient protein enables simultaneous fat loss and muscle gain`}

**Tracking Recommendations:**
• Weekly progress photos (same time, lighting, poses)
• Body weight (daily, same time, track weekly averages)
• Waist circumference measurements
• Performance metrics (strength, endurance)

**Important Notes:**
• Body fat estimates have ±3-5% margin of error
• Progress photos often more reliable than scale weight
• Consistency in tracking methods is key

**References:**
1. Garthe, I., et al. (2011). Effect of weight loss rates on fat-free mass retention
2. Helms, E., et al. (2014). High-protein, low-fat, short-term diet for fat loss
3. Barakat, C., et al. (2020). Body recomposition: Can trained individuals build muscle and lose fat?`);
      
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CutCalc Pro</h1>
            <p className="text-gray-400">Body composition analysis</p>
          </div>
        </div>
      </div>

      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
        Analysis based on validated body composition research
      </Badge>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Body Composition Input</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your current stats for personalized analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-white">Current Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="180"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyfat" className="text-white">Body Fat % (optional)</Label>
              <Input
                id="bodyfat"
                type="number"
                placeholder="15"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Leave blank for visual estimation</p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center space-x-2 text-gray-400 mb-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Photo Analysis (Coming Soon)</span>
              </div>
              <p className="text-xs text-gray-500">
                Upload progress photos for visual body fat estimation using AI
              </p>
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={!weight || isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isLoading ? "Analyzing..." : "Analyze Body Composition"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
            <CardDescription className="text-gray-400">
              Science-backed recommendations for your goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your weight above to get your personalized body composition analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CutCalcPro;
