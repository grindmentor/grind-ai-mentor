
import OptimizedDashboard from "@/components/OptimizedDashboard";
import { usePerformanceOptimizer } from "@/hooks/usePerformanceOptimizer";

export default function App() {
  const { metrics } = usePerformanceOptimizer();
  
  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 ${
      metrics.shouldReduceAnimations ? '' : 'transition-colors duration-300'
    }`}>
      <OptimizedDashboard />
      {/* Remove PerformanceMonitor in production to save resources */}
    </div>
  );
}
