import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'csp_violation';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id,
        ip_address: event.ip_address,
        user_agent: event.user_agent || navigator.userAgent,
        details: event.details,
        severity: event.severity,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (err) {
    console.error('Security logging error:', err);
  }
};

// CSP violation reporting
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', (e) => {
    logSecurityEvent({
      event_type: 'csp_violation',
      details: {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
        originalPolicy: e.originalPolicy
      },
      severity: 'medium'
    });
  });
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const windowData = requestCounts.get(key);

  if (!windowData || now > windowData.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (windowData.count >= maxRequests) {
    logSecurityEvent({
      event_type: 'rate_limit',
      details: { key, maxRequests, windowMs },
      severity: 'medium'
    });
    return false;
  }

  windowData.count++;
  return true;
};