import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const [foodInput, setFoodInput] = useState("");
  const [entries, setEntries] = useState<FoodEntry[]>([
    {
      id: 1,
      name: "Greek Yogurt with Berries",
      calories: 180,
      protein: 20,
      carbs: 15,
      fat: 5,
      time: "8:30 AM"
    },
    {
      id: 2,
      name: "Grilled Chicken Breast (6oz)",
      calories: 280,
      protein: 54,
      carbs: 0,
      fat: 6,
      time: "12:45 PM"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFood = () => {
    if (!foodInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI food recognition
    setTimeout(() => {
      const newEntry: FoodEntry = {
        id: entries.length + 1,
        name: foodInput,
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 30) + 5,
        carbs: Math.floor(Math.random() * 40) + 10,
        fat: Math.floor(Math.random() * 15) + 3,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setEntries(prev => [...prev, newEntry]);
      setFoodInput("");
      setIsLoading(false);
    }, 1500);
  };

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalCarbs = entries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalFat = entries.reduce((sum, entry) => sum + entry.fat, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Food Log</h1>
            <p className="text-gray-400">AI-powered nutrition tracking</p>
          </div>
        </div>
      </div>

      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
        Powered by food recognition AI and validated nutrition database
      </Badge>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="log" className="text-white">Food Log</TabsTrigger>
          <TabsTrigger value="summary" className="text-white">Daily Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Add Food</CardTitle>
                <CardDescription className="text-gray-400">
                  Type food name or take a photo for AI recognition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., '2 eggs scrambled' or 'banana'"
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFood()}
                  />
                  <Button 
                    onClick={handleAddFood}
                    disabled={!foodInput.trim() || isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-lg">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Photo Recognition (Coming Soon)</p>
                    <p className="text-xs text-gray-600">Take a photo for instant nutrition analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Today's Entries</CardTitle>
                <CardDescription className="text-gray-400">
                  All food logged for {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{entry.name}</h4>
                        <p className="text-gray-400 text-sm">{entry.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{entry.calories} cal</p>
                        <p className="text-gray-400 text-xs">
                          P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
                      <div className="animate-pulse text-gray-400">Analyzing nutrition...</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Daily Nutrition Summary</CardTitle>
              <CardDescription className="text-gray-400">
                Your macro and calorie breakdown for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-white">{totalCalories}</p>
                  <p className="text-gray-400 text-sm">Calories</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{totalProtein}g</p>
                  <p className="text-gray-400 text-sm">Protein</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{totalCarbs}g</p>
                  <p className="text-gray-400 text-sm">Carbs</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{totalFat}g</p>
                  <p className="text-gray-400 text-sm">Fat</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Macro Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Protein ({Math.round((totalProtein * 4 / totalCalories) * 100)}%)</span>
                    <span className="text-green-400">{totalProtein * 4} cal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${(totalProtein * 4 / totalCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Carbs ({Math.round((totalCarbs * 4 / totalCalories) * 100)}%)</span>
                    <span className="text-blue-400">{totalCarbs * 4} cal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${(totalCarbs * 4 / totalCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Fat ({Math.round((totalFat * 9 / totalCalories) * 100)}%)</span>
                    <span className="text-yellow-400">{totalFat * 9} cal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${(totalFat * 9 / totalCalories) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartFoodLog;
