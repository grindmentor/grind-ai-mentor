
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import PaymentSetup from "@/components/PaymentSetup";
import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const App = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => window.open('/pricing', '_blank')}
          >
            Upgrade
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </nav>

        {/* User Info */}
        <div className="mt-auto">
          <div className="bg-gray-800 p-3 rounded-lg mb-4">
            <div className="text-white text-sm font-medium">Signed in as:</div>
            <div className="text-gray-400 text-xs truncate">{user.email}</div>
          </div>
          <PaymentSetup onUpgrade={() => window.open('/pricing', '_blank')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        <Dashboard />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
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
