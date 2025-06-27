
import Dashboard from "@/components/Dashboard";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

export default function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 overflow-hidden">
      <Dashboard />
      <PerformanceMonitor />
    </div>
  );
}
