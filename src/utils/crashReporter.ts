import { toast } from 'sonner';

export interface CrashReport {
  timestamp: string;
  error: string;
  stack?: string;
  location: string;
  userAgent: string;
  url: string;
}

class CrashReporter {
  private crashes: CrashReport[] = [];

  initialize() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      console.error('[CRASH REPORTER] Unhandled error:', event.error);
      this.reportCrash({
        error: event.error?.message || event.message,
        stack: event.error?.stack,
        location: 'window.error',
        url: window.location.href
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[CRASH REPORTER] Unhandled rejection:', event.reason);
      this.reportCrash({
        error: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        location: 'unhandledrejection',
        url: window.location.href
      });
    });

    console.log('[CRASH REPORTER] Initialized');
  }

  reportCrash(details: Omit<CrashReport, 'timestamp' | 'userAgent'>) {
    const crash: CrashReport = {
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    this.crashes.push(crash);
    
    // Store in localStorage for persistence
    try {
      const existing = localStorage.getItem('myotopia_crash_logs') || '[]';
      const logs = JSON.parse(existing);
      logs.push(crash);
      // Keep only last 10 crashes
      if (logs.length > 10) logs.shift();
      localStorage.setItem('myotopia_crash_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('[CRASH REPORTER] Failed to save crash log:', e);
    }

    // Show user-friendly error with copy button
    this.showCrashToast(crash);
  }

  private showCrashToast(crash: CrashReport) {
    const crashText = `
MYOTOPIA CRASH REPORT
=====================
Time: ${crash.timestamp}
Location: ${crash.location}
URL: ${crash.url}
Error: ${crash.error}
${crash.stack ? `\nStack:\n${crash.stack}` : ''}
User Agent: ${crash.userAgent}
=====================
`.trim();

    toast.error('App crashed', {
      description: 'Something went wrong. Error details copied.',
      duration: 10000,
      action: {
        label: 'Copy Details',
        onClick: () => {
          navigator.clipboard.writeText(crashText);
          toast.success('Crash details copied to clipboard');
        }
      }
    });

    // Auto-copy to clipboard
    navigator.clipboard.writeText(crashText).catch(() => {});
  }

  getCrashes() {
    try {
      const logs = localStorage.getItem('myotopia_crash_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  clearCrashes() {
    this.crashes = [];
    localStorage.removeItem('myotopia_crash_logs');
  }
}

export const crashReporter = new CrashReporter();
