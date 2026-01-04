// Route preloader - preloads route components on hover/focus for instant navigation

type RouteLoader = () => Promise<{ default: React.ComponentType<any> }>;

interface RouteConfig {
  path: string;
  loader: RouteLoader;
}

// Map of routes to their dynamic imports
const routeLoaders: Record<string, RouteLoader> = {
  '/app': () => import('@/pages/App'),
  '/modules': () => import('@/pages/ModuleLibrary'),
  '/progress-hub-dashboard': () => import('@/pages/ProgressHubDashboard'),
  '/progress-hub': () => import('@/components/ai-modules/ProgressHub'),
  '/settings': () => import('@/pages/Settings'),
  '/profile': () => import('@/pages/Profile'),
  '/notifications': () => import('@/pages/Notifications'),
  '/usage': () => import('@/pages/Usage'),

  // Frequently used modules
  '/workout-logger': () => import('@/pages/WorkoutLogger'),
  '/smart-food-log': () => import('@/pages/SmartFoodLog'),
  '/physique-ai': () => import('@/pages/PhysiqueAI'),
  '/exercise-database': () => import('@/pages/ExerciseDatabase'),
  '/research': () => import('@/pages/Research'),

  // Secondary routes
  '/pricing': () => import('@/pages/Pricing'),
  '/support': () => import('@/pages/Support'),
  '/terms': () => import('@/pages/Terms'),
  '/privacy': () => import('@/pages/Privacy'),
  '/about': () => import('@/pages/About'),
  '/faq': () => import('@/pages/FAQ'),
  '/signin': () => import('@/pages/SignIn'),
  '/signup': () => import('@/pages/SignUp'),
};

// Cache for preloaded routes
const preloadedRoutes = new Set<string>();
const preloadingRoutes = new Set<string>();

// Preload a specific route
export const preloadRoute = async (path: string): Promise<void> => {
  // Normalize path
  const normalizedPath = path.split('?')[0].split('#')[0];
  
  if (preloadedRoutes.has(normalizedPath) || preloadingRoutes.has(normalizedPath)) {
    return;
  }

  const loader = routeLoaders[normalizedPath];
  if (!loader) return;

  preloadingRoutes.add(normalizedPath);
  
  try {
    await loader();
    preloadedRoutes.add(normalizedPath);
  } catch (error) {
    // Silent fail - route will load normally on navigation
  } finally {
    preloadingRoutes.delete(normalizedPath);
  }
};

// Preload multiple routes
export const preloadRoutes = (paths: string[]): void => {
  // Use requestIdleCallback for non-blocking preload
  const preload = () => {
    paths.forEach(path => preloadRoute(path));
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
};

// Preload critical routes on app start
export const preloadCriticalRoutes = (): void => {
  // Preload main tabs / most common destinations to avoid Suspense flashes
  preloadRoutes(['/app', '/modules', '/progress-hub-dashboard', '/profile', '/settings']);
};

// Setup hover/focus preloading for links
export const setupLinkPreloading = (): void => {
  const handleLinkHover = (event: Event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]');
    
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        preloadRoute(href);
      }
    }
  };

  // Preload on hover (desktop) and touchstart (mobile)
  document.addEventListener('mouseover', handleLinkHover, { passive: true, capture: true });
  document.addEventListener('touchstart', handleLinkHover, { passive: true, capture: true });
  document.addEventListener('focus', handleLinkHover, { passive: true, capture: true });
};

// Check if a route is preloaded
export const isRoutePreloaded = (path: string): boolean => {
  return preloadedRoutes.has(path.split('?')[0].split('#')[0]);
};
