
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Plus, Flame, Target, Calendar } from "lucide-react";
import { useState } from "react";

interface HabitTrackerProps {
  onBack: () => void;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  category: 'fitness' | 'nutrition' | 'recovery' | 'mindset';
  color: string;
}

const HabitTracker = ({ onBack }: HabitTrackerProps) => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Drink 3L Water',
      streak: 12,
      completedToday: true,
      category: 'nutrition',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: '10k Steps Daily',
      streak: 8,
      completedToday: false,
      category: 'fitness',
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Sleep 8 Hours',
      streak: 5,
      completedToday: true,
      category: 'recovery',
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Protein with Every Meal',
      streak: 15,
      completedToday: false,
      category: 'nutrition',
      color: 'bg-orange-500'
    }
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completedToday;
        return {
          ...habit,
          completedToday: newCompleted,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const categories: ('fitness' | 'nutrition' | 'recovery' | 'mindset')[] = ['fitness', 'nutrition', 'recovery', 'mindset'];
    
    const newHabitObj: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      streak: 0,
      completedToday: false,
      category: categories[Math.floor(Math.random() * categories.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    setHabits([...habits, newHabitObj]);
    setNewHabit('');
    setShowAddForm(false);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 21) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '💪';
    return '🌱';
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = Math.round((completedToday / totalHabits) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>
            <p className="text-gray-400">Build consistent fitness and wellness habits</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Flame className="w-3 h-3 mr-1" />
          Trending on Social Media
        </Badge>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          {completedToday}/{totalHabits} completed today ({completionRate}%)
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Today's Habits</CardTitle>
                  <CardDescription className="text-gray-400">
                    Check off your daily habits to build streaks
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddForm && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter new habit (e.g., 'Read 20 minutes')"
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                    />
                    <Button onClick={addHabit} className="bg-green-500 hover:bg-green-600">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      habit.completedToday 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full ${habit.color} flex items-center justify-center`}>
                        {habit.completedToday && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${habit.completedToday ? 'text-green-400' : 'text-white'}`}>
                            {habit.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getStreakEmoji(habit.streak)}</span>
                            <Badge className={`${
                              habit.streak >= 7 
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {habit.streak} day streak
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm capitalize">{habit.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      className="text-gray-700"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="36"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-green-500"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - completedToday / totalHabits)}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="36"
                      cx="48"
                      cy="48"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  </div>
                </div>
                <p className="text-gray-400">{completedToday} of {totalHabits} habits completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Streak Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((habit, index) => (
                    <div key={habit.id} className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{habit.name}</p>
                        <p className="text-gray-400 text-xs">{habit.streak} days</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">💡 Habit Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Start with 2-3 habits max</p>
                <p>• Stack habits with existing routines</p>
                <p>• Track your streaks for motivation</p>
                <p>• Focus on consistency over perfection</p>
                <p>• Celebrate small wins daily</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
