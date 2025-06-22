
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Trophy, Target, Zap, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'achievements' | 'reminders'>('recommendations');

  const recommendations = [
    {
      id: 1,
      title: "Increase Protein Intake",
      description: "Based on your recent workouts, consider adding 20g more protein daily",
      type: "nutrition",
      priority: "high"
    },
    {
      id: 2,
      title: "Rest Day Recommended",
      description: "You've trained 5 days straight. Consider taking a rest day tomorrow",
      type: "recovery",
      priority: "medium"
    },
    {
      id: 3,
      title: "Hydration Check",
      description: "Remember to drink at least 8 glasses of water today",
      type: "health",
      priority: "low"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "7-Day Streak",
      description: "Completed workouts for 7 consecutive days",
      icon: "🔥",
      unlockedAt: "2024-01-15",
      points: 100
    },
    {
      id: 2,
      title: "Protein Master",
      description: "Hit your protein target for 14 days straight",
      icon: "💪",
      unlockedAt: "2024-01-10",
      points: 150
    },
    {
      id: 3,
      title: "Early Bird",
      description: "Completed 10 morning workouts",
      icon: "🌅",
      unlockedAt: "2024-01-08",
      points: 75
    }
  ];

  const reminders = [
    {
      id: 1,
      title: "Workout Time",
      time: "07:00 AM",
      frequency: "Daily",
      active: true
    },
    {
      id: 2,
      title: "Meal Prep Sunday",
      time: "10:00 AM",
      frequency: "Weekly (Sunday)",
      active: true
    },
    {
      id: 3,
      title: "Progress Check",
      time: "08:00 PM",
      frequency: "Weekly (Friday)",
      active: false
    },
    {
      id: 4,
      title: "Supplement Reminder",
      time: "06:30 AM",
      frequency: "Daily",
      active: true
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
              <p className="text-gray-400">Stay motivated with personalized insights</p>
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
            <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
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
                  <p className="text-gray-300">{rec.description}</p>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Apply Now
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Unlocked: {achievement.unlockedAt}
                      </span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Workout & Health Reminders</h2>
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{reminder.title}</h3>
                      <p className="text-gray-400">{reminder.time} • {reminder.frequency}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={reminder.active ? "default" : "outline"}>
                        {reminder.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={reminder.active ? "outline" : "default"}
                      >
                        {reminder.active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Add New Reminder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
