
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star, Grid, List, Filter, Dumbbell, Clock, Users, Target, Info, MessageCircle, Send, X } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExerciseDatabase, Exercise } from "@/hooks/useExerciseDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  difficulty_level: string;
  program_data: any;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { exercises, loading, suggestions, searchExercises, getExerciseSuggestions, getRandomExercises } = useExerciseDatabase();
  
  const [activeTab, setActiveTab] = useState('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load programs on mount
  useEffect(() => {
    if (activeTab === 'programs') {
      loadPrograms();
    }
  }, [activeTab]);

  // Load exercises on mount for exercises tab
  useEffect(() => {
    if (activeTab === 'exercises' && exercises.length === 0 && !searchQuery) {
      getRandomExercises(12);
    }
  }, [activeTab]);

  // Handle exercise search with debouncing
  useEffect(() => {
    if (activeTab === 'exercises') {
      const timeoutId = setTimeout(() => {
        if (searchQuery.trim()) {
          searchExercises(searchQuery);
          getExerciseSuggestions(searchQuery);
        } else {
          getRandomExercises(12);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

  const loadPrograms = async () => {
    setProgramsLoading(true);
    try {
      // For now, we'll create some sample programs since we don't have training_programs populated
      const samplePrograms: WorkoutProgram[] = [
        {
          id: '1',
          name: 'Push Pull Legs',
          description: 'Classic 3-day split focusing on push movements, pull movements, and legs',
          duration_weeks: 12,
          difficulty_level: 'Intermediate',
          program_data: {},
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Upper Lower Split',
          description: '4-day program alternating between upper body and lower body workouts',
          duration_weeks: 8,
          difficulty_level: 'Beginner',
          program_data: {},
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Full Body Strength',
          description: '3-day full body program for maximum strength gains',
          duration_weeks: 16,
          difficulty_level: 'Advanced',
          program_data: {},
          created_at: new Date().toISOString()
        }
      ];
      
      setPrograms(samplePrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setProgramsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          message: userMessage,
          context: 'workout_library_coach'
        }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || "I'm here to help with workout planning and exercise selection!"
      }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchExercises(suggestion);
  };

  const filteredExercises = exercises.filter(exercise => {
    if (filterDifficulty === 'all') return true;
    return exercise.difficulty_level === filterDifficulty;
  });

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || program.difficulty_level === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900/10 to-violet-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="text-white hover:bg-gray-800/50 backdrop-blur-sm"
                  size={isMobile ? "sm" : "default"}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isMobile ? "Back" : "Back to Dashboard"}
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500/20 to-violet-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-indigo-400/20">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                      Workout Library
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400">Discover workout programs and exercises</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowAIChat(!showAIChat)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Coach
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/30"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/30"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-indigo-900/30">
                    <TabsTrigger value="programs" className="data-[state=active]:bg-indigo-500/30">
                      <Target className="w-4 h-4 mr-2" />
                      Workout Programs
                    </TabsTrigger>
                    <TabsTrigger value="exercises" className="data-[state=active]:bg-indigo-500/30">
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Exercise Database
                    </TabsTrigger>
                  </TabsList>

                  {/* Search and Filters */}
                  <Card className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/30">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
                          <Input
                            placeholder={activeTab === 'programs' ? "Search programs..." : "Search exercises..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-indigo-800/30 border-indigo-500/40 text-white placeholder:text-indigo-300/70 focus:border-indigo-400"
                          />
                          {loading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                          <SelectTrigger className="w-full sm:w-40 bg-indigo-800/30 border-indigo-500/40 text-white">
                            <Filter className="w-4 h-4 mr-2 text-indigo-400" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-indigo-500/40">
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Exercise Search Suggestions */}
                      {activeTab === 'exercises' && suggestions.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3">Suggestions:</h3>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                              <Button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                variant="outline"
                                size="sm"
                                className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <TabsContent value="programs" className="space-y-6">
                    {programsLoading ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading programs...</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "space-y-4"
                      }>
                        {filteredPrograms.map((program) => (
                          <Card key={program.id} className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border-gray-600/50 hover:bg-gray-700/40 transition-all cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <Target className="w-6 h-6 text-indigo-400" />
                                  <div>
                                    <CardTitle className="text-white group-hover:text-indigo-300">{program.name}</CardTitle>
                                    <CardDescription className="text-gray-400">
                                      {program.duration_weeks} weeks • {program.difficulty_level}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge className={getDifficultyColor(program.difficulty_level)}>
                                  {program.difficulty_level}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-300 text-sm mb-4">{program.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {program.duration_weeks}w
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {program.difficulty_level}
                                  </span>
                                </div>
                                <Button variant="outline" size="sm" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20">
                                  View Program
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {!programsLoading && filteredPrograms.length === 0 && (
                      <div className="text-center py-12">
                        <Target className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No programs found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="exercises" className="space-y-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading exercises...</p>
                      </div>
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                        : "space-y-3"
                      }>
                        {filteredExercises.map((exercise) => (
                          <Card key={exercise.id} className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-sm border-gray-600/50 hover:bg-gray-700/40 transition-all cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 flex-1">
                                  <Dumbbell className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-white group-hover:text-indigo-300 truncate">
                                      {exercise.name}
                                    </h4>
                                    <p className="text-sm text-gray-400 truncate">
                                      🎯 {exercise.primary_muscles.join(', ')}
                                    </p>
                                    {exercise.secondary_muscles.length > 0 && (
                                      <p className="text-xs text-gray-500 truncate">
                                        Secondary: {exercise.secondary_muscles.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                  <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                                    {exercise.difficulty_level}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedExercise(exercise)}
                                    className="p-1 h-6 w-6"
                                  >
                                    <Info className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>🏋️ {exercise.equipment}</span>
                                <span>{exercise.mechanics} • {exercise.force_type}</span>
                              </div>
                              {exercise.description && (
                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                  {exercise.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {!loading && filteredExercises.length === 0 && (
                      <div className="text-center py-12">
                        <Dumbbell className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No exercises found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* AI Chat Sidebar */}
              {showAIChat && (
                <div className="lg:col-span-1">
                  <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-purple-500/30 sticky top-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
                          AI Workout Coach
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAIChat(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-purple-200/70">
                        Ask about workout programs, exercise selection, or training advice
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-64 overflow-y-auto space-y-3 bg-gray-800/30 rounded-lg p-3">
                        {chatMessages.length === 0 && (
                          <div className="text-center text-gray-400 text-sm">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            Ask me about workout programs, exercise selection, or training tips!
                          </div>
                        )}
                        {chatMessages.map((msg, index) => (
                          <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg text-sm max-w-[90%] ${
                              msg.role === 'user' 
                                ? 'bg-purple-500/20 text-purple-200' 
                                : 'bg-gray-700/50 text-gray-200'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="text-left">
                            <div className="inline-block p-2 rounded-lg text-sm bg-gray-700/50 text-gray-200">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask about workouts..."
                          className="bg-gray-800/50 border-purple-500/30 text-white focus:border-purple-400 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          disabled={chatLoading}
                        />
                        <Button
                          onClick={sendChatMessage}
                          disabled={chatLoading || !chatInput.trim()}
                          size="sm"
                          className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-gray-600/50 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">{selectedExercise.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExercise(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Primary Muscles:</span>
                    <p className="text-white">{selectedExercise.primary_muscles.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Equipment:</span>
                    <p className="text-white">{selectedExercise.equipment}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Difficulty:</span>
                    <Badge className={getDifficultyColor(selectedExercise.difficulty_level)}>
                      {selectedExercise.difficulty_level}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white">{selectedExercise.mechanics} • {selectedExercise.force_type}</p>
                  </div>
                </div>
                
                {selectedExercise.description && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-gray-300">{selectedExercise.description}</p>
                  </div>
                )}
                
                {selectedExercise.instructions && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Instructions</h4>
                    <p className="text-gray-300">{selectedExercise.instructions}</p>
                  </div>
                )}
                
                {selectedExercise.form_cues && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-blue-400 font-medium mb-2">Form Cues</h4>
                    <p className="text-blue-300 text-sm">{selectedExercise.form_cues}</p>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedExercise(null)}
                  className="w-full border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default WorkoutLibrary;
