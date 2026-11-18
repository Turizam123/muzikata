import fs from 'node:fs';

const file = 'preview/new-videos-for-push.json';
if (!fs.existsSync(file)) throw new Error('Липсва списъкът с новите клипове');
const videos = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(videos)) throw new Error('Невалиден списък с нови клипове');
if (videos.length === 0) {
  console.log('Няма нови клипове — не се изпращат известия.');
  process.exit(0);
}
const secret = process.env.PUSH_ADMIN_SECRET;
const endpoint = 'https://cmiylzpmpwqbacjoqtkx.supabase.co/functions/v1/angel-smart-send-push';
if (!secret) throw new Error('Липсва GitHub secret PUSH_ADMIN_SECRET');

// Не изпращаме преди новият каталог да е достъпен публично.
const published = await (async () => {
  for (let i = 0; i < 24; i++) {
    try {
      const response = await fetch('https://angeluzunov.site/music-catalog.json?pushcheck=' + Date.now(),
        { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        const catalog = await response.json();
        const ids = new Set((catalog.songs || []).map(song => song.id));
        if (videos.every(video => ids.has(video.id))) return true;
      }
    } catch (error) { console.log('Изчакване на публикувания каталог:', error.message); }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  return false;
})();
if (!published) throw new Error('Новият каталог още не е достъпен на сайта. Не са изпратени известия.');

let failures = 0;
for (const video of videos) {
  if (typeof video.id !== 'string' || !/^[\w-]{11}$/.test(video.id) ||
      typeof video.title !== 'string') throw new Error('Невалиден видеоклип');
  const title = '🎬 НОВО ВИДЕО | ANGEL SMART';
  const cleanTitle = video.title.replace(/\s+/g, ' ').trim().slice(0, 100);
  const body = `„${cleanTitle}“ – нов видеоклип в ANGEL SMART! Отвори приложението и гледай.`.slice(0, 240);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url: '/Smart-v1.html' }),
      signal: AbortSignal.timeout(120000)
    });
    const result = await response.json();
    console.log('Push за видео ' + video.id + ':', {
      httpStatus: response.status, total: result.total, sent: result.sent,
      failed: result.failed, expired: result.expired, error: result.error
    });
    if (!response.ok || !result.ok || (result.failed ?? 0) > 0) failures++;
  } catch (error) {
    failures++;
    console.error('Грешка при Push за видео ' + video.id + ':', error.message);
  }
}
if (failures) throw new Error('Има неуспешни Push изпращания: ' + failures + '. Провери логовете.');
