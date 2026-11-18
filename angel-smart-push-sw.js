
/* ANGEL SMART — Push Service Worker
   Push notifications and reliable notification click handling.
   No fetch interception. No caching.
*/

self.addEventListener('push', event => {
  if (!event.data) return;

  event.waitUntil((async () => {
    let data;

    try {
      data = event.data.json();
    } catch (_) {
      return;
    }

    const title =
      typeof data.title === 'string'
        ? data.title.slice(0, 120)
        : 'ANGEL SMART';

    const body =
      typeof data.body === 'string'
        ? data.body.slice(0, 240)
        : 'Нов видеоклип в ANGEL SMART';

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

    await self.registration.showNotification(title, {
      body,
      icon: '/AU_favicon.png',
      badge: '/AU_favicon.png',
      tag: typeof data.tag === 'string'
        ? data.tag.slice(0, 100)
        : 'angel-smart-new-video',
      data: {
        url: target
      }
    });
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

      target = requested.origin === self.location.origin
        ? requested.href
        : new URL('/Smart-v1.html', self.location.origin).href;
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
        if (new URL(client.url).origin !== self.location.origin) {
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
