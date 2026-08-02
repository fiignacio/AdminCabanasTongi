import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Workbox Precaching & Cleanup
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);
self.skipWaiting();
clientsClaim();

// Listen to Background Push Notifications from Web Push Server
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación Push recibida en segundo plano:', event);
  
  let data = {
    title: '🔔 Alerta del Sistema de Administración',
    body: 'Tienes una nueva actualización en tu panel de control.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: '/admin/dashboard' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/admin/dashboard' },
    actions: [
      { action: 'open', title: '👁️ Abrir Aplicación' },
      { action: 'close', title: '❌ Descartar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listen to Notification Clicks on Screen / Lockscreen
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic en la notificación:', event);
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
