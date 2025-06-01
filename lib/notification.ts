// Check if the browser supports notifications
export function checkNotificationPermission(): boolean {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }
  return true;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!checkNotificationPermission()) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Show a notification
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!checkNotificationPermission()) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    requestNotificationPermission().then((permission) => {
      if (permission) {
        new Notification(title, options);
      }
    });
  }
}

// Register the service worker for push notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
}
