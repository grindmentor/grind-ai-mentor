
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Dumbbell, Target, Users, Clock, Play, Plus, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  tips?: string[];
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = ["all", "chest", "back", "shoulders", "arms", "legs", "core", "cardio"];

  const exercises: Exercise[] = [
    {
      id: "1",
      name: "Bench Press",
      category: "chest",
      difficulty: "intermediate",
      equipment: ["barbell", "bench"],
      primaryMuscles: ["chest", "triceps"],
      secondaryMuscles: ["shoulders"],
      description: "The bench press is a fundamental compound exercise that primarily targets the chest muscles while also engaging the triceps and front deltoids.",
      instructions: [
        "Lie flat on the bench with your eyes under the barbell",
        "Grip the bar slightly wider than shoulder-width apart",
        "Unrack the bar and position it over your chest",
        "Lower the bar to your chest with control",
        "Press the bar back up to the starting position",
        "Keep your core tight and feet planted on the floor"
      ],
      tips: [
        "Maintain a slight arch in your back",
        "Keep your shoulder blades retracted",
        "Control the eccentric (lowering) portion",
        "Don't bounce the bar off your chest"
      ]
    },
    {
      id: "2",
      name: "Deadlift",
      category: "back",
      difficulty: "advanced",
      equipment: ["barbell"],
      primaryMuscles: ["hamstrings", "glutes", "lower back"],
      secondaryMuscles: ["traps", "lats", "core"],
      description: "The deadlift is one of the most effective compound exercises, working nearly every muscle in your body while building incredible strength and power.",
      instructions: [
        "Stand with feet hip-width apart, bar over mid-foot",
        "Bend at hips and knees to grip the bar",
        "Keep your chest up and back straight",
        "Drive through your heels to lift the bar",
        "Stand tall with shoulders back at the top",
        "Lower the bar with control, hinging at the hips"
      ],
      tips: [
        "Keep the bar close to your body throughout",
        "Engage your lats to maintain proper bar path",
        "Don't round your back",
        "Start with lighter weight to master form"
      ]
    },
    {
      id: "3",
      name: "Squat",
      category: "legs",
      difficulty: "intermediate",
      equipment: ["barbell", "squat rack"],
      primaryMuscles: ["quadriceps", "glutes"],
      secondaryMuscles: ["hamstrings", "calves", "core"],
      description: "The squat is a fundamental movement pattern that builds lower body strength, power, and muscle mass while improving mobility and stability.",
      instructions: [
        "Position the bar on your upper traps",
        "Stand with feet shoulder-width apart",
        "Initiate the movement by sitting back with your hips",
        "Lower until your thighs are parallel to the floor",
        "Drive through your heels to return to standing",
        "Keep your chest up and knees tracking over toes"
      ],
      tips: [
        "Maintain a neutral spine throughout",
        "Go as deep as your mobility allows",
        "Keep your weight balanced over mid-foot",
        "Breathe in at the top, hold during the rep"
      ]
    },
    {
      id: "4",
      name: "Pull-ups",
      category: "back",
      difficulty: "intermediate",
      equipment: ["pull-up bar"],
      primaryMuscles: ["lats", "rhomboids"],
      secondaryMuscles: ["biceps", "rear delts"],
      description: "Pull-ups are an excellent bodyweight exercise for building upper body pulling strength and developing a wide, muscular back.",
      instructions: [
        "Hang from the bar with hands slightly wider than shoulders",
        "Engage your core and pull your shoulders down",
        "Pull your body up until your chin clears the bar",
        "Lower yourself with control to full arm extension",
        "Maintain tension throughout the movement"
      ],
      tips: [
        "Avoid swinging or using momentum",
        "Focus on pulling with your back muscles",
        "Use assisted variations if needed",
        "Full range of motion is key"
      ]
    },
    {
      id: "5",
      name: "Overhead Press",
      category: "shoulders",
      difficulty: "intermediate",
      equipment: ["barbell"],
      primaryMuscles: ["shoulders"],
      secondaryMuscles: ["triceps", "core"],
      description: "The overhead press builds impressive shoulder strength and stability while engaging the entire core for a complete upper body exercise.",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Hold the bar at shoulder level with hands just outside shoulders",
        "Press the bar straight overhead",
        "Keep your core tight and avoid arching your back",
        "Lower the bar back to shoulder level with control"
      ],
      tips: [
        "Keep the bar path straight and vertical",
        "Engage your glutes to maintain stability",
        "Don't press the bar behind your head",
        "Start with lighter weight to build shoulder stability"
      ]
    }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = `Create a comprehensive exercise description for "${newExerciseName}". Include:

1. Detailed description of the exercise and its benefits
2. Primary and secondary muscles worked
3. Step-by-step instructions (6-8 steps)
4. Equipment needed
5. Difficulty level (beginner/intermediate/advanced)
6. Safety tips and form cues
7. Common mistakes to avoid

Format this as a detailed exercise guide that would be suitable for a fitness app.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt,
          feature: 'workout_library'
        }
      });

      if (error) throw error;
      
      if (data?.response) {
        setAiDescription(data.response);
        toast.success('Exercise guide generated!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating exercise:', error);
      
      // Fallback response
      const fallbackResponse = `# ${newExerciseName}

## Description
${newExerciseName} is an effective exercise that targets multiple muscle groups and can be incorporated into various training programs. This movement helps build strength, stability, and muscle mass when performed with proper form.

## Primary Muscles Worked
- Determine based on the exercise movement pattern
- Focus on the main muscle groups recruited

## Equipment Needed
- List the equipment required for this exercise
- Include alternatives if applicable

## Instructions
1. Set up in the starting position with proper alignment
2. Engage your core and maintain good posture
3. Perform the concentric (lifting) phase with control
4. Hold briefly at the peak contraction
5. Lower with control during the eccentric phase
6. Maintain tension throughout the full range of motion
7. Breathe properly throughout the movement
8. Complete the desired number of repetitions

## Form Tips
- Focus on quality over quantity
- Start with lighter resistance to master the movement
- Maintain proper alignment throughout
- Use a full range of motion when possible

## Safety Considerations
- Warm up properly before performing this exercise
- Progress gradually in weight and intensity
- Stop if you experience pain (not to be confused with muscle fatigue)
- Consider working with a qualified trainer initially

## Common Mistakes
- Using too much weight too quickly
- Neglecting proper warm-up
- Rushing through the movement
- Ignoring proper breathing patterns

This exercise can be modified based on your fitness level and specific goals. Always prioritize proper form over heavy weight.`;
      
      setAiDescription(fallbackResponse);
      toast.success('Exercise guide generated with template!');
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/20 to-gray-700 text-white p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedExercise(null)} 
              className="text-gray-200 hover:text-white hover:bg-gray-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Library
            </Button>
          </div>

          <Card className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white mb-2">{selectedExercise.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {selectedExercise.difficulty}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {selectedExercise.category}
                    </Badge>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-700/40 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-gray-300">{selectedExercise.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">Primary Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.primaryMuscles.map((muscle, index) => (
                      <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.equipment.map((item, index) => (
                      <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Instructions</h3>
                <div className="space-y-2">
                  {selectedExercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-300 text-sm font-medium">{index + 1}</span>
                      </div>
                      <p className="text-gray-300">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedExercise.tips && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Pro Tips</h3>
                  <div className="space-y-2">
                    {selectedExercise.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/20 to-gray-700 text-white p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateForm(false)} 
              className="text-gray-200 hover:text-white hover:bg-gray-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Library
            </Button>
          </div>

          <Card className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Wand2 className="w-6 h-6 mr-3 text-purple-400" />
                Create New Exercise
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter an exercise name and our AI will generate a complete guide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium">Exercise Name</label>
                <Input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g., Bulgarian Split Squat, Turkish Get-Up, etc."
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500"
                />
              </div>

              <Button
                onClick={handleCreateExercise}
                disabled={!newExerciseName.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500/80 to-purple-700/80 hover:from-purple-600/80 hover:to-purple-800/80"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Exercise Guide...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Exercise Guide
                  </>
                )}
              </Button>

              {aiDescription && (
                <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <h3 className="text-white font-semibold mb-3">Generated Exercise Guide</h3>
                  <div className="text-gray-300 whitespace-pre-wrap text-sm">
                    {aiDescription}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/20 to-gray-700 text-white p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-gray-200 hover:text-white hover:bg-gray-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/20">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  Exercise Library
                </h1>
                <p className="text-gray-400 text-lg">Comprehensive exercise database with detailed instructions</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-500/80 to-purple-700/80 hover:from-purple-600/80 hover:to-purple-800/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exercise
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exercises or muscle groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/30 border-gray-700/50 text-white focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-blue-500/80 hover:bg-blue-600/80" 
                  : "border-gray-600/50 text-gray-300 hover:bg-gray-800/50"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2 group-hover:text-blue-200 transition-colors">
                      {exercise.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {exercise.difficulty}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-700/40 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {exercise.description}
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Primary Muscles</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.slice(0, 3).map((muscle, index) => (
                        <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                          {muscle}
                        </Badge>
                      ))}
                      {exercise.primaryMuscles.length > 3 && (
                        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                          +{exercise.primaryMuscles.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewExercise(exercise)}
                    className="w-full bg-gradient-to-r from-blue-500/80 to-blue-700/80 hover:from-blue-600/80 hover:to-blue-800/80 text-white"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Full Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-white font-medium mb-2">No exercises found</h3>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutLibrary;
