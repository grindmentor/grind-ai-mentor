
interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BP5g8zE7LqrDGNK5JW5KGH5D8KY8vY3yH7Y9jGHgL1qR2tN9p6s5Q8vYp7N2mK9vX4L3jG6f9H8cY5p2nM7x1K'
        )
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async showNotification(options: PushNotificationOptions): Promise<void> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icon-192.png'
          }
        ]
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async scheduleNotification(options: PushNotificationOptions, delay: number): Promise<void> {
    setTimeout(() => {
      this.showNotification(options);
    }, delay);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // iOS-specific PWA installation check
  isIOSPWA(): boolean {
    return (window.navigator as any).standalone === true || 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  // Check if running on iOS
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // iOS-specific notification handling
  async setupIOSNotifications(): Promise<void> {
    if (!this.isIOS()) return;

    // Add to home screen prompt for iOS
    if (!this.isIOSPWA()) {
      console.log('App is not installed as PWA on iOS. Notifications will be limited.');
    }
  }
}

export const pushNotificationService = new PushNotificationService();
