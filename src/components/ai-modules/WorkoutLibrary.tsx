
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Book, MessageSquare, Send, X, Filter, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface WorkoutLibraryProps {
  onBack: () => void;
}

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'programs' | 'exercises'>('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);

  const { exercises, loading, getRandomExercises } = useExerciseDatabase();

  useEffect(() => {
    if (activeTab === 'exercises') {
      getRandomExercises();
    }
  }, [activeTab]);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exercise.instructions && exercise.instructions.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMuscle = muscleFilter.length === 0 || muscleFilter.some(muscle => 
      exercise.primary_muscles?.some(m => m.toLowerCase().includes(muscle.toLowerCase()))
    );
    
    const matchesEquipment = !equipmentFilter || exercise.equipment === equipmentFilter;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const handleSendMessage = () => {
    if (chatMessage.trim() !== '') {
      setChatHistory([...chatHistory, { type: 'user', message: chatMessage }]);
      // Simulate AI response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { type: 'ai', message: `AI response to: ${chatMessage}` }]);
      }, 500);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white relative">
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-blue-500/20 backdrop-blur-sm hover:text-blue-400 transition-colors font-medium flex items-center space-x-2 absolute z-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Button>
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Workout Library
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Mobile-optimized Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 sm:gap-0">
            <Button
              variant={activeTab === 'programs' ? 'default' : 'outline'}
              onClick={() => setActiveTab('programs')}
              className={`flex-1 sm:flex-none transition-all duration-200 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 touch-manipulation ${
                activeTab === 'programs'
                  ? 'bg-blue-500/30 text-blue-300 border-blue-400/50'
                  : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Programs
            </Button>
            <Button
              variant={activeTab === 'exercises' ? 'default' : 'outline'}
              onClick={() => setActiveTab('exercises')}
              className={`flex-1 sm:flex-none transition-all duration-200 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 touch-manipulation ${
                activeTab === 'exercises'
                  ? 'bg-blue-500/30 text-blue-300 border-blue-400/50'
                  : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <Book className="w-4 h-4 mr-2" />
              Exercises
            </Button>
          </div>

          {/* AI Chat Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAIChat(!showAIChat)}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 w-full sm:w-auto touch-manipulation"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Chat
          </Button>
        </div>

        {/* Search and Filters */}
        {activeTab === 'exercises' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-blue-800/30 border-blue-500/40 text-white placeholder:text-blue-300/70 h-12 text-lg focus:border-blue-400 rounded-xl transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Select onValueChange={(value) => setMuscleFilter(value === '' ? [] : [value])}>
                <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl transition-all duration-200">
                  <Filter className="w-4 h-4 mr-2 text-blue-400" />
                  <SelectValue placeholder="Filter by muscle" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                  <SelectItem value="">All Muscles</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="shoulders">Shoulders</SelectItem>
                  <SelectItem value="biceps">Biceps</SelectItem>
                  <SelectItem value="triceps">Triceps</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="abs">Abs</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setEquipmentFilter}>
                <SelectTrigger className="bg-blue-800/30 border-blue-500/40 text-white h-12 rounded-xl transition-all duration-200">
                  <Filter className="w-4 h-4 mr-2 text-blue-400" />
                  <SelectValue placeholder="Filter by equipment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/40 rounded-xl">
                  <SelectItem value="">All Equipment</SelectItem>
                  <SelectItem value="barbell">Barbell</SelectItem>
                  <SelectItem value="dumbbell">Dumbbell</SelectItem>
                  <SelectItem value="machine">Machine</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="cable">Cable</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2 bg-blue-900/20 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-200 touch-manipulation ${
                    viewMode === 'grid'
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'hover:bg-blue-500/20 text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all duration-200 touch-manipulation ${
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
        )}

        {/* Content Display */}
        {activeTab === 'programs' ? (
          <div className="text-center py-16">
            <Dumbbell className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Workout Programs Coming Soon</h3>
            <p className="text-blue-300/70">Stay tuned for our curated workout programs</p>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} type="exercise" />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Exercises Found</h3>
                <p className="text-blue-300/70">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map(exercise => (
                  <Card key={exercise.id} className="bg-blue-900/40 border-blue-600/50 backdrop-blur-sm">
                    <CardHeader className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <Dumbbell className="w-4 h-4 text-blue-300" />
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-white text-sm font-semibold">{exercise.name}</CardTitle>
                          <CardDescription className="text-blue-200/70 text-xs">
                            {exercise.primary_muscles?.join(', ') || 'Various muscles'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-200/80 text-xs">
                        {exercise.instructions ? exercise.instructions.substring(0, 100) + '...' : 'Exercise instructions coming soon'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Sidebar */}
      {showAIChat && (
        <div className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">AI Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAIChat(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-800/30 text-white' : 'bg-gray-800/30 text-gray-300'}`}>
                {message.message}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="bg-gray-800/50 border-gray-700/50 text-white"
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;
