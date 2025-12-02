import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, previousData: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates
 * Immediately updates UI, then syncs with backend
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimisticUpdate = useCallback(async (
    newData: T | ((prev: T) => T),
    asyncOperation: () => Promise<T | void>
  ) => {
    const previousData = data;
    const updatedData = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(previousData)
      : newData;
    
    // Immediately update UI (optimistic)
    setData(updatedData);
    setIsPending(true);
    setError(null);

    try {
      // Perform actual operation
      const result = await asyncOperation();
      
      // Update with server response if provided
      if (result !== undefined && result !== null) {
        setData(result as T);
      }
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      options.onSuccess?.(result !== undefined && result !== null ? result as T : updatedData);
    } catch (err) {
      // Rollback on error
      setData(previousData);
      const errorObj = err instanceof Error ? err : new Error('Operation failed');
      setError(errorObj);
      
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
    reset
  };
}

/**
 * Hook for optimistic list operations (add, update, delete)
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[] = [],
  options: OptimisticUpdateOptions<T[]> = {}
) {
  const { 
    data: items, 
    setData: setItems, 
    isPending, 
    error, 
    optimisticUpdate,
    reset 
  } = useOptimisticUpdate<T[]>(initialItems, options);

  const addItem = useCallback(async (
    item: T,
    asyncOperation: () => Promise<T | void>
  ) => {
    await optimisticUpdate(
      (prev) => [...prev, item],
      async () => {
        const result = await asyncOperation();
        // If server returns the item with a real ID, update it
        if (result) {
          // Return undefined - the optimistic state is already correct
          return undefined;
        }
        return undefined;
      }
    );
  }, [optimisticUpdate]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    asyncOperation: () => Promise<void>
  ) => {
    await optimisticUpdate(
      (prev) => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
      async () => {
        await asyncOperation();
        return undefined;
      }
    );
  }, [optimisticUpdate]);

  const removeItem = useCallback(async (
    id: string,
    asyncOperation: () => Promise<void>
  ) => {
    await optimisticUpdate(
      (prev) => prev.filter(item => item.id !== id),
      async () => {
        await asyncOperation();
        return undefined;
      }
    );
  }, [optimisticUpdate]);

  return {
    items,
    setItems,
    isPending,
    error,
    addItem,
    updateItem,
    removeItem,
    reset
  };
}

export default useOptimisticUpdate;
