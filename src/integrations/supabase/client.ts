
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://druwytttcxnfpwgyrvmt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydXd5dHR0Y3huZnB3Z3lydm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTQ2MjYsImV4cCI6MjA2NjE3MDYyNn0.qyAfq9sl1jimQEnKDbV90zlDloZFoHqboDHUzJeLP6I"

// Enhanced configuration for iOS PWA compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Enhanced iOS PWA settings
    storageKey: 'myotopia-auth-token',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'X-Client-Info': 'myotopia-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// iOS PWA session persistence enhancement
if (typeof window !== 'undefined') {
  const isIOSPWA = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                   window.matchMedia('(display-mode: standalone)').matches;
  
  if (isIOSPWA) {
    console.log('iOS PWA detected - enabling enhanced session persistence');
    
    // Periodic session refresh for iOS PWA
    setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('iOS PWA session refresh check passed');
        }
      } catch (error) {
        console.warn('iOS PWA session refresh check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }
}
