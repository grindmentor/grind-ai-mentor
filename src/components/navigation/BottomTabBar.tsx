import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';
import { motion } from 'framer-motion';

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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all duration-200",
                "active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-6 h-6 transition-all duration-200",
                  active && "scale-110"
                )} />
                {active && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-all duration-200",
                active && "font-semibold"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
