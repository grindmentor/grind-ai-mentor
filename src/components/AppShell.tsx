import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  showHeader = false,
  showFooter = false 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Swipe navigation refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Swipe back navigation
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      
      // Only trigger if horizontal swipe from left edge
      if (touchStartX.current < 30 && deltaX > 80 && Math.abs(deltaY) < 100) {
        if ('vibrate' in navigator) try { navigator.vibrate(10); } catch {}
        navigate(-1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Update scroll direction
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setScrollDirection('down');
          } else if (currentScrollY < lastScrollY.current) {
            setScrollDirection('up');
          }
          
          // Update scrolled state
          setIsScrolled(currentScrollY > 20);
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position on navigation
  useEffect(() => {
    const scrollPositions = new Map<string, number>();
    
    const saveScrollPosition = () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };

    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.get(location.pathname);
      if (savedPosition !== undefined) {
        window.scrollTo(0, savedPosition);
      } else {
        // Only scroll to top for new pages
        window.scrollTo(0, 0);
      }
    };

    // Save on route change
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Restore after a brief delay to allow content to render
    const timeoutId = setTimeout(restoreScrollPosition, 50);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-900/10 to-orange-800/20">
      {/* Persistent App Header */}
      {showHeader && (
        <header
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            "transform-gpu will-change-transform",
            isScrolled 
              ? "bg-background/80 backdrop-blur-lg shadow-lg border-b border-white/10" 
              : "bg-transparent",
            scrollDirection === 'down' && isScrolled ? "-translate-y-full" : "translate-y-0"
          )}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link 
              to="/"
              className="font-orbitron text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              MYOTOPIA
            </Link>
            
            <nav className="flex items-center gap-4">
              {/* Navigation items will be added by children components */}
            </nav>
          </div>
        </header>
      )}

      {/* Main Content Area - only this changes on navigation */}
      <main 
        className={cn(
          "min-h-screen",
          showHeader && "pt-14"
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </main>

      {/* Optional Footer */}
      {showFooter && (
        <footer className="bg-background/80 backdrop-blur-lg border-t border-white/10 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Myotopia. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};
