import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Eye, 
  Zap, 
  Target, 
  Dumbbell, 
  Timer, 
  Star, 
  Flame, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { expandedWorkoutTemplates, WorkoutTemplate } from '@/data/expandedWorkoutTemplates';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BlueprintAIProps {
  onBack: () => void;
}

const BlueprintAI: React.FC<BlueprintAIProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('programs');

  useEffect(() => {
    loadUserProfile();
    setLoading(false);
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Group workouts by category
  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, WorkoutTemplate[]> = {
      'Split Programs': [],
      'Full Body': [],
      'Single Workouts': [],
      'Cardio': []
    };
    
    expandedWorkoutTemplates.forEach(workout => {
      if (groups[workout.category]) {
        groups[workout.category].push(workout);
      }
    });
    
    return groups;
  }, []);

  // Get personalized recommendations
  const personalizedWorkouts = useMemo(() => {
    if (!userProfile) return expandedWorkoutTemplates.slice(0, 3);

    const userGoal = userProfile.goal;
    const userExperience = userProfile.experience;

    return expandedWorkoutTemplates
      .filter(workout => {
        if (userExperience === 'beginner') return workout.difficulty === 'Beginner';
        if (userExperience === 'intermediate') return workout.difficulty !== 'Advanced';
        return true;
      })
      .filter(workout => {
        if (userGoal === 'lose_weight') return workout.category === 'Cardio' || workout.focus.includes('Fat Loss');
        if (userGoal === 'build_muscle') return workout.focus.some(f => f.includes('Hypertrophy'));
        if (userGoal === 'improve_strength') return workout.focus.includes('Strength');
        return true;
      })
      .slice(0, 3);
  }, [userProfile]);

  // Filter workouts based on search and filters
  const filteredWorkouts = useMemo(() => {
    return expandedWorkoutTemplates.filter(workout => {
      const matchesSearch = !searchQuery || 
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.focus.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || workout.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Intermediate': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Advanced': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Split Programs': return <Calendar className="w-4 h-4" />;
      case 'Full Body': return <Dumbbell className="w-4 h-4" />;
      case 'Single Workouts': return <Target className="w-4 h-4" />;
      case 'Cardio': return <Flame className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const WorkoutCard = ({ workout, index }: { workout: WorkoutTemplate; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br",
            workout.color
          )}>
            {getCategoryIcon(workout.category)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{workout.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Timer className="w-3 h-3" />
              <span>{workout.duration}</span>
              {workout.daysPerWeek && (
                <>
                  <span>•</span>
                  <span>{workout.daysPerWeek}x/week</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge className={cn("text-xs", getDifficultyColor(workout.difficulty))}>
          {workout.difficulty}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {workout.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {workout.focus.slice(0, 3).map((focus, i) => (
          <Badge key={i} variant="outline" className="text-xs border-border/50 bg-muted/30">
            {focus}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground">
          {workout.exercises.length} exercises
        </span>
        <Button
          size="sm"
          onClick={() => navigate('/workout-detail', { state: { workout } })}
          className="h-8 bg-primary/10 text-primary hover:bg-primary/20 border-0"
        >
          View Plan
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header 
          className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Blueprint AI</h1>
          </div>
        </header>
        <div className="pt-20 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Blueprint AI</h1>
            <p className="text-xs text-muted-foreground">Science-based training programs</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/exercise-database')}
            className="h-9 text-primary"
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Exercises
          </Button>
        </div>
      </header>

      <div 
        className="pb-24"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))' }}
      >
        {/* Hero Section */}
        <div className="px-4 pt-4 pb-6 text-center">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-3 border border-primary/20">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">AI Workout Programs</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Evidence-based programs designed for optimal results
          </p>
        </div>

        {/* Recommended Section */}
        {personalizedWorkouts.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <h3 className="text-sm font-semibold text-foreground">Recommended for You</h3>
            </div>
            <div className="space-y-3">
              {personalizedWorkouts.map((workout, index) => (
                <WorkoutCard key={workout.id} workout={workout} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-4">
              <TabsTrigger value="programs" className="flex-1 rounded-lg data-[state=active]:bg-background">
                Programs
              </TabsTrigger>
              <TabsTrigger value="workouts" className="flex-1 rounded-lg data-[state=active]:bg-background">
                Workouts
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1 rounded-lg data-[state=active]:bg-background">
                Search
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-6">
              {/* Split Programs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Split Programs</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {groupedWorkouts['Split Programs'].length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {groupedWorkouts['Split Programs'].map((workout, i) => (
                    <WorkoutCard key={workout.id} workout={workout} index={i} />
                  ))}
                </div>
              </div>

              {/* Full Body */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="w-4 h-4 text-green-500" />
                  <h3 className="font-semibold text-foreground">Full Body</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {groupedWorkouts['Full Body'].length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {groupedWorkouts['Full Body'].map((workout, i) => (
                    <WorkoutCard key={workout.id} workout={workout} index={i} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-6">
              {/* Single Workouts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-foreground">Single Workouts</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {groupedWorkouts['Single Workouts'].length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {groupedWorkouts['Single Workouts'].map((workout, i) => (
                    <WorkoutCard key={workout.id} workout={workout} index={i} />
                  ))}
                </div>
              </div>

              {/* Cardio */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-foreground">Cardio</h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {groupedWorkouts['Cardio'].length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {groupedWorkouts['Cardio'].map((workout, i) => (
                    <WorkoutCard key={workout.id} workout={workout} index={i} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border rounded-xl"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-xl">
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Split Programs">Split Programs</SelectItem>
                    <SelectItem value="Full Body">Full Body</SelectItem>
                    <SelectItem value="Single Workouts">Single Workouts</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="h-11 bg-card border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-xl">
                    <SelectItem value="All">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results */}
              {filteredWorkouts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No results found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWorkouts.map((workout, i) => (
                    <WorkoutCard key={workout.id} workout={workout} index={i} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BlueprintAI;
