
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import PaymentSetup from "@/components/PaymentSetup";
import Dashboard from "@/components/Dashboard";
import WelcomeBack from "@/components/WelcomeBack";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Home, Settings, CreditCard, LogOut } from "lucide-react";

const App = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut, isNewUser } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    } else if (!loading && user && !isNewUser) {
      // Show welcome back for returning users
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeBack(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [user, loading, navigate, isNewUser]);

  const handleSignOut = async () => {
    sessionStorage.removeItem('hasSeenWelcome');
    await signOut();
    navigate('/');
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Welcome Back Modal */}
      {showWelcomeBack && (
        <WelcomeBack 
          userEmail={user.email || ''} 
          onContinue={handleWelcomeBackContinue}
        />
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur border-r border-gray-800 p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 transition-colors">
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 transition-colors"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800 hover:text-orange-400 transition-colors"
            onClick={() => window.open('/pricing', '_blank')}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Upgrade
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800 hover:text-red-400 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gray-800/80 p-4 rounded-xl mb-4 border border-gray-700">
            <div className="text-white text-sm font-medium mb-1">Signed in as:</div>
            <div className="text-gray-400 text-xs truncate">{user.email}</div>
          </div>
          <PaymentSetup onUpgrade={() => window.open('/pricing', '_blank')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <Dashboard />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Payment Successful!</h3>
            <p className="text-gray-400 mb-6">
              Welcome to Premium! You now have access to all features.
            </p>
            <Button
              onClick={() => setShowPaymentModal(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
