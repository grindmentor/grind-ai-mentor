import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - automatically scrolls to top on route change
 * This ensures users always start at the top of the page when navigating
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    // Also scroll the document element and body (for Safari compatibility)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also scroll any overflow containers
    const mainContent = document.querySelector('[data-main-content]');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};
