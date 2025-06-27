import Dashboard from "@/components/Dashboard";
import NotificationSystem from "@/components/NotificationSystem";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import GoalsManager from "./pages/GoalsManager";

export default function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 overflow-hidden">
      <Routes>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/goals-manager" element={<ProtectedRoute><GoalsManager /></ProtectedRoute>} />
        {/* Add other routes here as needed */}
      </Routes>
      <NotificationSystem />
      <PerformanceMonitor />
    </div>
  );
}
