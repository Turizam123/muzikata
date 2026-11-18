import fs from 'node:fs';

const ledgerPath = 'push-notified-ids.json';
const state = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
if (!Array.isArray(state.sent) || !Array.isArray(state.pending)) {
  throw new Error('Невалиден Push регистър');
}
if (state.pending.length === 0) {
  console.log('Няма чакащи Push известия.');
  process.exit(0);
}
const secret = process.env.PUSH_ADMIN_SECRET;
if (!secret) throw new Error('Липсва GitHub secret PUSH_ADMIN_SECRET');
const endpoint = 'https://cmiylzpmpwqbacjoqtkx.supabase.co/functions/v1/angel-smart-send-push';
const site = 'https://angeluzunov.site/music-catalog.json';

// Изчакваме публичния каталог да съдържа всеки нов клип.
const pending = [...state.pending];
for (let i = 0; i < 24; i++) {
  try {
    const response = await fetch(site + '?pushcheck=' + Date.now(), {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(10000)
    });
    if (response.ok) {
      const catalog = await response.json();
      const ids = new Set((catalog.songs || []).map(v => v.id));
      if (pending.every(v => ids.has(v.id))) break;
    }
  } catch (error) {
    console.log('Изчакване на сайта:', error.message);
  }
  if (i === 23) throw new Error('Новият каталог още не е достъпен; не изпращаме Push.');
  await new Promise(resolve => setTimeout(resolve, 10000));
}

let failures = 0;
for (const video of pending) {
  if (typeof video.id !== 'string' || !/^[\w-]{11}$/.test(video.id) ||
      typeof video.title !== 'string' || !video.title.trim()) {
    throw new Error('Невалиден видеоклип в регистъра');
  }
  const cleanTitle = video.title.replace(/\s+/g, ' ').trim().slice(0, 100);
  const title = '🎬 НОВО ВИДЕО | ANGEL SMART';
  const body = `„${cleanTitle}“ – нов видеоклип в ANGEL SMART! Отвори приложението и гледай.`.slice(0, 240);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, url: '/Smart-v1.html' }),
      signal: AbortSignal.timeout(120000)
    });
    const result = await response.json();
    console.log('Push за ' + video.id, {
      httpStatus: response.status, total: result.total,
      sent: result.sent, failed: result.failed, expired: result.expired,
      error: result.error
    });
    // Потвърждението означава приемане от Push доставчика,
    // не доказателство за показване на телефона.
    if (!response.ok || result.ok !== true ||
        !Number.isInteger(result.sent) ||
        !Number.isInteger(result.total) ||
        !Number.isInteger(result.expired) ||
        result.total !== result.sent + result.expired ||
        result.failed !== 0 || result.sent === 0) {
      failures++;
      continue;
    }
    state.sent = [...new Set([...state.sent, video.id])].sort();
    state.pending = state.pending.filter(v => v.id !== video.id);
    fs.writeFileSync(ledgerPath, JSON.stringify(state, null, 2) + '\n');
  } catch (error) {
    failures++;
    console.error('Грешка при Push за ' + video.id + ':', error.message);
  }
}
if (failures) {
  console.error('Неуспешни Push известия: ' + failures + '. Остават pending за следващ опит.');
  process.exitCode = 1;
}
