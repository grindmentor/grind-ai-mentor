import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CreateExercise = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newMuscle, setNewMuscle] = useState('');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_muscles: [] as string[],
    secondary_muscles: [] as string[],
    equipment: '',
    difficulty: 'intermediate',
    category: '',
    technique_notes: ''
  });

  const muscleOptions = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Obliques'
  ];

  const equipmentOptions = [
    'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 
    'Kettlebell', 'Resistance Band', 'Other'
  ];

  const handleAddMuscle = (type: 'primary' | 'secondary') => {
    if (!newMuscle.trim()) return;
    
    const muscleList = type === 'primary' ? formData.primary_muscles : formData.secondary_muscles;
    if (!muscleList.includes(newMuscle)) {
      setFormData({
        ...formData,
        [type === 'primary' ? 'primary_muscles' : 'secondary_muscles']: [...muscleList, newMuscle]
      });
    }
    setNewMuscle('');
  };

  const handleRemoveMuscle = (type: 'primary' | 'secondary', muscle: string) => {
    const muscleList = type === 'primary' ? formData.primary_muscles : formData.secondary_muscles;
    setFormData({
      ...formData,
      [type === 'primary' ? 'primary_muscles' : 'secondary_muscles']: muscleList.filter(m => m !== muscle)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to create exercises');
      return;
    }

    if (formData.primary_muscles.length === 0) {
      toast.error('Please add at least one primary muscle group');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('custom_exercises')
        .insert([{
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          primary_muscles: formData.primary_muscles,
          secondary_muscles: formData.secondary_muscles,
          equipment: formData.equipment,
          difficulty_level: formData.difficulty,
          category: formData.category,
          technique_notes: formData.technique_notes
        }]);

      if (error) throw error;

      toast.success('Custom exercise created successfully! 💪');
      
      // Store success flag for the ExerciseSearch component
      sessionStorage.setItem('exerciseCreated', 'true');
      
      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error('Error creating exercise:', error);
      toast.error(error.message || 'Failed to create exercise');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-900/10 to-purple-900/20 pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-blue-400 mb-6">Create Custom Exercise</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-white">Exercise Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., Barbell Bench Press"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Brief description of the exercise..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label className="text-white">Primary Muscles *</Label>
              <div className="flex gap-2 mb-2">
                <Select value={newMuscle} onValueChange={setNewMuscle}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1">
                    <SelectValue placeholder="Select muscle" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {muscleOptions.map(muscle => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => handleAddMuscle('primary')}
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={!newMuscle}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.primary_muscles.map(muscle => (
                  <Badge
                    key={muscle}
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-pointer hover:bg-blue-500/30"
                    onClick={() => handleRemoveMuscle('primary', muscle)}
                  >
                    {muscle}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white">Secondary Muscles</Label>
              <div className="flex gap-2 mb-2">
                <Select value={newMuscle} onValueChange={setNewMuscle}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1">
                    <SelectValue placeholder="Select muscle" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {muscleOptions.map(muscle => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => handleAddMuscle('secondary')}
                  className="bg-purple-500 hover:bg-purple-600"
                  disabled={!newMuscle}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.secondary_muscles.map(muscle => (
                  <Badge
                    key={muscle}
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                    onClick={() => handleRemoveMuscle('secondary', muscle)}
                  >
                    {muscle}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment" className="text-white">Equipment *</Label>
                <Select
                  value={formData.equipment}
                  onValueChange={(value) => setFormData({ ...formData, equipment: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {equipmentOptions.map(equipment => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-white">Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-white">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., Push, Pull, Legs, Core"
              />
            </div>

            <div>
              <Label htmlFor="technique_notes" className="text-white">Technique Notes</Label>
              <Textarea
                id="technique_notes"
                value={formData.technique_notes}
                onChange={(e) => setFormData({ ...formData, technique_notes: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Tips for proper form and execution..."
                rows={4}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Exercise'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExercise;
