import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { appSync } from '@/utils/appSynchronization';

/**
 * Global State Management Context
 * 
 * Coordinates state between all components to ensure synchronization
 * and prevent stale data across the application.
 */

interface GlobalState {
  // Data freshness tracking
  lastDataRefresh: number;
  dataStale: {
    goals: boolean;
    achievements: boolean;
    progress: boolean;
    notifications: boolean;
    preferences: boolean;
  };
  
  // UI state
  activeModals: string[];
  loading: {
    global: boolean;
    goals: boolean;
    achievements: boolean;
    progress: boolean;
    notifications: boolean;
    coach: boolean;
    mealPlans: boolean;
    workouts: boolean;
    nutrition: boolean;
  };
  
  // Error state
  errors: {
    [key: string]: string | null;
  };
  
  // Network state
  isOnline: boolean;
  retryQueue: string[];
}

type GlobalAction =
  | { type: 'SET_DATA_STALE'; payload: { key: keyof GlobalState['dataStale']; stale: boolean } }
  | { type: 'SET_LOADING'; payload: { key: keyof GlobalState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: string; error: string | null } }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'ADD_MODAL'; payload: string }
  | { type: 'REMOVE_MODAL'; payload: string }
  | { type: 'CLEAR_MODALS' }
  | { type: 'REFRESH_DATA' }
  | { type: 'ADD_TO_RETRY_QUEUE'; payload: string }
  | { type: 'CLEAR_RETRY_QUEUE' };

const initialState: GlobalState = {
  lastDataRefresh: Date.now(),
  dataStale: {
    goals: false,
    achievements: false,
    progress: false,
    notifications: false,
    preferences: false,
  },
  activeModals: [],
  loading: {
    global: false,
    goals: false,
    achievements: false,
    progress: false,
    notifications: false,
    coach: false,
    mealPlans: false,
    workouts: false,
    nutrition: false,
  },
  errors: {},
  isOnline: navigator.onLine,
  retryQueue: [],
};

function globalStateReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_DATA_STALE':
      return {
        ...state,
        dataStale: {
          ...state.dataStale,
          [action.payload.key]: action.payload.stale,
        },
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };
    
    case 'SET_ONLINE':
      return {
        ...state,
        isOnline: action.payload,
      };
    
    case 'ADD_MODAL':
      return {
        ...state,
        activeModals: [...state.activeModals, action.payload],
      };
    
    case 'REMOVE_MODAL':
      return {
        ...state,
        activeModals: state.activeModals.filter(modal => modal !== action.payload),
      };
    
    case 'CLEAR_MODALS':
      return {
        ...state,
        activeModals: [],
      };
    
    case 'REFRESH_DATA':
      return {
        ...state,
        lastDataRefresh: Date.now(),
        dataStale: {
          goals: false,
          achievements: false,
          progress: false,
          notifications: false,
          preferences: false,
        },
        errors: {},
      };
    
    case 'ADD_TO_RETRY_QUEUE':
      return {
        ...state,
        retryQueue: [...state.retryQueue, action.payload],
      };
    
    case 'CLEAR_RETRY_QUEUE':
      return {
        ...state,
        retryQueue: [],
      };
    
    default:
      return state;
  }
}

interface GlobalStateContextType {
  state: GlobalState;
  actions: {
    setDataStale: (key: keyof GlobalState['dataStale'], stale: boolean) => void;
    setLoading: (key: keyof GlobalState['loading'], loading: boolean) => void;
    setError: (key: string, error: string | null) => void;
    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;
    refreshAllData: () => Promise<void>;
    addToRetryQueue: (operation: string) => void;
    processRetryQueue: () => void;
  };
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  // Sync with app synchronization manager
  useEffect(() => {
    const handleConnectionChange = (isOnline: boolean) => {
      dispatch({ type: 'SET_ONLINE', payload: isOnline });
    };

    const handleModalOpened = (modalId: string) => {
      dispatch({ type: 'ADD_MODAL', payload: modalId });
    };

    const handleModalClosed = (modalId: string) => {
      dispatch({ type: 'REMOVE_MODAL', payload: modalId });
    };

    const handleLoadingChanged = (key: string, loading: boolean) => {
      if (key in state.loading) {
        dispatch({ 
          type: 'SET_LOADING', 
          payload: { key: key as keyof GlobalState['loading'], loading } 
        });
      }
    };

    // Set up event listeners
    appSync.on('connection:online', () => handleConnectionChange(true));
    appSync.on('connection:offline', () => handleConnectionChange(false));
    appSync.on('modal:opened', handleModalOpened);
    appSync.on('modal:closed', handleModalClosed);
    appSync.on('loading:changed', handleLoadingChanged);

    // Real-time subscriptions for user data
    if (user) {
      appSync.createRealtimeSubscription('user-goals', 'user_goals', user.id);
      appSync.createRealtimeSubscription('user-achievements', 'user_achievements', user.id);
      appSync.createRealtimeSubscription('user-notifications', 'user_notifications', user.id);
      appSync.createRealtimeSubscription('user-preferences', 'user_preferences', user.id);

      // Listen for real-time changes
      appSync.on('realtime:user-goals', () => {
        dispatch({ type: 'SET_DATA_STALE', payload: { key: 'goals', stale: true } });
      });
      
      appSync.on('realtime:user-achievements', () => {
        dispatch({ type: 'SET_DATA_STALE', payload: { key: 'achievements', stale: true } });
      });
      
      appSync.on('realtime:user-notifications', () => {
        dispatch({ type: 'SET_DATA_STALE', payload: { key: 'notifications', stale: true } });
      });
      
      appSync.on('realtime:user-preferences', () => {
        dispatch({ type: 'SET_DATA_STALE', payload: { key: 'preferences', stale: true } });
      });
    }

    return () => {
      appSync.off('connection:online', () => handleConnectionChange(true));
      appSync.off('connection:offline', () => handleConnectionChange(false));
      appSync.off('modal:opened', handleModalOpened);
      appSync.off('modal:closed', handleModalClosed);
      appSync.off('loading:changed', handleLoadingChanged);
      
      if (user) {
        appSync.removeRealtimeSubscription('user-goals');
        appSync.removeRealtimeSubscription('user-achievements');
        appSync.removeRealtimeSubscription('user-notifications');
        appSync.removeRealtimeSubscription('user-preferences');
      }
    };
  }, [user]);

  // Actions
  const setDataStale = useCallback((key: keyof GlobalState['dataStale'], stale: boolean) => {
    dispatch({ type: 'SET_DATA_STALE', payload: { key, stale } });
  }, []);

  const setLoading = useCallback((key: keyof GlobalState['loading'], loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, loading } });
    appSync.setLoading(key, loading);
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, error } });
  }, []);

  const openModal = useCallback((modalId: string) => {
    appSync.openModal(modalId);
  }, []);

  const closeModal = useCallback((modalId: string) => {
    appSync.closeModal(modalId);
  }, []);

  const closeAllModals = useCallback(() => {
    appSync.closeAllModals();
    dispatch({ type: 'CLEAR_MODALS' });
  }, []);

  const refreshAllData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading('global', true);
      await appSync.refreshUserData(user.id);
      dispatch({ type: 'REFRESH_DATA' });
    } catch (error) {
      console.error('Error refreshing all data:', error);
      setError('global', 'Failed to refresh data');
    } finally {
      setLoading('global', false);
    }
  }, [user, setLoading, setError]);

  const addToRetryQueue = useCallback((operation: string) => {
    dispatch({ type: 'ADD_TO_RETRY_QUEUE', payload: operation });
  }, []);

  const processRetryQueue = useCallback(() => {
    if (state.isOnline && state.retryQueue.length > 0) {
      // Process retry operations
      state.retryQueue.forEach(operation => {
        appSync.processRetryQueue(operation);
      });
      dispatch({ type: 'CLEAR_RETRY_QUEUE' });
    }
  }, [state.isOnline, state.retryQueue]);

  // Auto-process retry queue when back online
  useEffect(() => {
    if (state.isOnline) {
      processRetryQueue();
    }
  }, [state.isOnline, processRetryQueue]);

  const value = {
    state,
    actions: {
      setDataStale,
      setLoading,
      setError,
      openModal,
      closeModal,
      closeAllModals,
      refreshAllData,
      addToRetryQueue,
      processRetryQueue,
    },
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};