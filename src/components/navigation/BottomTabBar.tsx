import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/app' },
  { id: 'modules', label: 'Modules', icon: Grid3X3, path: '/modules' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/physique-ai-dashboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useNativeHaptics();

  const handleTabPress = (tab: TabItem) => {
    trigger('selection');
    navigate(tab.path);
  };

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-2xl border-t border-border/30"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}
    >
      <div className="flex items-center justify-around px-4 h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
                "active:scale-90",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                  active && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active && "text-primary"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 transition-all duration-200",
                  active ? "font-semibold text-primary" : "font-medium"
                )}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
