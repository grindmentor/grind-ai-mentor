
import Dashboard from "@/components/Dashboard";
import NotificationSystem from "@/components/NotificationSystem";
import CrashBoundary from "@/components/CrashBoundary";

export default function App() {
  console.log('App page rendering');
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20">
      <CrashBoundary componentName="Dashboard">
        <Dashboard />
      </CrashBoundary>
      <CrashBoundary componentName="Notification System">
        <NotificationSystem />
      </CrashBoundary>
    </div>
  );
}
