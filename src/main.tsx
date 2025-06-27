
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ModulesProvider } from './contexts/ModulesContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './pages/Index';
import ProtectedRoute from './components/ProtectedRoute';
import ModuleLibrary from './pages/ModuleLibrary';
import GoalsManager from './pages/GoalsManager';
import FoodPhotoLogger from './components/ai-modules/food-photo-logger';

// Lazy load the optimized module library
const OptimizedModuleLibrary = React.lazy(() => import("./pages/OptimizedModuleLibrary"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/modules",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-orange-900/5 to-orange-800/10 text-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div></div>}>
          <OptimizedModuleLibrary />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/goals-manager",
    element: (
      <ProtectedRoute>
        <GoalsManager />
      </ProtectedRoute>
    ),
  },
  {
    path: "/food-photo-logger",
    element: (
      <ProtectedRoute>
        <FoodPhotoLogger />
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ModulesProvider>
        <RouterProvider router={router} />
      </ModulesProvider>
    </AuthProvider>
  </React.StrictMode>,
)
