
/* ANGEL SMART — Push Service Worker v2
   No fetch interception. No caching. */

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  event.waitUntil((async () => {

    console.info('[ANGEL SMART] Push received (v2)');

    let data = {};

    if (event.data) {
      try {
        const parsed = event.data.json();

        if (parsed && typeof parsed === 'object') {
          data = parsed;
        }
      } catch (_) {
        console.warn('[ANGEL SMART] Invalid JSON payload');
      }
    }

    const title =
      typeof data.title === 'string' && data.title.trim()
        ? data.title.slice(0, 120)
        : 'ANGEL SMART';

    const body =
      typeof data.body === 'string' && data.body.trim()
        ? data.body.slice(0, 240)
        : 'Имате ново известие от ANGEL SMART.';

    let target = '/Smart-v1.html';

    try {
      const url = new URL(
        data.url || target,
        self.location.origin
      );

      if (url.origin === self.location.origin) {
        target = url.pathname + url.search + url.hash;
      }

    } catch (_) {}

    const tag =
      'angel-smart-' +
      Date.now() +
      '-' +
      Math.random().toString(36).slice(2);

    try {

      await self.registration.showNotification(title, {
        body,
        icon: '/AU_favicon.png',
        badge: '/AU_favicon.png',
        tag,
        data: {
          url: target
        }
      });

      console.info('[ANGEL SMART] Notification shown');

    } catch (error) {

      console.warn(
        '[ANGEL SMART] Notification failed; retrying without icons',
        error
      );

      await self.registration.showNotification(title, {
        body,
        tag,
        data: {
          url: target
        }
      });

      console.info(
        '[ANGEL SMART] Fallback notification shown'
      );
    }

  })());
});


/* Open ANGEL SMART when notification is clicked */

self.addEventListener('notificationclick', event => {

  event.notification.close();

  event.waitUntil((async () => {

    let target;

    try {

      const requested = new URL(
        event.notification.data?.url || '/Smart-v1.html',
        self.location.origin
      );

      target =
        requested.origin === self.location.origin
          ? requested.href
          : new URL(
              '/Smart-v1.html',
              self.location.origin
            ).href;

    } catch (_) {

      target = new URL(
        '/Smart-v1.html',
        self.location.origin
      ).href;
    }

    const windowClients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of windowClients) {

      try {

        if (
          new URL(client.url).origin !== self.location.origin
        ) {
          continue;
        }

        if (new URL(client.url).href !== target) {
          await client.navigate(target);
        }

        await client.focus();

        return;

      } catch (error) {

        // Try another window or open a new one.

      }
    }

    if (clients.openWindow) {
      await clients.openWindow(target);
    }

  })());
});
