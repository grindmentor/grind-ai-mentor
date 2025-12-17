import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileHeader } from '@/components/MobileHeader';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { 
  Search, 
  Filter, 
  Target, 
  Dumbbell, 
  Timer, 
  Star, 
  Flame, 
  Calendar,
  ChevronRight,
  BookOpen,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { expandedWorkoutTemplates, WorkoutTemplate } from '@/data/expandedWorkoutTemplates';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BlueprintAIProps {
  /**
   * Optional back handler for inline component rendering.
   * When undefined, MobileHeader will use location.state.returnTo for navigation.
   * DO NOT pass onBack when rendering via route - let MobileHeader handle it.
   */
  onBack?: () => void;
}

const BlueprintAI: React.FC<BlueprintAIProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Note: MobileHeader handles back navigation automatically via location.state.returnTo
  // onBack is ONLY used when this component is rendered inline (e.g., from ModuleLibrary's selectedModule)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ goal?: string; experience?: string } | null>(null);
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

  const handleRefresh = async () => {
    await loadUserProfile();
  };

  // Group workouts by category with P/P/L emphasis
  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, WorkoutTemplate[]> = {
      'Push/Pull/Legs': [],
      'Upper/Lower': [],
      'Full Body': [],
      'Single Workouts': [],
      'Cardio': []
    };
    
    expandedWorkoutTemplates.forEach(workout => {
      // Categorize PPL programs
      if (workout.title.toLowerCase().includes('push pull legs') || 
          workout.title.toLowerCase().includes('ppl')) {
        groups['Push/Pull/Legs'].push(workout);
      } else if (workout.title.toLowerCase().includes('upper') && 
                 workout.title.toLowerCase().includes('lower')) {
        groups['Upper/Lower'].push(workout);
      } else if (workout.category === 'Full Body') {
        groups['Full Body'].push(workout);
      } else if (workout.category === 'Single Workouts') {
        groups['Single Workouts'].push(workout);
      } else if (workout.category === 'Cardio') {
        groups['Cardio'].push(workout);
      } else if (workout.category === 'Split Programs') {
        // Add remaining split programs to Upper/Lower or PPL based on content
        groups['Upper/Lower'].push(workout);
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
      case 'Push/Pull/Legs': return <Dumbbell className="w-4 h-4" aria-hidden="true" />;
      case 'Upper/Lower': 
      case 'Split Programs': return <Calendar className="w-4 h-4" aria-hidden="true" />;
      case 'Full Body': return <Target className="w-4 h-4" aria-hidden="true" />;
      case 'Single Workouts': return <Zap className="w-4 h-4" aria-hidden="true" />;
      case 'Cardio': return <Flame className="w-4 h-4" aria-hidden="true" />;
      default: return <Dumbbell className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const WorkoutCard = ({ workout, index }: { workout: WorkoutTemplate; index: number }) => (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "bg-card/50 border border-border/50 rounded-2xl p-4 transition-colors",
        "[@media(hover:hover)]:hover:bg-card [@media(hover:hover)]:hover:border-primary/30"
      )}
      aria-label={`${workout.title} - ${workout.difficulty} level workout`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br",
              workout.color
            )}
            aria-hidden="true"
          >
            {getCategoryIcon(workout.category)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{workout.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Timer className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              <span>{workout.duration}</span>
              {workout.daysPerWeek && (
                <>
                  <span className="text-border" aria-hidden="true">•</span>
                  <span>{workout.daysPerWeek}x/week</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge className={cn("text-[10px] px-2 py-0.5 flex-shrink-0", getDifficultyColor(workout.difficulty))}>
          {workout.difficulty}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
        {workout.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {workout.focus.slice(0, 3).map((focus, i) => (
          <Badge key={i} variant="outline" className="text-[10px] border-border/50 bg-muted/30 px-2 py-0.5">
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
          className={cn(
            "h-9 min-h-[44px] px-4 bg-primary/10 text-primary border-0 text-xs",
            "[@media(hover:hover)]:hover:bg-primary/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
          )}
          aria-label={`View ${workout.title} details`}
        >
          View Plan
          <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </motion.article>
  );

  const SectionHeader = ({ icon, title, count, color = 'text-primary' }: { icon: React.ReactNode; title: string; count: number; color?: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      <div className={cn("w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", color.replace('text-', 'text-'))} aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{count} programs available</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Blueprint AI" onBack={onBack} />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-card/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Blueprint AI" 
        onBack={onBack}
        rightElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/exercise-database')}
            className="h-11 w-11 min-h-[44px] min-w-[44px] p-0 text-primary rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Open Exercise Library"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </Button>
        }
      />
      
      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="card">
        <div className="px-4 pb-28">
          {/* Hero Section */}
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-3 border border-primary/20" aria-hidden="true">
              <Zap className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Science-Based Programs</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Evidence-based training programs optimized for results
            </p>
          </div>

          {/* Recommended Section */}
          {personalizedWorkouts.length > 0 && (
            <section className="mb-6" aria-labelledby="recommended-heading">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                <h3 id="recommended-heading" className="text-sm font-semibold text-foreground">Recommended for You</h3>
              </div>
              <div className="space-y-3">
                {personalizedWorkouts.map((workout, index) => (
                  <WorkoutCard key={workout.id} workout={workout} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50 p-1 rounded-xl mb-4 h-11">
              <TabsTrigger 
                value="programs" 
                className="flex-1 rounded-lg data-[state=active]:bg-background text-xs h-9 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Programs
              </TabsTrigger>
              <TabsTrigger 
                value="workouts" 
                className="flex-1 rounded-lg data-[state=active]:bg-background text-xs h-9 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Workouts
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="flex-1 rounded-lg data-[state=active]:bg-background text-xs h-9 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Search
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-2">
              {/* Push/Pull/Legs Section */}
              {groupedWorkouts['Push/Pull/Legs'].length > 0 && (
                <section aria-labelledby="ppl-heading">
                  <SectionHeader 
                    icon={<Dumbbell className="w-4 h-4 text-blue-400" aria-hidden="true" />} 
                    title="Push / Pull / Legs" 
                    count={groupedWorkouts['Push/Pull/Legs'].length}
                    color="text-blue-400"
                  />
                  <div className="space-y-3">
                    {groupedWorkouts['Push/Pull/Legs'].map((workout, i) => (
                      <WorkoutCard key={workout.id} workout={workout} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upper/Lower Section */}
              {groupedWorkouts['Upper/Lower'].length > 0 && (
                <section aria-labelledby="upperlower-heading">
                  <SectionHeader 
                    icon={<Calendar className="w-4 h-4 text-purple-400" aria-hidden="true" />} 
                    title="Upper / Lower Split" 
                    count={groupedWorkouts['Upper/Lower'].length}
                    color="text-purple-400"
                  />
                  <div className="space-y-3">
                    {groupedWorkouts['Upper/Lower'].map((workout, i) => (
                      <WorkoutCard key={workout.id} workout={workout} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* Full Body Section */}
              {groupedWorkouts['Full Body'].length > 0 && (
                <section aria-labelledby="fullbody-heading">
                  <SectionHeader 
                    icon={<Target className="w-4 h-4 text-green-400" aria-hidden="true" />} 
                    title="Full Body Programs" 
                    count={groupedWorkouts['Full Body'].length}
                    color="text-green-400"
                  />
                  <div className="space-y-3">
                    {groupedWorkouts['Full Body'].map((workout, i) => (
                      <WorkoutCard key={workout.id} workout={workout} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-2">
              {/* Single Workouts */}
              {groupedWorkouts['Single Workouts'].length > 0 && (
                <section aria-labelledby="single-heading">
                  <SectionHeader 
                    icon={<Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />} 
                    title="Single Workouts" 
                    count={groupedWorkouts['Single Workouts'].length}
                    color="text-amber-400"
                  />
                  <div className="space-y-3">
                    {groupedWorkouts['Single Workouts'].map((workout, i) => (
                      <WorkoutCard key={workout.id} workout={workout} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* Cardio */}
              {groupedWorkouts['Cardio'].length > 0 && (
                <section aria-labelledby="cardio-heading">
                  <SectionHeader 
                    icon={<Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />} 
                    title="Cardio" 
                    count={groupedWorkouts['Cardio'].length}
                    color="text-orange-400"
                  />
                  <div className="space-y-3">
                    {groupedWorkouts['Cardio'].map((workout, i) => (
                      <WorkoutCard key={workout.id} workout={workout} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" aria-hidden="true" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border rounded-xl"
                  aria-label="Search workout programs"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl" aria-label="Filter by category">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" aria-hidden="true" />
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
                  <SelectTrigger className="h-11 min-h-[44px] bg-card border-border rounded-xl" aria-label="Filter by difficulty">
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
                <div className="empty-state-premium py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                    <Search className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-foreground font-medium mb-1">No results found</h3>
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
      </PullToRefresh>
    </div>
  );
};

export default BlueprintAI;
