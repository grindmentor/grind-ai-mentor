import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Haptic feedback utility for mobile
const triggerHaptic = (type: HapticType = 'light') => {
  if (!('vibrate' in navigator)) return;
  
  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 30,
    heavy: 50,
    success: [10, 50, 10],
    warning: [30, 30, 30],
    error: [50, 30, 50]
  };
  
  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail if vibration not supported
  }
};

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
  onUndo?: (previousData: T) => void;
  successMessage?: string;
  errorMessage?: string;
  undoMessage?: string;
  undoDuration?: number;
  hapticFeedback?: boolean;
}

/**
 * Hook for optimistic UI updates with undo support and haptic feedback
 * Immediately updates UI, then syncs with backend
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const undoRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const optimisticUpdate = useCallback(async (
    newData: T | ((prev: T) => T),
    asyncOperation: () => Promise<T | void>,
    undoOperation?: () => Promise<void>
  ) => {
    const previousData = data;
    const updatedData = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(previousData)
      : newData;
    
    // Immediately update UI (optimistic)
    setData(updatedData);
    setIsPending(true);
    setError(null);

    // Trigger haptic feedback on mobile
    if (options.hapticFeedback !== false) {
      triggerHaptic('light');
    }

    // Clear any previous undo timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Perform actual operation
      const result = await asyncOperation();
      
      // Update with server response if provided
      if (result !== undefined && result !== null) {
        setData(result as T);
      }
      
      // Show success toast with undo action if undoOperation provided
      if (options.successMessage || undoOperation) {
        const toastId = toast.success(options.successMessage || 'Updated successfully', {
          action: undoOperation ? {
            label: 'Undo',
            onClick: async () => {
              // Trigger haptic for undo
              if (options.hapticFeedback !== false) {
                triggerHaptic('medium');
              }
              
              setData(previousData);
              try {
                await undoOperation();
                toast.success(options.undoMessage || 'Undone successfully');
                options.onUndo?.(previousData);
              } catch (undoError) {
                // If undo fails, restore the updated state
                setData(result !== undefined && result !== null ? result as T : updatedData);
                toast.error('Failed to undo');
              }
            }
          } : undefined,
          duration: options.undoDuration || 5000,
        });
      }
      
      // Haptic success feedback
      if (options.hapticFeedback !== false) {
        triggerHaptic('success');
      }
      
      options.onSuccess?.(result !== undefined && result !== null ? result as T : updatedData);
    } catch (err) {
      // Rollback on error
      setData(previousData);
      const errorObj = err instanceof Error ? err : new Error('Operation failed');
      setError(errorObj);
      
      // Haptic error feedback
      if (options.hapticFeedback !== false) {
        triggerHaptic('error');
      }
      
      toast.error(options.errorMessage || errorObj.message || 'Operation failed');
      options.onError?.(errorObj, previousData);
    } finally {
      setIsPending(false);
    }
  }, [data, options]);

  const reset = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setError(null);
    setIsPending(false);
  }, []);

  return {
    data,
    setData,
    isPending,
    error,
    optimisticUpdate,
    reset,
    triggerHaptic
  };
}

interface OptimisticListOptions<T> extends OptimisticUpdateOptions<T[]> {
  onItemRemoved?: (item: T) => void;
  onItemRestored?: (item: T) => void;
}

/**
 * Hook for optimistic list operations (add, update, delete) with undo support
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[] = [],
  options: OptimisticListOptions<T> = {}
) {
  const { 
    data: items, 
    setData: setItems, 
    isPending, 
    error, 
    optimisticUpdate,
    reset,
    triggerHaptic 
  } = useOptimisticUpdate<T[]>(initialItems, options);

  const addItem = useCallback(async (
    item: T,
    asyncOperation: () => Promise<T | void>
  ) => {
    // Haptic feedback for add
    triggerHaptic('light');
    
    await optimisticUpdate(
      (prev) => [...prev, item],
      async () => {
        const result = await asyncOperation();
        if (result) {
          return undefined;
        }
        return undefined;
      }
    );
  }, [optimisticUpdate, triggerHaptic]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    asyncOperation: () => Promise<void>
  ) => {
    // Haptic feedback for update
    triggerHaptic('light');
    
    await optimisticUpdate(
      (prev) => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
      async () => {
        await asyncOperation();
        return undefined;
      }
    );
  }, [optimisticUpdate, triggerHaptic]);

  const removeItem = useCallback(async (
    id: string,
    asyncOperation: () => Promise<void>,
    undoOperation?: () => Promise<void>,
    itemLabel?: string
  ) => {
    const itemToRemove = items.find(item => item.id === id);
    
    // Haptic feedback for remove
    triggerHaptic('medium');
    
    await optimisticUpdate(
      (prev) => prev.filter(item => item.id !== id),
      async () => {
        await asyncOperation();
        if (itemToRemove) {
          options.onItemRemoved?.(itemToRemove);
        }
        return undefined;
      },
      undoOperation ? async () => {
        await undoOperation();
        if (itemToRemove) {
          options.onItemRestored?.(itemToRemove);
        }
      } : undefined
    );
  }, [items, optimisticUpdate, options, triggerHaptic]);

  return {
    items,
    setItems,
    isPending,
    error,
    addItem,
    updateItem,
    removeItem,
    reset,
    triggerHaptic
  };
}

// Export haptic trigger for use in other components
export const triggerHapticFeedback = (type: HapticType = 'light') => {
  if (!('vibrate' in navigator)) return;
  
  const patterns: Record<HapticType, number | number[]> = {
    light: 10,
    medium: 30,
    heavy: 50,
    success: [10, 50, 10],
    warning: [30, 30, 30],
    error: [50, 30, 50]
  };
  
  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail
  }
};

export default useOptimisticUpdate;
