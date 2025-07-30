// Global error handling utilities
export const handleApiError = (error: any, fallbackMessage = 'An unexpected error occurred') => {
  console.error('API Error:', error);
  
  if (error?.message) {
    // Handle specific error messages
    if (error.message.includes('not authenticated')) {
      return 'Please sign in to continue';
    }
    if (error.message.includes('permission denied')) {
      return 'You do not have permission to access this resource';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again';
    }
    return error.message;
  }
  
  return fallbackMessage;
};

export const logError = (error: any, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { tags: { context } });
  }
};

export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: any) => void
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error, fn.name);
          if (errorHandler) {
            errorHandler(error);
          }
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      logError(error, fn.name);
      if (errorHandler) {
        errorHandler(error);
      }
      throw error;
    }
  }) as T;
};