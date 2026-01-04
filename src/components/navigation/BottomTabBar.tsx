import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { preloadRoute } from '@/utils/routePreloader';

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

// Memoized tab button
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
        "flex flex-col items-center justify-center flex-1 h-full transition-all duration-150",
        "active:scale-90 touch-manipulation min-h-[44px]",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={tab.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-150",
          isActive && "bg-primary/15"
        )}>
          <Icon className={cn(
            "w-[22px] h-[22px] transition-all duration-150",
            isActive ? "text-primary" : "text-muted-foreground"
          )} strokeWidth={isActive ? 2.2 : 1.8} />
        </div>
        <span className={cn(
          "text-[10px] mt-0.5 transition-all duration-150",
          isActive ? "font-semibold text-primary" : "font-medium text-muted-foreground"
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
    void preloadRoute(tab.path);
    navigate(tab.path);
  }, [trigger, navigate]);

  const activeStates = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      if (tab.path === '/app') {
        acc[tab.id] = location.pathname === '/app';
      } else if (tab.path === '/progress-hub-dashboard') {
        acc[tab.id] = location.pathname.startsWith('/progress');
      } else {
        acc[tab.id] = location.pathname.startsWith(tab.path);
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [location.pathname]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 h-[60px]">
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