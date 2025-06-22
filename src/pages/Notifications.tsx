
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Trophy, Target, Zap, Calendar, Plus, Clock, Utensils, Dumbbell, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'achievements' | 'reminders'>('recommendations');

  const recommendations = [
    {
      id: 1,
      title: "Increase Protein Intake",
      description: "Based on your recent workouts, consider adding 20g more protein daily for optimal muscle recovery",
      type: "nutrition",
      priority: "high",
      scientific_basis: "Research shows 1.6-2.2g protein per kg body weight optimizes muscle protein synthesis"
    },
    {
      id: 2,
      title: "Schedule Rest Day",
      description: "You've trained 5 consecutive days. Active recovery is crucial for adaptation and injury prevention",
      type: "recovery",
      priority: "medium",
      scientific_basis: "Studies indicate 48-72 hours recovery time needed for muscle protein synthesis"
    },
    {
      id: 3,
      title: "Hydration Optimization",
      description: "Increase water intake to 35ml per kg body weight for enhanced performance",
      type: "health",
      priority: "medium",
      scientific_basis: "2% dehydration can reduce performance by 10-15%"
    },
    {
      id: 4,
      title: "Sleep Quality Enhancement",
      description: "Aim for 7-9 hours sleep nightly. Poor sleep reduces muscle protein synthesis by 18%",
      type: "recovery",
      priority: "high",
      scientific_basis: "Sleep deprivation significantly impairs recovery and hormone production"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "Consistency Champion",
      description: "Completed workouts for 7 consecutive days",
      icon: "🔥",
      unlockedAt: "2024-01-15",
      points: 100,
      rarity: "Common"
    },
    {
      id: 2,
      title: "Protein Master",
      description: "Hit your protein target for 14 days straight",
      icon: "💪",
      unlockedAt: "2024-01-10",
      points: 150,
      rarity: "Uncommon"
    },
    {
      id: 3,
      title: "Early Bird Lifter",
      description: "Completed 10 morning workouts before 8 AM",
      icon: "🌅",
      unlockedAt: "2024-01-08",
      points: 75,
      rarity: "Common"
    },
    {
      id: 4,
      title: "Progressive Overload Pro",
      description: "Increased weight on all major lifts for 4 weeks",
      icon: "📈",
      unlockedAt: "2024-01-05",
      points: 200,
      rarity: "Rare"
    },
    {
      id: 5,
      title: "Hydration Hero",
      description: "Logged optimal water intake for 30 days",
      icon: "💧",
      unlockedAt: "2024-01-03",
      points: 125,
      rarity: "Uncommon"
    },
    {
      id: 6,
      title: "Macro Perfectionist",
      description: "Hit all macronutrient targets within 5% for 21 days",
      icon: "🎯",
      unlockedAt: "2024-01-01",
      points: 300,
      rarity: "Epic"
    }
  ];

  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Morning Workout",
      time: "07:00 AM",
      frequency: "Daily",
      active: true,
      icon: Dumbbell,
      type: "workout"
    },
    {
      id: 2,
      title: "Post-Workout Protein",
      time: "08:30 AM",
      frequency: "After Workouts",
      active: true,
      icon: Utensils,
      type: "nutrition"
    },
    {
      id: 3,
      title: "Meal Prep Sunday",
      time: "10:00 AM",
      frequency: "Weekly (Sunday)",
      active: true,
      icon: Utensils,
      type: "meal_prep"
    },
    {
      id: 4,
      title: "Hydration Check",
      time: "Every 2 hours",
      frequency: "Daily",
      active: true,
      icon: Droplets,
      type: "hydration"
    },
    {
      id: 5,
      title: "Evening Stretch",
      time: "09:00 PM",
      frequency: "Daily",
      active: false,
      icon: Target,
      type: "recovery"
    },
    {
      id: 6,
      title: "Weekly Progress Photos",
      time: "09:00 AM",
      frequency: "Weekly (Saturday)",
      active: true,
      icon: Trophy,
      type: "progress"
    },
    {
      id: 7,
      title: "Sleep Reminder",
      time: "10:30 PM",
      frequency: "Daily",
      active: false,
      icon: Clock,
      type: "sleep"
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500/20 text-gray-400';
      case 'Uncommon': return 'bg-green-500/20 text-green-400';
      case 'Rare': return 'bg-blue-500/20 text-blue-400';
      case 'Epic': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const toggleReminder = (id: number) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, active: !reminder.active } : reminder
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/app')} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Notifications & Achievements</h1>
              <p className="text-gray-400">Science-based recommendations and progress tracking</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-900 p-1 rounded-lg">
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('recommendations')}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            Recommendations
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          <Button
            variant={activeTab === 'reminders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('reminders')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Reminders
          </Button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Evidence-Based Recommendations</h2>
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{rec.title}</CardTitle>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-3">{rec.description}</p>
                  <div className="bg-gray-800 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-300">
                      <strong>Scientific Basis:</strong> {rec.scientific_basis}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Apply Recommendation
                    </Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Achievements</h2>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  {achievements.reduce((sum, a) => sum + a.points, 0)} Points
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <CardTitle className="text-white">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-400">
                      Unlocked: {achievement.unlockedAt}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Smart Reminders</h2>
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
            {reminders.map((reminder) => {
              const IconComponent = reminder.icon;
              return (
                <Card key={reminder.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reminder.active ? 'bg-blue-600' : 'bg-gray-700'}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{reminder.title}</h3>
                          <p className="text-gray-400">{reminder.time} • {reminder.frequency}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={reminder.active ? "default" : "outline"}>
                          {reminder.active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant={reminder.active ? "outline" : "default"}
                          onClick={() => toggleReminder(reminder.id)}
                        >
                          {reminder.active ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
