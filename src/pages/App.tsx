
import Dashboard from "@/components/Dashboard";
import NotificationSystem from "@/components/NotificationSystem";
import CrashBoundary from "@/components/CrashBoundary";

export default function App() {
  console.log('App page rendering');
  
  return (
    <CrashBoundary>
      <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
        <CrashBoundary>
          <Dashboard />
        </CrashBoundary>
        <CrashBoundary>
          <NotificationSystem />
        </CrashBoundary>
      </div>
    </CrashBoundary>
  );
}
