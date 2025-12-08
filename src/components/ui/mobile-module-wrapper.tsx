import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MobileModuleWrapperProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  className?: string;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

export const MobileModuleWrapper: React.FC<MobileModuleWrapperProps> = ({
  title,
  onBack,
  children,
  className = "",
  rightElement,
  subtitle
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      className
    )}>
      {/* Premium native header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {rightElement && (
            <div className="shrink-0 ml-2">
              {rightElement}
            </div>
          )}
        </div>
      </header>

      {/* Content with proper spacing for fixed header */}
      <motion.main 
        className="flex-1 pb-safe-bottom"
        style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default MobileModuleWrapper;
