import React, { memo, useCallback, useMemo } from 'react';
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
  { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress-hub-dashboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

// Memoized tab button to prevent re-renders
const TabButton = memo<{
  tab: TabItem;
  isActive: boolean;
  onPress: (tab: TabItem) => void;
}>(({ tab, isActive, onPress }) => {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={() => onPress(tab)}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
        "active:scale-90",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
          isActive && "bg-primary/10"
        )}>
          <Icon className={cn(
            "w-5 h-5 transition-all duration-200",
            isActive && "text-primary"
          )} />
        </div>
        <span className={cn(
          "text-[10px] mt-0.5 transition-all duration-200",
          isActive ? "font-semibold text-primary" : "font-medium"
        )}>
          {tab.label}
        </span>
      </div>
    </button>
  );
});

TabButton.displayName = 'TabButton';

const BottomTabBarComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useNativeHaptics();

  const handleTabPress = useCallback((tab: TabItem) => {
    trigger('selection');
    navigate(tab.path);
  }, [trigger, navigate]);

  const activeStates = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      if (tab.path === '/app') {
        acc[tab.id] = location.pathname === '/app' || location.pathname === '/';
      } else {
        acc[tab.id] = location.pathname.startsWith(tab.path);
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [location.pathname]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-2xl border-t border-border/30"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}
    >
      <div className="flex items-center justify-around px-4 h-16">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeStates[tab.id]}
            onPress={handleTabPress}
          />
        ))}
      </div>
    </nav>
  );
};

export const BottomTabBar = memo(BottomTabBarComponent);
export default BottomTabBar;
