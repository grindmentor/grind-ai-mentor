
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, User, Activity, Target, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/app">
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Progress Hub
                </h1>
                <p className="text-slate-400 text-lg">Track your fitness journey and achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Activity, title: "Workouts", value: "0", subtitle: "This Week" },
            { icon: Target, title: "Goals", value: "0", subtitle: "Active" },
            { icon: Calendar, title: "Streak", value: "0", subtitle: "Days" },
            { icon: TrendingUp, title: "Progress", value: "0%", subtitle: "This Month" }
          ].map((stat, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <p className="text-slate-400 text-sm">{stat.subtitle}</p>
                <h3 className="text-white font-medium">{stat.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center">
              <User className="w-5 h-5 mr-3 text-purple-400" />
              Your Progress Journey
            </CardTitle>
            <CardDescription className="text-slate-400">
              Track your fitness achievements and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Start Your Journey</h3>
            <p className="text-slate-400 mb-6">Begin tracking your workouts to see your progress here</p>
            <Link to="/app">
              <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
