
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Book, MessageSquare, Send, X, Filter, Grid, List, Plus, Calendar, Heart, Timer, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useExerciseDatabase, Exercise } from '@/hooks/useExerciseDatabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface WorkoutSplit {
  id: string;
  name: string;
  description: string;
  days: WorkoutDay[];
  createdAt: Date;
}

interface WorkoutDay {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  restDay: boolean;
}

interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: number;
  notes?: string;
}

interface CardioSession {
  id: string;
  name: string;
  type: 'steady_state' | 'hiit' | 'liss';
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  createdAt: Date;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const { exercises, loading, searchExercises, getRandomExercises } = useExerciseDatabase();
  
  // State management
  const [activeTab, setActiveTab] = useState<'exercises' | 'splits' | 'cardio'>('exercises');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // Workout management state
  const [workoutSplits, setWorkoutSplits] = useState<WorkoutSplit[]>([]);
  const [cardioSessions, setCardioSessions] = useState<CardioSession[]>([]);
  const [showNewSplitDialog, setShowNewSplitDialog] = useState(false);
  const [showNewCardioDialog, setShowNewCardioDialog] = useState(false);
  const [newSplitName, setNewSplitName] = useState('');
  const [newSplitDescription, setNewSplitDescription] = useState('');

  // Load initial data
  useEffect(() => {
    if (activeTab === 'exercises') {
      if (searchQuery.trim()) {
        searchExercises(searchQuery, muscleFilter.length > 0 ? muscleFilter : undefined, equipmentFilter || undefined);
      } else {
        getRandomExercises(12);
      }
    }
  }, [activeTab, searchQuery, muscleFilter, equipmentFilter]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle muscle filter
  const handleMuscleFilter = (muscle: string) => {
    if (muscle === '') {
      setMuscleFilter([]);
    } else {
      setMuscleFilter([muscle]);
    }
  };

  // AI Chat functionality
  const handleSendMessage = async () => {
    if (chatMessage.trim() !== '') {
      setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
      setIsAIThinking(true);
      
      // Simulate AI response with workout-specific content
      setTimeout(() => {
        let response = '';
        if (chatMessage.toLowerCase().includes('split')) {
          response = 'For building muscle, I recommend a push/pull/legs split performed twice per week. This allows optimal recovery while maintaining high training frequency for each muscle group.';
        } else if (chatMessage.toLowerCase().includes('cardio')) {
          response = 'For fat loss, combine HIIT cardio 2-3x per week with steady-state cardio 1-2x per week. Keep HIIT sessions to 15-20 minutes and steady-state to 30-45 minutes.';
        } else if (chatMessage.toLowerCase().includes('exercise')) {
          response = 'Focus on compound movements like squats, deadlifts, bench press, and rows. These exercises work multiple muscle groups and provide the best bang for your buck in terms of muscle building and strength gains.';
        } else {
          response = `Great question! Based on scientific research and your training goals, I recommend focusing on progressive overload and consistency. ${chatMessage.toLowerCase().includes('beginner') ? 'Start with basic compound movements and master the form before adding weight.' : 'What specific aspect of your training would you like to optimize?'}`;
        }
        
        setChatHistory(prev => [...prev, { type: 'ai', message: response }]);
        setIsAIThinking(false);
      }, 1500);
      
      setChatMessage('');
    }
  };

  // Create new workout split
  const handleCreateSplit = () => {
    if (newSplitName.trim()) {
      const newSplit: WorkoutSplit = {
        id: Date.now().toString(),
        name: newSplitName,
        description: newSplitDescription,
        days: [
          { id: '1', name: 'Push (Chest, Shoulders, Triceps)', exercises: [], restDay: false },
          { id: '2', name: 'Pull (Back, Biceps)', exercises: [], restDay: false },
          { id: '3', name: 'Legs (Quads, Hamstrings, Glutes)', exercises: [], restDay: false },
          { id: '4', name: 'Rest Day', exercises: [], restDay: true },
        ],
        createdAt: new Date()
      };
      
      setWorkoutSplits(prev => [...prev, newSplit]);
      setNewSplitName('');
      setNewSplitDescription('');
      setShowNewSplitDialog(false);
    }
  };

  // Create new cardio session
  const handleCreateCardio = (sessionData: Partial<CardioSession>) => {
    const newSession: CardioSession = {
      id: Date.now().toString(),
      name: sessionData.name || 'New Cardio Session',
      type: sessionData.type || 'steady_state',
      duration: sessionData.duration || 30,
      intensity: sessionData.intensity || 'moderate',
      notes: sessionData.notes,
      createdAt: new Date()
    };
    
    setCardioSessions(prev => [...prev, newSession]);
    setShowNewCardioDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-blue-500/20 backdrop-blur-sm hover:text-blue-400 transition-all duration-200 font-medium flex items-center space-x-2 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Workout Library
            </h1>
            
            <Button
              onClick={() => setShowAIChat(!showAIChat)}
              variant="outline"
              className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-3 py-2 rounded-lg font-medium transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Coach
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-900/20 rounded-xl p-1">
            <TabsTrigger 
              value="exercises" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Exercises</span>
            </TabsTrigger>
            <TabsTrigger 
              value="splits"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300"
            >
              <Calendar className="w-4 h-4" />
              <span>Workout Splits</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cardio"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300"
            >
              <Heart className="w-4 h-4" />
              <span>Cardio Sessions</span>
            </TabsTrigger>
          </TabsList>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 bg-blue-800/30 border-blue-500/40 text-white placeholder:text-blue-300/70 h-14 text-lg focus:border-blue-400 rounded-2xl transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Select onValueChange={handleMuscleFilter}>
                  <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl transition-all duration-200">
                    <Filter className="w-4 h-4 mr-2 text-blue-400" />
                    <SelectValue placeholder="Filter by muscle" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                    <SelectItem value="">All Muscles</SelectItem>
                    <SelectItem value="Chest">Chest</SelectItem>
                    <SelectItem value="Back">Back</SelectItem>
                    <SelectItem value="Shoulders">Shoulders</SelectItem>
                    <SelectItem value="Biceps">Biceps</SelectItem>
                    <SelectItem value="Triceps">Triceps</SelectItem>
                    <SelectItem value="Quadriceps">Legs</SelectItem>
                    <SelectItem value="Core">Abs</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl transition-all duration-200">
                    <Filter className="w-4 h-4 mr-2 text-blue-400" />
                    <SelectValue placeholder="Filter by equipment" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                    <SelectItem value="">All Equipment</SelectItem>
                    <SelectItem value="Barbell">Barbell</SelectItem>
                    <SelectItem value="Dumbbells">Dumbbell</SelectItem>
                    <SelectItem value="Machine">Machine</SelectItem>
                    <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                    <SelectItem value="Cable Machine">Cable</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 bg-blue-900/20 rounded-xl p-1">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant="ghost"
                    size="sm"
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500/30 text-blue-300'
                        : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant="ghost"
                    size="sm"
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-500/30 text-blue-300'
                        : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Exercise Results */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading exercises..." />
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-10 h-10 text-blue-400/50" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">No Exercises Found</h3>
                <p className="text-blue-300/70 text-lg">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {exercises.map((exercise) => (
                  <Card key={exercise.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-200 transform hover:scale-[1.02]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="w-5 h-5 text-blue-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-white text-base font-semibold leading-tight">
                            {exercise.name}
                          </CardTitle>
                          <CardDescription className="text-blue-200/70 text-sm mt-1">
                            {exercise.primary_muscles?.join(', ') || 'Various muscles'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-blue-200/80 text-sm leading-relaxed">
                        {exercise.instructions 
                          ? exercise.instructions.substring(0, 120) + '...' 
                          : exercise.description?.substring(0, 120) + '...' || 'Exercise instructions coming soon'
                        }
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exercise.equipment && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {exercise.equipment}
                          </Badge>
                        )}
                        {exercise.difficulty_level && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                            {exercise.difficulty_level}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Workout Splits Tab */}
          <TabsContent value="splits" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">Workout Splits</h2>
                <p className="text-blue-300/70">Create and manage your training programs</p>
              </div>
              <Dialog open={showNewSplitDialog} onOpenChange={setShowNewSplitDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Split
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900/95 border-blue-500/40 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Workout Split</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Design your training program with multiple workout days
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="split-name">Split Name</Label>
                      <Input
                        id="split-name"
                        value={newSplitName}
                        onChange={(e) => setNewSplitName(e.target.value)}
                        placeholder="e.g., Push/Pull/Legs"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="split-description">Description</Label>
                      <Textarea
                        id="split-description"
                        value={newSplitDescription}
                        onChange={(e) => setNewSplitDescription(e.target.value)}
                        placeholder="Describe your workout split..."
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleCreateSplit} className="w-full bg-blue-600 hover:bg-blue-700">
                      Create Split
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {workoutSplits.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-blue-400/50" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">No Workout Splits Yet</h3>
                <p className="text-blue-300/70 text-lg">Create your first training program to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workoutSplits.map((split) => (
                  <Card key={split.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">{split.name}</CardTitle>
                      <CardDescription className="text-blue-200/70">
                        {split.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {split.days.map((day) => (
                          <div key={day.id} className="flex items-center justify-between p-3 bg-blue-800/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {day.restDay ? (
                                <Timer className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Dumbbell className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="text-white font-medium">{day.name}</span>
                            </div>
                            <Badge variant="outline" className="border-blue-500/40 text-blue-300">
                              {day.exercises.length} exercises
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cardio Sessions Tab */}
          <TabsContent value="cardio" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">Cardio Sessions</h2>
                <p className="text-blue-300/70">Plan your cardiovascular training</p>
              </div>
              <Dialog open={showNewCardioDialog} onOpenChange={setShowNewCardioDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900/95 border-red-500/40 text-white">
                  <DialogHeader>
                    <DialogTitle>Create Cardio Session</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Design your cardiovascular training session
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Session Name</Label>
                      <Input
                        placeholder="e.g., Morning HIIT"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select cardio type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="hiit">HIIT</SelectItem>
                          <SelectItem value="steady_state">Steady State</SelectItem>
                          <SelectItem value="liss">LISS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => handleCreateCardio({ name: 'New Cardio Session', type: 'steady_state', duration: 30, intensity: 'moderate' })} 
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Create Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {cardioSessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-red-400/50" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">No Cardio Sessions Yet</h3>
                <p className="text-blue-300/70 text-lg">Create your first cardio session to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardioSessions.map((session) => (
                  <Card key={session.id} className="bg-red-900/40 border-red-600/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-300" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{session.name}</CardTitle>
                          <CardDescription className="text-red-200/70 capitalize">
                            {session.type.replace('_', ' ')} • {session.duration} min
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Intensity:</span>
                          <Badge variant="outline" className="border-red-500/40 text-red-300 capitalize">
                            {session.intensity}
                          </Badge>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-gray-300">{session.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Sidebar */}
      {showAIChat && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              AI Workout Coach
            </h2>
            <Button 
              onClick={() => setShowAIChat(false)}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-400 text-sm">Ask me about exercises, workout splits, or training advice!</p>
              </div>
            )}
            
            {chatHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-xl max-w-[85%] ${
                message.type === 'user' 
                  ? 'bg-blue-600/30 text-white ml-auto' 
                  : 'bg-gray-800/50 text-gray-100'
              }`}>
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>
            ))}
            
            {isAIThinking && (
              <div className="bg-gray-800/50 text-gray-100 p-3 rounded-xl max-w-[85%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-400">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Ask about workouts..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-12 rounded-xl"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;
