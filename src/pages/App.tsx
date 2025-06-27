
import Dashboard from "@/components/Dashboard";
import NotificationSystem from "@/components/NotificationSystem";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

export default function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 overflow-hidden">
      <Dashboard />
      <NotificationSystem />
      <PerformanceMonitor />
    </div>
  );
}
