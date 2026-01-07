import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Protocol handler for deep linking: myotopia://
const ProtocolHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleProtocolUrls = () => {
      const urlParams = new URLSearchParams(location.search);
      const protocol = urlParams.get('protocol');
      
      if (protocol) {
        // Parse protocol URLs like myotopia://workout, myotopia://physique, etc.
        const protocolUrl = decodeURIComponent(protocol);
        const [, action, param] = protocolUrl.match(/myotopia:\/\/(\w+)(?:\/(.+))?/) || [];
        
        if (action) {
          handleDeepLink(action, param);
        }
      }

      // Handle share target (when users share content to the app)
      const shareData = urlParams.get('share');
      if (shareData) {
        handleShareTarget();
      }

      // Handle file handler (when users open files with the app)
      const handler = urlParams.get('handler');
      if (handler) {
        handleFileHandler(handler);
      }
    };

    handleProtocolUrls();
  }, [location, user, navigate]);

  const handleDeepLink = (action: string, param?: string) => {
    if (!user) {
      // Store the intended action for after login
      localStorage.setItem('pendingAction', `${action}${param ? `/${param}` : ''}`);
      navigate('/signin');
      return;
    }

    switch (action) {
      case 'workout':
        navigate('/workout-logger');
        break;
      case 'physique':
        navigate('/physique-ai');
        break;
      case 'food':
        navigate('/smart-food-log');
        break;
      case 'dashboard':
        navigate('/progress-hub-dashboard');
        break;
      case 'progress':
        navigate('/app?module=progress-hub');
        break;
      case 'coach':
        navigate('/app?module=coachgpt');
        break;
      case 'timer':
        navigate('/app?module=timer');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'profile':
        navigate('/settings');
        break;
      case 'pricing':
        navigate('/pricing');
        break;
      default:
        navigate('/app');
    }
  };

  const handleShareTarget = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    // Handle shared content (photos, text, etc.)
    // For now, redirect to the appropriate module
    navigate('/smart-food-log'); // Most likely use case for sharing
  };

  const handleFileHandler = (handler: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    switch (handler) {
      case 'workout':
        navigate('/workout-logger');
        break;
      default:
        navigate('/app');
    }
  };

  return null; // This is a utility component that doesn't render anything
};

export default ProtocolHandler;