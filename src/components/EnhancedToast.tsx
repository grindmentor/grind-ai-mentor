
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SoundEffects } from '@/utils/soundEffects';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface EnhancedToastProps {
  type: ToastType;
  title: string;
  description?: string;
  playSound?: boolean;
}

export const showEnhancedToast = ({ 
  type, 
  title, 
  description, 
  playSound = true 
}: EnhancedToastProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastFunction = () => {
    switch (type) {
      case 'success':
        return toast.success;
      case 'error':
        return toast.error;
      case 'warning':
        return toast.warning;
      default:
        return toast;
    }
  };

  // Play appropriate sound
  if (playSound) {
    switch (type) {
      case 'success':
        SoundEffects.playSuccess();
        break;
      case 'error':
        SoundEffects.playError();
        break;
      case 'warning':
      case 'info':
        SoundEffects.playNotification();
        break;
    }
  }

  const toastFn = getToastFunction();
  
  toastFn(title, {
    description,
    icon: getIcon(),
    duration: type === 'error' ? 6000 : 4000,
    position: 'top-center', // Changed to top-center for mobile
    style: {
      background: type === 'error' ? '#1f2937' : '#111827',
      border: `1px solid ${
        type === 'success' ? '#10b981' : 
        type === 'error' ? '#ef4444' : 
        type === 'warning' ? '#f59e0b' : '#3b82f6'
      }`,
      color: '#f9fafb'
    }
  });
};

// Convenience functions
export const showSuccessToast = (title: string, description?: string) => 
  showEnhancedToast({ type: 'success', title, description });

export const showErrorToast = (title: string, description?: string) => 
  showEnhancedToast({ type: 'error', title, description });

export const showInfoToast = (title: string, description?: string) => 
  showEnhancedToast({ type: 'info', title, description });

export const showWarningToast = (title: string, description?: string) => 
  showEnhancedToast({ type: 'warning', title, description });
