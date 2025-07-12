import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface SessionState {
  scrollPosition: number;
  formData: Record<string, any>;
  expandedSections: string[];
  selectedModule?: string;
  lastVisited: string;
}

const SESSION_STORAGE_KEY = 'myotopia_session_state';

export const useSessionPersistence = (pageKey: string) => {
  const location = useLocation();
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    try {
      const stored = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${pageKey}`);
      return stored ? JSON.parse(stored) : {
        scrollPosition: 0,
        formData: {},
        expandedSections: [],
        lastVisited: location.pathname
      };
    } catch {
      return {
        scrollPosition: 0,
        formData: {},
        expandedSections: [],
        lastVisited: location.pathname
      };
    }
  });

  // Save session state
  const saveSessionState = (updates: Partial<SessionState>) => {
    const newState = { ...sessionState, ...updates };
    setSessionState(newState);
    try {
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${pageKey}`, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save session state:', error);
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    if (scrollElementRef.current && sessionState.scrollPosition > 0) {
      setTimeout(() => {
        scrollElementRef.current?.scrollTo({
          top: sessionState.scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  // Save scroll position
  const saveScrollPosition = () => {
    if (scrollElementRef.current) {
      const scrollTop = scrollElementRef.current.scrollTop;
      saveSessionState({ scrollPosition: scrollTop });
    }
  };

  // Handle expanded sections
  const toggleSection = (sectionId: string) => {
    const expandedSections = sessionState.expandedSections.includes(sectionId)
      ? sessionState.expandedSections.filter(id => id !== sectionId)
      : [...sessionState.expandedSections, sectionId];
    
    saveSessionState({ expandedSections });
  };

  const isSectionExpanded = (sectionId: string) => {
    return sessionState.expandedSections.includes(sectionId);
  };

  // Handle form data persistence
  const saveFormData = (fieldName: string, value: any) => {
    saveSessionState({
      formData: { ...sessionState.formData, [fieldName]: value }
    });
  };

  const getFormData = (fieldName: string, defaultValue?: any) => {
    return sessionState.formData[fieldName] ?? defaultValue;
  };

  // Auto-save scroll position on scroll
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScrollPosition, 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, []);

  // Save current route as last visited
  useEffect(() => {
    saveSessionState({ lastVisited: location.pathname });
  }, [location.pathname]);

  return {
    scrollElementRef,
    sessionState,
    saveSessionState,
    restoreScrollPosition,
    saveScrollPosition,
    toggleSection,
    isSectionExpanded,
    saveFormData,
    getFormData
  };
};