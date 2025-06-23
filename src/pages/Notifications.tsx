
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Trophy, Clock, Lightbulb, Star, Target, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Notifications = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("recommendations");

  const recommendations = [
    {
      id: 1,
      title: "Increase Protein Intake",
      description: "Based on your recent logs, consider adding 20g more protein daily",
      category: "Nutrition",
      priority: "high",
      time: "2 hours ago",
      icon: <Lightbulb className="w-5 h-5" />,
      action: "View meal suggestions"
    },
    {
      id: 2,
      title: "Progressive Overload Ready",
      description: "Your bench press has plateaued - time to increase weight by 2.5kg",
      category: "Training",
      priority: "medium",
      time: "1 day ago",
      icon: <Target className="w-5 h-5" />,
      action: "Update program"
    },
    {
      id: 3,
      title: "Recovery Day Needed",
      description: "Your recent workouts show fatigue signs - consider a rest day",
      category: "Recovery",
      priority: "medium",
      time: "3 hours ago",
      icon: <Clock className="w-5 h-5" />,
      action: "Plan recovery"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "7-Day Streak",
      description: "Completed workouts for 7 consecutive days",
      category: "Consistency",
      points: 100,
      time: "Today",
      icon: <Trophy className="w-5 h-5" />,
      color: "bg-yellow-500"
    },
    {
      id: 2,
      title: "Protein Goal Master",
      description: "Hit your protein target 5 days in a row",
      category: "Nutrition",
      points: 75,
      time: "Yesterday",
      icon: <Star className="w-5 h-5" />,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Strength Milestone",
      description: "Deadlifted 2x your bodyweight for the first time",
      category: "Strength",
      points: 200,
      time: "2 days ago",
      icon: <Target className="w-5 h-5" />,
      color: "bg-purple-500"
    }
  ];

  const reminders = [
    {
      id: 1,
      title: "Leg Day",
      description: "Your scheduled lower body workout",
      time: "Tomorrow 6:00 PM",
      category: "Workout",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 2,
      title: "Weekly Weigh-in",
      description: "Track your progress with this week's measurements",
      time: "Sunday 8:00 AM",
      category: "Progress",
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: 3,
      title: "Meal Prep",
      description: "Prepare your meals for the upcoming week",
      time: "Sunday 12:00 PM",
      category: "Nutrition",
      icon: <Lightbulb className="w-5 h-5" />
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-orange-500/50 bg-orange-500/10';
      case 'low': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nutrition': return 'bg-green-500/20 text-green-400';
      case 'Training': return 'bg-blue-500/20 text-blue-400';
      case 'Recovery': return 'bg-purple-500/20 text-purple-400';
      case 'Workout': return 'bg-orange-500/20 text-orange-400';
      case 'Progress': return 'bg-pink-500/20 text-pink-400';
      case 'Consistency': return 'bg-yellow-500/20 text-yellow-400';
      case 'Strength': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="text-white hover:bg-gray-800 hover:text-orange-400 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400">Stay updated with your fitness journey</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full grid-cols-3 bg-gray-900 ${isMobile ? 'text-sm' : ''}`}>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-orange-500">
                <Lightbulb className="w-4 h-4 mr-1" />
                {!isMobile && "Recommendations"}
                {isMobile && "Tips"}
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-orange-500">
                <Trophy className="w-4 h-4 mr-1" />
                {!isMobile && "Achievements"}
                {isMobile && "Awards"}
              </TabsTrigger>
              <TabsTrigger value="reminders" className="data-[state=active]:bg-orange-500">
                <Clock className="w-4 h-4 mr-1" />
                Reminders
              </TabsTrigger>
            </TabsList>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>
                <Badge className="bg-orange-500/20 text-orange-400">
                  {recommendations.length} Active
                </Badge>
              </div>
              
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className={`bg-gray-900 border-gray-800 ${getPriorityColor(rec.priority)}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            {rec.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                              <h3 className="text-white font-semibold">{rec.title}</h3>
                              <Badge className={getCategoryColor(rec.category)} size="sm">
                                {rec.category}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                            <p className="text-gray-500 text-xs mt-2">{rec.time}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
                        >
                          {rec.action}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent Achievements</h2>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  {achievements.reduce((sum, a) => sum + a.points, 0)} Points
                </Badge>
              </div>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${achievement.color} rounded-lg flex items-center justify-center`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <h3 className="text-white font-semibold">{achievement.title}</h3>
                            <Badge className={getCategoryColor(achievement.category)} size="sm">
                              {achievement.category}
                            </Badge>
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400" size="sm">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>
                          <p className="text-gray-500 text-xs mt-2">{achievement.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Upcoming Reminders</h2>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {reminders.length} Pending
                </Badge>
              </div>
              
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          {reminder.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <h3 className="text-white font-semibold">{reminder.title}</h3>
                            <Badge className={getCategoryColor(reminder.category)} size="sm">
                              {reminder.category}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{reminder.description}</p>
                          <p className="text-blue-400 text-sm font-medium mt-2">{reminder.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
