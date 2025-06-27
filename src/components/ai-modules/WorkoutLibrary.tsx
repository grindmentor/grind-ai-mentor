
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Dumbbell, Book, MessageSquare, Send, X, Filter, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutLibraryProps {
  onBack: () => void;
}

// Mock exercise data since useExerciseDatabase hook might not be available
const mockExercises = [
  {
    id: 1,
    name: 'Bench Press',
    primary_muscles: ['Chest', 'Triceps'],
    equipment: 'Barbell',
    instructions: 'Lie on bench, grip barbell with hands slightly wider than shoulder-width, lower to chest, press up.'
  },
  {
    id: 2,
    name: 'Squat',
    primary_muscles: ['Quadriceps', 'Glutes'],
    equipment: 'Barbell',
    instructions: 'Stand with feet shoulder-width apart, lower body by bending knees, return to starting position.'
  },
  {
    id: 3,
    name: 'Deadlift',
    primary_muscles: ['Back', 'Hamstrings'],
    equipment: 'Barbell',
    instructions: 'Stand with barbell over feet, bend at hips and knees, lift bar by extending hips and knees.'
  },
  {
    id: 4,
    name: 'Push-ups',
    primary_muscles: ['Chest', 'Triceps'],
    equipment: 'Bodyweight',
    instructions: 'Start in plank position, lower body to ground, push back up to starting position.'
  },
  {
    id: 5,
    name: 'Pull-ups',
    primary_muscles: ['Back', 'Biceps'],
    equipment: 'Bodyweight',
    instructions: 'Hang from bar with arms extended, pull body up until chin is over bar, lower back down.'
  }
];

const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'programs' | 'exercises'>('exercises');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [exercises] = useState(mockExercises);
  const [loading] = useState(false);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exercise.instructions && exercise.instructions.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMuscle = muscleFilter.length === 0 || muscleFilter.some(muscle => 
      exercise.primary_muscles?.some(m => m.toLowerCase().includes(muscle.toLowerCase()))
    );
    
    const matchesEquipment = !equipmentFilter || exercise.equipment === equipmentFilter;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const handleSendMessage = async () => {
    if (chatMessage.trim() !== '') {
      setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
      setIsAIThinking(true);
      
      // Simulate AI response with realistic delay
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: `Great question! Based on scientific research, I recommend focusing on compound movements for maximum efficiency. ${chatMessage.toLowerCase().includes('chest') ? 'For chest development, try incline dumbbell presses with a 30-45 degree angle for optimal upper chest activation.' : 'What specific muscle group or exercise are you interested in?'}` 
        }]);
        setIsAIThinking(false);
      }, 1500);
      
      setChatMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900/10 to-blue-800/20 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300">Loading exercise database...</p>
        </div>
      </div>
    );
  }

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
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2 sm:gap-0">
            <Button
              onClick={() => setActiveTab('programs')}
              variant={activeTab === 'programs' ? 'default' : 'outline'}
              className={`flex-1 sm:flex-none transition-all duration-200 text-sm sm:text-base px-3 py-3 sm:px-4 sm:py-2 rounded-xl font-medium ${
                activeTab === 'programs'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                  : 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Programs
            </Button>
            
            <Button
              onClick={() => setActiveTab('exercises')}
              variant={activeTab === 'exercises' ? 'default' : 'outline'}
              className={`flex-1 sm:flex-none transition-all duration-200 text-sm sm:text-base px-3 py-3 sm:px-4 sm:py-2 rounded-xl font-medium ${
                activeTab === 'exercises'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                  : 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <Book className="w-4 h-4 mr-2" />
              Exercises
            </Button>
          </div>

          <Button
            onClick={() => setShowAIChat(!showAIChat)}
            variant="outline"
            className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl font-medium transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Coach
          </Button>
        </div>

        {/* Search and Filters */}
        {activeTab === 'exercises' && (
          <div className="space-y-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-blue-800/30 border-blue-500/40 text-white placeholder:text-blue-300/70 h-14 text-lg focus:border-blue-400 rounded-2xl transition-all duration-200"
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
                  <SelectItem value="Barbell">Barbell</SelectItem>
                  <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="Cable">Cable</SelectItem>
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
        )}

        {/* Content Display */}
        {activeTab === 'programs' ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-blue-400/50" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Workout Programs Coming Soon</h3>
            <p className="text-blue-300/70 text-lg">Stay tuned for our curated workout programs</p>
          </div>
        ) : (
          <div>
            {filteredExercises.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-10 h-10 text-blue-400/50" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">No Exercises Found</h3>
                <p className="text-blue-300/70 text-lg">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((exercise) => (
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
                          : 'Exercise instructions coming soon'
                        }
                      </p>
                      {exercise.equipment && (
                        <Badge 
                          variant="secondary" 
                          className="mt-3 bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {exercise.equipment}
                        </Badge>
                      )}
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
        <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              AI Exercise Coach
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
                placeholder="Ask about exercises..."
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
