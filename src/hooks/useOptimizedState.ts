import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

/**
 * useState with automatic batching and deduplication
 * Prevents unnecessary re-renders from rapid state updates
 */
export function useDebouncedState<T>(initialValue: T, delay = 100) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setValueDebounced = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue as T);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedValue, setValueDebounced, value] as const;
}

/**
 * Stable callback that doesn't change reference
 * Prevents child component re-renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Memoized selector for complex state derivations
 */
export function useSelector<T, R>(
  state: T,
  selector: (state: T) => R,
  deps: any[] = []
): R {
  return useMemo(() => selector(state), [state, ...deps]);
}

/**
 * State that only updates when value actually changes (deep comparison)
 */
export function useDeepMemoState<T>(value: T): T {
  const ref = useRef(value);
  const stringified = JSON.stringify(value);
  
  return useMemo(() => {
    const newStringified = JSON.stringify(value);
    if (newStringified !== JSON.stringify(ref.current)) {
      ref.current = value;
    }
    return ref.current;
  }, [stringified]);
}

/**
 * Lazy initialization for expensive computations
 */
export function useLazyValue<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

/**
 * Track if component is mounted to prevent state updates after unmount
 */
export function useMountedRef() {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return mountedRef;
}

/**
 * Safe setState that checks if component is mounted
 */
export function useSafeState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);
  const mountedRef = useMountedRef();
  
  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);
  
  return [state, setSafeState] as const;
}
