/**
 * Unified logging utility - only logs in development
 * Replaces all console.log/warn/error calls throughout the app
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production (for error tracking)
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Performance logging - only in dev
  perf: (name: string, duration: number) => {
    if (isDevelopment && duration > 100) {
      console.warn(`⚡ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }
};
