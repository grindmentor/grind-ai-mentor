
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Bell, Shield, Palette, Info } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("basic");

  const sections = [
    { id: "basic", label: "Basic Information", icon: User },
    { id: "fitness", label: "Fitness Profile", icon: Shield },
    { id: "units", label: "Units & Preferences", icon: Palette },
    { id: "app", label: "App Settings", icon: Bell },
    { id: "insights", label: "Data Insights", icon: Info },
    { id: "ai-memory", label: "AI Memory", icon: Shield }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "basic":
        return <div className="p-6"><p className="text-gray-400">Basic Information settings coming soon...</p></div>;
      case "fitness":
        return <div className="p-6"><p className="text-gray-400">Fitness Profile settings coming soon...</p></div>;
      case "units":
        return <div className="p-6"><p className="text-gray-400">Units & Preferences settings coming soon...</p></div>;
      case "app":
        return <div className="p-6"><p className="text-gray-400">App Settings coming soon...</p></div>;
      case "insights":
        return <div className="p-6"><p className="text-gray-400">Data Insights coming soon...</p></div>;
      case "ai-memory":
        return <div className="p-6"><p className="text-gray-400">AI Memory settings coming soon...</p></div>;
      default:
        return <div className="p-6"><p className="text-gray-400">Basic Information settings coming soon...</p></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 text-white animate-fade-in">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link to="/app">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Logo size="md" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm p-6">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                        activeSection === section.id
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              {renderContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
