import { toast } from 'sonner';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  AI_SERVICE = 'AI_SERVICE',
  DATABASE = 'DATABASE',
  RATE_LIMIT = 'RATE_LIMIT',
  USAGE_LIMIT = 'USAGE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  originalError?: any;
  action?: () => void;
  actionLabel?: string;
}

const errorMessages: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Connection issue. Please check your internet connection.',
  [ErrorType.AUTHENTICATION]: 'Please sign in to continue.',
  [ErrorType.AUTHORIZATION]: 'You don\'t have permission to access this feature.',
  [ErrorType.VALIDATION]: 'Please check your input and try again.',
  [ErrorType.AI_SERVICE]: 'AI service temporarily unavailable. Please try again.',
  [ErrorType.DATABASE]: 'Unable to save your data. Please try again.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorType.USAGE_LIMIT]: 'Usage limit reached. Upgrade to continue.',
  [ErrorType.UNKNOWN]: 'Something went wrong. Please try again.'
};

export function classifyError(error: any): ErrorType {
  const errorMessage = error?.message || error?.error || String(error);
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return ErrorType.RATE_LIMIT;
  }
  
  if (errorMessage.includes('usage limit') || errorMessage.includes('limit reached')) {
    return ErrorType.USAGE_LIMIT;
  }
  
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ErrorType.NETWORK;
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (errorMessage.includes('AI') || errorMessage.includes('OpenAI') || errorMessage.includes('model')) {
    return ErrorType.AI_SERVICE;
  }
  
  if (errorMessage.includes('database') || errorMessage.includes('supabase')) {
    return ErrorType.DATABASE;
  }
  
  return ErrorType.UNKNOWN;
}

export function createAppError(error: any, customMessage?: string): AppError {
  const type = classifyError(error);
  const baseMessage = errorMessages[type];
  
  return {
    type,
    message: error?.message || String(error),
    userMessage: customMessage || baseMessage,
    originalError: error
  };
}

export function handleError(error: any, options?: {
  silent?: boolean;
  customMessage?: string;
  action?: () => void;
  actionLabel?: string;
}) {
  const appError = createAppError(error, options?.customMessage);
  
  console.error(`[${appError.type}]:`, appError.message, appError.originalError);
  
  if (!options?.silent) {
    toast.error(appError.userMessage, {
      duration: 5000,
      action: options?.action ? {
        label: options.actionLabel || 'Retry',
        onClick: options.action
      } : undefined
    });
  }
  
  return appError;
}

export function handleSuccess(message: string, options?: {
  duration?: number;
  description?: string;
}) {
  toast.success(message, {
    duration: options?.duration || 3000,
    description: options?.description
  });
}
