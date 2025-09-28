import { toast } from 'sonner';
import { appSync } from './appSynchronization';

/**
 * Centralized Error Handler
 * 
 * Provides consistent error handling and user feedback across the application
 */

export interface AppError {
  code: string;
  message: string;
  userMessage?: string;
  shouldRetry?: boolean;
  retryDelay?: number;
  context?: any;
}

class ErrorHandler {
  private errorCounts: Map<string, number> = new Map();
  private maxRetries = 3;

  // Handle database errors
  handleDatabaseError(error: any, context: string): AppError {
    const appError: AppError = {
      code: 'DATABASE_ERROR',
      message: error.message || 'Database operation failed',
      context,
      shouldRetry: true,
      retryDelay: 2000
    };

    // Check for specific error types
    if (error.code === 'PGRST301') {
      appError.userMessage = 'No data found';
      appError.shouldRetry = false;
    } else if (error.code === 'PGRST116') {
      appError.userMessage = 'Permission denied';
      appError.shouldRetry = false;
    } else if (error.message?.includes('JWT')) {
      appError.userMessage = 'Session expired. Please sign in again.';
      appError.shouldRetry = false;
      appError.code = 'AUTH_ERROR';
    } else {
      appError.userMessage = 'Failed to load data. Please try again.';
    }

    this.logError(appError);
    return appError;
  }

  // Handle network errors
  handleNetworkError(error: any, context: string): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
      userMessage: 'Connection error. Please check your internet connection.',
      context,
      shouldRetry: true,
      retryDelay: 5000
    };

    // Check if offline
    if (!navigator.onLine) {
      appError.userMessage = 'You are offline. Changes will be synced when online.';
      appError.shouldRetry = false;
    }

    this.logError(appError);
    return appError;
  }

  // Handle authentication errors
  handleAuthError(error: any, context: string): AppError {
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: error.message || 'Authentication failed',
      userMessage: 'Please sign in to continue.',
      context,
      shouldRetry: false
    };

    this.logError(appError);
    return appError;
  }

  // Handle validation errors
  handleValidationError(error: any, context: string): AppError {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: error.message || 'Validation failed',
      userMessage: 'Please check your input and try again.',
      context,
      shouldRetry: false
    };

    this.logError(appError);
    return appError;
  }

  // Generic error handler
  handle(error: any, context: string = 'unknown'): AppError {
    console.error(`Error in ${context}:`, error);

    // Route to specific handlers based on error type
    if (error.code?.startsWith('PGRST') || error.hint) {
      return this.handleDatabaseError(error, context);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.handleNetworkError(error, context);
    }
    
    if (error.message?.includes('JWT') || error.message?.includes('auth')) {
      return this.handleAuthError(error, context);
    }

    // Default generic error
    const appError: AppError = {
      code: 'GENERIC_ERROR',
      message: error.message || 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again.',
      context,
      shouldRetry: true,
      retryDelay: 3000
    };

    this.logError(appError);
    return appError;
  }

  // Show user-friendly error message
  showError(error: AppError | any, showToast: boolean = true): AppError {
    const appError = error.code ? error : this.handle(error);
    
    if (showToast && appError.userMessage) {
      toast.error(appError.userMessage, {
        action: appError.shouldRetry ? {
          label: 'Retry',
          onClick: () => this.retryOperation(appError)
        } : undefined
      });
    }

    return appError;
  }

  // Retry operation with exponential backoff
  async retryOperation(error: AppError, operation?: Function): Promise<void> {
    if (!error.shouldRetry || !operation) return;

    const errorKey = `${error.context}-${error.code}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;

    if (currentCount >= this.maxRetries) {
      toast.error('Maximum retries exceeded. Please refresh the page.');
      return;
    }

    this.errorCounts.set(errorKey, currentCount + 1);

    const delay = error.retryDelay || 3000;
    const backoffDelay = delay * Math.pow(2, currentCount);

    toast.info(`Retrying in ${Math.ceil(backoffDelay / 1000)} seconds...`);

    setTimeout(async () => {
      try {
        await operation();
        this.errorCounts.delete(errorKey);
        toast.success('Operation succeeded after retry');
      } catch (retryError) {
        this.showError(retryError);
      }
    }, backoffDelay);
  }

  // Log error for debugging
  private logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      context: error.context,
      userMessage: error.userMessage,
      shouldRetry: error.shouldRetry
    });

    // Emit error event for monitoring
    appSync.emit('error:occurred', error);
  }

  // Clear error counts (useful for fresh starts)
  clearErrorCounts(): void {
    this.errorCounts.clear();
  }

  // Get error statistics
  getErrorStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    for (const [key, count] of this.errorCounts) {
      stats[key] = count;
    }
    return stats;
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions for common use cases
export const handleAsync = async <T>(
  operation: () => Promise<T>,
  context: string,
  showToast: boolean = true
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = errorHandler.showError(error, showToast);
    return { data: null, error: appError };
  }
};

export const withErrorBoundary = <T extends any[], R>(
  fn: (...args: T) => R,
  context: string
) => {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler.showError(error);
      return null;
    }
  };
};

// Global error listeners
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    errorHandler.handle(event.reason, 'unhandled-promise');
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    errorHandler.handle(event.error, 'uncaught-error');
  });
}