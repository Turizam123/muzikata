
/* ANGEL SMART — Push Service Worker
   Diagnostic notification click handling
   No caching. No fetch interception.
*/

const APP_URL = '/Smart-v1.html';
const DEBUG_CACHE = 'angel-smart-push-debug-v1';

async function debugLog(message) {
  try {
    const cache = await caches.open(DEBUG_CACHE);
    await cache.put(
      '/push-debug-last',
      new Response(JSON.stringify({
        message,
        time: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  } catch (error) {
    console.error('Push debug:', error);
  }
}

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

    let target = APP_URL;

    try {
      const url = new URL(
        data.url || APP_URL,
        self.location.origin
      );

      if (url.origin === self.location.origin) {
        target = url.pathname + url.search + url.hash;
      }
    } catch (_) {}

    await debugLog('Push received');

    await self.registration.showNotification(title, {
      body,
      icon: '/AU_favicon.png',
      badge: '/AU_favicon.png',
      tag: typeof data.tag === 'string'
        ? data.tag.slice(0, 100)
        : 'angel-smart-new-video',
      data: { url: target }
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil((async () => {
    await debugLog('Notification clicked');

    let target;

    try {
      const requested = new URL(
        event.notification.data?.url || APP_URL,
        self.location.origin
      );

      target = requested.origin === self.location.origin
        ? requested.href
        : new URL(APP_URL, self.location.origin).href;
    } catch (_) {
      target = new URL(APP_URL, self.location.origin).href;
    }

    try {
      const opened = await clients.openWindow(target);

      if (opened) {
        await debugLog('Window opened successfully');
        return;
      }

      await debugLog('openWindow returned null');
    } catch (error) {
      await debugLog(
        'openWindow error: ' + String(error)
      );
    }

    try {
      const windows = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) {
          continue;
        }

        try {
          if (client.url !== target) {
            await client.navigate(target);
          }

          await client.focus();
          await debugLog('Existing window focused');
          return;
        } catch (_) {
          // Try another client.
        }
      }

      await debugLog('No window could be opened');
    } catch (error) {
      await debugLog(
        'Client handling error: ' + String(error)
      );
    }
  })());
});
