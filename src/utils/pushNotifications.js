import { getSupabase } from '../store/useStore';

// Public VAPID Key (Clave estándar pública para Web Push)
const PUBLIC_VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgD8R69b2q0a-74zYkUa1Y2-k3K4Z4_Z5V5_5V5_5V5_8';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerNativePushSubscription(syncConfig) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Tu navegador o dispositivo móvil no soporta Notificaciones Push Nativas.');
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('El permiso de notificaciones fue denegado por el usuario.');
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    try {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    } catch (err) {
      // Fallback simple subscription without VAPID if server key fails
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
    }
  }

  const subJson = subscription.toJSON();
  const endpoint = subJson.endpoint;
  const p256dh = subJson.keys?.p256dh || '';
  const auth = subJson.keys?.auth || '';

  // Save subscription to Supabase
  const sb = getSupabase(syncConfig);
  if (sb && endpoint) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    await sb.from('push_subscriptions').upsert([{
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      device_type: isMobile ? 'mobile' : 'desktop',
      updated_at: new Date().toISOString()
    }], { onConflict: 'endpoint' });
  }

  return subscription;
}

export async function sendNativeDeviceNotification(title, body, syncConfig) {
  // Show immediate local OS notification via Service Worker
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/admin/dashboard' }
    });
  }

  // Register in Supabase admin_notifications table
  const sb = getSupabase(syncConfig);
  if (sb) {
    await sb.from('admin_notifications').insert([{
      title,
      message: body,
      type: 'native_alert',
      read: false,
      created_at: new Date().toISOString()
    }]);
  }
}
