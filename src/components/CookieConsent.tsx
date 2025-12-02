import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "myotopia_cookie_consent";
const COOKIE_PREFERENCES_KEY = "myotopia_cookie_preferences";

interface CookiePreferences {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  functional: true,
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
    };
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setShowBanner(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Can't toggle essential
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
          paddingLeft: 'max(env(safe-area-inset-left, 16px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 16px), 16px)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Main Banner */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-12 h-12 bg-orange-500/20 rounded-xl items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-orange-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Cookie className="w-5 h-5 text-orange-400 sm:hidden" />
                    <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    We use cookies to enhance your experience. Essential cookies are required for the app to function. 
                    You can choose to enable additional cookies for analytics and enhanced functionality. 
                    Learn more in our{" "}
                    <Link to="/privacy" className="text-orange-400 hover:text-orange-300 underline">
                      Privacy Policy
                    </Link>.
                  </p>

                  {/* Cookie Details (Expandable) */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          {/* Essential Cookies */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-400" />
                                <span className="text-white text-sm font-medium">Essential Cookies</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Required</span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">
                                Required for authentication, security, and core functionality. Cannot be disabled.
                              </p>
                            </div>
                            <div className="w-10 h-6 bg-green-500/30 rounded-full flex items-center justify-end px-1">
                              <div className="w-4 h-4 bg-green-400 rounded-full" />
                            </div>
                          </div>

                          {/* Analytics Cookies */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">Analytics Cookies</span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">
                                Help us understand how you use the app to improve our services. Data is anonymized.
                              </p>
                            </div>
                            <button
                              onClick={() => togglePreference("analytics")}
                              className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                                preferences.analytics ? "bg-orange-500/30 justify-end" : "bg-gray-600 justify-start"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full transition-colors ${
                                preferences.analytics ? "bg-orange-400" : "bg-gray-400"
                              }`} />
                            </button>
                          </div>

                          {/* Functional Cookies */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">Functional Cookies</span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">
                                Remember your preferences like theme, units, and layout settings.
                              </p>
                            </div>
                            <button
                              onClick={() => togglePreference("functional")}
                              className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${
                                preferences.functional ? "bg-orange-500/30 justify-end" : "bg-gray-600 justify-start"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full transition-colors ${
                                preferences.functional ? "bg-orange-400" : "bg-gray-400"
                              }`} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    >
                      Accept All
                    </Button>
                    
                    {showDetails ? (
                      <Button
                        onClick={handleSavePreferences}
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        Save Preferences
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAcceptEssential}
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        Essential Only
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => setShowDetails(!showDetails)}
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {showDetails ? "Hide Details" : "Customize"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check cookie consent status
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      setConsent(JSON.parse(savedPrefs));
    }
  }, []);

  return {
    hasConsented: !!localStorage.getItem(COOKIE_CONSENT_KEY),
    preferences: consent,
    allowsAnalytics: consent?.analytics ?? false,
    allowsFunctional: consent?.functional ?? true,
  };
};

export default CookieConsent;
