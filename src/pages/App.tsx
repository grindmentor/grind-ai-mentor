
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Brain, Camera, Utensils, TrendingUp, Dumbbell, Settings } from "lucide-react";

const App = () => {
  const [activeModule, setActiveModule] = useState("setup");
  const [userProfile, setUserProfile] = useState({
    height: "",
    weight: "",
    age: "",
    goal: "",
    experience: "",
    gender: ""
  });

  const modules = [
    { id: "mealplan", name: "MealPlan AI", icon: Utensils, color: "bg-green-500" },
    { id: "coach", name: "Coach GPT", icon: Brain, color: "bg-blue-500" },
    { id: "training", name: "Training", icon: Dumbbell, color: "bg-purple-500" },
    { id: "cutcalc", name: "CutCalc", icon: TrendingUp, color: "bg-pink-500" },
    { id: "food", name: "Food Track", icon: Camera, color: "bg-yellow-500" }
  ];

  const goals = [
    { value: "cutting", label: "Cutting" },
    { value: "bulking", label: "Bulking" },
    { value: "strength", label: "Strength" },
    { value: "hypertrophy", label: "Hypertrophy" },
    { value: "maintenance", label: "Maintenance" }
  ];

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height" className="text-gray-300">Height (cm)</Label>
              <Input
                id="height"
                value={userProfile.height}
                onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="175"
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-gray-300">Weight (kg)</Label>
              <Input
                id="weight"
                value={userProfile.weight}
                onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="80"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="age" className="text-gray-300">Age</Label>
            <Input
              id="age"
              value={userProfile.age}
              onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
              className="bg-gray-800 border-gray-600 text-white"
              placeholder="25"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-3 block">Gender</Label>
            <RadioGroup 
              value={userProfile.gender} 
              onValueChange={(value) => setUserProfile({...userProfile, gender: value})}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="text-gray-300">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="text-gray-300">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-gray-300 mb-3 block">Primary Goal</Label>
            <Select value={userProfile.goal} onValueChange={(value) => setUserProfile({...userProfile, goal: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {goals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value} className="text-white">
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300 mb-3 block">Training Experience</Label>
            <Select value={userProfile.experience} onValueChange={(value) => setUserProfile({...userProfile, experience: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="beginner" className="text-white">Beginner (0-1 years)</SelectItem>
                <SelectItem value="intermediate" className="text-white">Intermediate (1-3 years)</SelectItem>
                <SelectItem value="advanced" className="text-white">Advanced (3+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            onClick={() => setActiveModule("mealplan")}
          >
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderMealPlan = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            MealPlan AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Today's Plan</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white">Breakfast</h4>
                  <p className="text-gray-400 text-sm">Oatmeal with berries and protein powder</p>
                  <p className="text-orange-400 text-sm">450 cal • 30g protein</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white">Lunch</h4>
                  <p className="text-gray-400 text-sm">Chicken breast with rice and vegetables</p>
                  <p className="text-orange-400 text-sm">620 cal • 45g protein</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white">Dinner</h4>
                  <p className="text-gray-400 text-sm">Salmon with sweet potato and broccoli</p>
                  <p className="text-orange-400 text-sm">550 cal • 40g protein</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Daily Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Calories</span>
                  <span className="text-white font-medium">1,620 / 2,200</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Protein</span>
                  <span className="text-white font-medium">115g / 150g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Carbs</span>
                  <span className="text-white font-medium">180g / 220g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Fat</span>
                  <span className="text-white font-medium">65g / 80g</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Generate New Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoach = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Coach GPT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            <div className="flex">
              <div className="bg-blue-600 p-3 rounded-lg max-w-xs">
                <p className="text-white text-sm">Hi! I'm your AI coach. How can I help you today?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-gray-700 p-3 rounded-lg max-w-xs">
                <p className="text-white text-sm">What's the best rep range for hypertrophy?</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-blue-600 p-3 rounded-lg max-w-md">
                <p className="text-white text-sm">For hypertrophy, aim for 8-12 reps per set with 65-80% of your 1RM. This rep range optimizes muscle tension and metabolic stress, key drivers of muscle growth.</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Input 
              placeholder="Ask your coach anything..."
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTraining = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Dumbbell className="w-5 h-5 mr-2" />
            Training Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Today's Workout: Push Day</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">Bench Press</h4>
                    <Badge className="bg-purple-600">Compound</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">4 sets × 8-10 reps</p>
                  <p className="text-orange-400 text-sm">80kg × 8, 82.5kg × 8, 85kg × 6</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">Incline Dumbbell Press</h4>
                    <Badge className="bg-purple-600">Compound</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">3 sets × 10-12 reps</p>
                  <p className="text-orange-400 text-sm">35kg × 10, 35kg × 9, 32.5kg × 12</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">Shoulder Press</h4>
                    <Badge className="bg-blue-600">Isolation</Badge>
                  </div>
                  <p className="text-gray-400 text-sm">3 sets × 12-15 reps</p>
                  <p className="text-orange-400 text-sm">25kg × 12, 25kg × 11, 22.5kg × 15</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Workouts Completed</span>
                  <span className="text-white font-medium">4/6</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Total Volume</span>
                  <span className="text-white font-medium">12,450 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">PRs This Week</span>
                  <span className="text-white font-medium">2</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                Start Workout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCutCalc = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            CutCalc Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Progress Photos</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Upload this week's photo</p>
                  <Button className="mt-2 bg-pink-600 hover:bg-pink-700">
                    Take Photo
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">AI Analysis</h4>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    Great progress! You've lost approximately 1.2kg this week. 
                    Your midsection is showing more definition, and your shoulders 
                    appear more vascular. Keep up the current plan.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Body Composition</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Current Weight</span>
                  <span className="text-white font-medium">78.5 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Body Fat (AI Estimate)</span>
                  <span className="text-white font-medium">12.3%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Weekly Change</span>
                  <span className="text-green-400 font-medium">-1.2 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">Target Weight</span>
                  <span className="text-white font-medium">75.0 kg</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-1">Recommendation</h4>
                <p className="text-gray-300 text-sm">
                  Maintain current deficit. Consider adding 1 refeed day this week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFoodTrack = () => (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Food Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Log Food</h3>
              <div className="p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 text-center mb-4">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Take a photo of your meal</p>
                <Button className="mt-2 bg-yellow-600 hover:bg-yellow-700">
                  Snap & Log
                </Button>
              </div>
              <div className="space-y-2">
                <Input 
                  placeholder="Search food database..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button className="w-full bg-gray-700 hover:bg-gray-600">
                  Add Custom Food
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Meals</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    <div>
                      <h4 className="font-medium text-white">Grilled Chicken</h4>
                      <p className="text-gray-400 text-sm">150g • 248 cal • 46g protein</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    <div>
                      <h4 className="font-medium text-white">Brown Rice</h4>
                      <p className="text-gray-400 text-sm">100g • 362 cal • 7g protein</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    <div>
                      <h4 className="font-medium text-white">Mixed Vegetables</h4>
                      <p className="text-gray-400 text-sm">200g • 65 cal • 3g protein</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeModule) {
      case "setup": return renderSetup();
      case "mealplan": return renderMealPlan();
      case "coach": return renderCoach();
      case "training": return renderTraining();
      case "cutcalc": return renderCutCalc();
      case "food": return renderFoodTrack();
      default: return renderSetup();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">GM</span>
            </div>
            <span className="text-xl font-bold">GrindMentor</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Premium
            </Badge>
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* Module Navigation */}
      {activeModule !== "setup" && (
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="flex space-x-1 max-w-7xl mx-auto">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeModule === module.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <div className={`w-4 h-4 ${module.color} rounded flex items-center justify-center`}>
                  <module.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">{module.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
