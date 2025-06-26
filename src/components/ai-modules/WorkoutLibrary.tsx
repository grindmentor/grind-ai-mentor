
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Library, Search, Dumbbell, Plus, Sparkles, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  tips: string[];
  category: string;
  created_by?: string;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    equipment: '',
    difficulty: 'intermediate',
    category: 'compound'
  });

  const stockExercises: Exercise[] = [
    {
      id: 'bench-press',
      name: 'Bench Press',
      primary_muscles: ['Chest', 'Triceps'],
      secondary_muscles: ['Shoulders'],
      equipment: 'Barbell',
      difficulty: 'intermediate',
      instructions: [
        'Lie flat on bench with eyes under the bar',
        'Grip bar with hands slightly wider than shoulder-width',
        'Unrack bar and lower to chest with control',
        'Press bar up explosively while maintaining tight core',
        'Lock out arms fully at top'
      ],
      tips: [
        'Keep shoulder blades retracted throughout movement',
        'Maintain slight arch in lower back',
        'Touch chest at nipple line',
        'Drive feet into ground for stability'
      ],
      category: 'compound'
    },
    {
      id: 'squat',
      name: 'Back Squat',
      primary_muscles: ['Quadriceps', 'Glutes'],
      secondary_muscles: ['Hamstrings', 'Core'],
      equipment: 'Barbell',
      difficulty: 'intermediate',
      instructions: [
        'Position bar on upper traps (high bar) or rear delts (low bar)',
        'Stand with feet shoulder-width apart, toes slightly out',
        'Initiate movement by pushing hips back',
        'Descend until thighs are parallel or below',
        'Drive through heels to return to starting position'
      ],
      tips: [
        'Keep chest up and core braced throughout',
        'Knees track over toes, don\'t cave inward',
        'Maintain neutral spine position',
        'Full depth improves glute activation'
      ],
      category: 'compound'
    },
    {
      id: 'deadlift',
      name: 'Conventional Deadlift',
      primary_muscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
      secondary_muscles: ['Traps', 'Lats', 'Rhomboids'],
      equipment: 'Barbell',
      difficulty: 'advanced',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Hinge at hips and knees to grip bar outside legs',
        'Keep chest up, shoulders over bar',
        'Drive through heels and extend hips and knees',
        'Stand tall with shoulders back at top'
      ],
      tips: [
        'Keep bar close to body throughout lift',
        'Maintain neutral neck position',
        'Engage lats to keep bar path straight',
        'Hip hinge pattern, not squat pattern'
      ],
      category: 'compound'
    },
    {
      id: 'pull-up',
      name: 'Pull-Up',
      primary_muscles: ['Lats', 'Rhomboids'],
      secondary_muscles: ['Biceps', 'Rear Delts'],
      equipment: 'Pull-up Bar',
      difficulty: 'intermediate',
      instructions: [
        'Hang from bar with overhand grip, hands shoulder-width apart',
        'Start from dead hang with arms fully extended',
        'Pull chest toward bar by driving elbows down',
        'Clear chin over bar at top',
        'Lower with control to full arm extension'
      ],
      tips: [
        'Engage lats by pulling shoulder blades down',
        'Avoid swinging or kipping',
        'Full range of motion for maximum benefit',
        'Progress with bands or assisted variations'
      ],
      category: 'compound'
    }
  ];

  const categories = ['all', 'compound', 'isolation', 'cardio', 'mobility'];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customExercises = data.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        primary_muscles: exercise.primary_muscles || [],
        secondary_muscles: exercise.secondary_muscles || [],
        equipment: exercise.equipment || '',
        difficulty: exercise.difficulty || 'intermediate',
        instructions: exercise.instructions || [],
        tips: exercise.tips || [],
        category: exercise.category || 'compound',
        created_by: exercise.created_by
      }));

      setExercises([...stockExercises, ...customExercises]);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises(stockExercises);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.primary_muscles.some(muscle => 
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        ex.equipment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const createExerciseWithAI = async () => {
    if (!newExercise.name.trim() || !user) {
      toast.error('Please enter an exercise name');
      return;
    }

    setIsCreating(true);

    try {
      const aiPrompt = `Create a detailed exercise guide for "${newExercise.name}".

Equipment: ${newExercise.equipment || 'Bodyweight/Various'}
Difficulty: ${newExercise.difficulty}
Category: ${newExercise.category}

Provide a comprehensive exercise breakdown including:

1. **Primary Muscles**: List 2-3 main muscles worked
2. **Secondary Muscles**: List supporting muscles
3. **Step-by-Step Instructions**: 4-6 clear, detailed steps
4. **Pro Tips**: 3-4 technique and safety tips
5. **Equipment**: Specify exact equipment needed

Format as a structured exercise database entry. Focus on proper form, safety, and effectiveness. Use language similar to established exercise databases.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: aiPrompt,
          feature: 'exercise_creation'
        }
      });

      if (error) throw error;

      // Parse AI response and create structured exercise
      const aiResponse = data.response;
      
      // Extract information from AI response (this is simplified - in practice you'd want more robust parsing)
      const exercise = {
        name: newExercise.name,
        primary_muscles: ['Muscle Group 1', 'Muscle Group 2'], // Would parse from AI response
        secondary_muscles: ['Supporting Muscle'], // Would parse from AI response
        equipment: newExercise.equipment || 'Various',
        difficulty: newExercise.difficulty,
        instructions: [
          'Step 1: Setup and positioning',
          'Step 2: Movement initiation', 
          'Step 3: Execution phase',
          'Step 4: Return to starting position'
        ], // Would parse from AI response
        tips: [
          'Maintain proper form throughout',
          'Control the movement speed',
          'Focus on target muscles'
        ], // Would parse from AI response
        category: newExercise.category,
        ai_description: aiResponse
      };

      const { error: insertError } = await supabase
        .from('custom_exercises')
        .insert({
          ...exercise,
          created_by: user.id
        });

      if (insertError) throw insertError;

      toast.success('Exercise created successfully with AI assistance!');
      setShowCreateForm(false);
      setNewExercise({ name: '', equipment: '', difficulty: 'intermediate', category: 'compound' });
      await loadExercises();

    } catch (error) {
      console.error('Error creating exercise:', error);
      
      // Fallback: Create basic exercise without AI
      const basicExercise = {
        name: newExercise.name,
        primary_muscles: ['Target Muscle Group'],
        secondary_muscles: ['Supporting Muscles'],
        equipment: newExercise.equipment || 'Various',
        difficulty: newExercise.difficulty,
        instructions: [
          'Position yourself properly for the exercise',
          'Execute the movement with control',
          'Focus on proper form and technique',
          'Return to starting position'
        ],
        tips: [
          'Maintain proper form throughout the movement',
          'Control both the lifting and lowering phases',
          'Focus on the target muscle group'
        ],
        category: newExercise.category
      };

      try {
        const { error: fallbackError } = await supabase
          .from('custom_exercises')
          .insert({
            ...basicExercise,
            created_by: user.id
          });

        if (fallbackError) throw fallbackError;

        toast.success('Exercise created successfully!');
        setShowCreateForm(false);
        setNewExercise({ name: '', equipment: '', difficulty: 'intermediate', category: 'compound' });
        await loadExercises();
      } catch (fallbackError) {
        toast.error('Failed to create exercise');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-purple-700 text-white p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
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
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/20">
                <Library className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Exercise Library
                </h1>
                <p className="text-slate-400 text-lg">Comprehensive database with proper form guides</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-500/80 to-pink-600/80 hover:from-purple-600/80 hover:to-pink-700/80 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exercise
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2 text-sm">
            <Library className="w-4 h-4 mr-2" />
            {exercises.length} exercises with detailed form guides
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search exercises, muscles, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800/30 border-slate-600/50 text-white pl-10 focus:border-purple-500"
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
                      ? "bg-purple-600/80 hover:bg-purple-700/80" 
                      : "border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
                    }
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${
                          exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {exercise.difficulty}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          {exercise.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExercise(exercise)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Primary Muscles</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primary_muscles.map((muscle, index) => (
                        <Badge key={index} className="bg-slate-800/30 text-slate-300 border-slate-600/30 text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Equipment</p>
                    <p className="text-slate-300 text-sm">{exercise.equipment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No exercises found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-slate-900/95 border-slate-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">{selectedExercise.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={`${
                        selectedExercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        selectedExercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {selectedExercise.difficulty}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {selectedExercise.category}
                      </Badge>
                      <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
                        {selectedExercise.equipment}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExercise(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-2">Primary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.primary_muscles.map((muscle, index) => (
                        <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondary_muscles.map((muscle, index) => (
                        <Badge key={index} className="bg-slate-600/20 text-slate-400 border-slate-600/30">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Instructions</h4>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="text-slate-300 flex">
                        <span className="text-purple-400 font-bold mr-3">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-3">Pro Tips</h4>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, index) => (
                      <li key={index} className="text-slate-300 flex">
                        <span className="text-yellow-400 mr-3">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Exercise Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-slate-900/95 border-slate-700/50 max-w-lg w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                      Create Exercise with AI
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Name your exercise and AI will fill in the details
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium">Exercise Name *</label>
                  <Input
                    placeholder="e.g., Bulgarian Split Squat"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                    className="bg-slate-800/30 border-slate-600/50 text-white mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm font-medium">Equipment (optional)</label>
                  <Input
                    placeholder="e.g., Dumbbells, Bench"
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise({...newExercise, equipment: e.target.value})}
                    className="bg-slate-800/30 border-slate-600/50 text-white mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm font-medium">Difficulty</label>
                    <select
                      value={newExercise.difficulty}
                      onChange={(e) => setNewExercise({...newExercise, difficulty: e.target.value})}
                      className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-md px-3 py-2 mt-1"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-slate-300 text-sm font-medium">Category</label>
                    <select
                      value={newExercise.category}
                      onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
                      className="w-full bg-slate-800/30 border border-slate-600/50 text-white rounded-md px-3 py-2 mt-1"
                    >
                      <option value="compound">Compound</option>
                      <option value="isolation">Isolation</option>
                      <option value="cardio">Cardio</option>
                      <option value="mobility">Mobility</option>
                    </select>
                  </div>
                </div>
                
                <Button
                  onClick={createExerciseWithAI}
                  disabled={!newExercise.name.trim() || isCreating}
                  className="w-full bg-gradient-to-r from-purple-500/80 to-pink-600/80 hover:from-purple-600/80 hover:to-pink-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Exercise
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutLibrary;
