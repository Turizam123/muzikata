import fs from 'node:fs';
import crypto from 'node:crypto';

const sha = x =>
  crypto.createHash('sha256').update(x).digest('hex');

// Зареждане на одобрения предварителен преглед
const manifest = JSON.parse(
  fs.readFileSync('preview/manifest.json', 'utf8')
);

const current = fs.readFileSync(
  'music-catalog.json', 'utf8'
);

const candidate = fs.readFileSync(
  'preview/music-catalog.json', 'utf8'
);

// Проверка дали каталогът е променян след прегледа
if (sha(current) !== manifest.baseSha256) {
  throw new Error(
    'Каталогът е променен след предварителния преглед. Направи нова проверка.'
  );
}

if (sha(candidate) !== manifest.previewSha256) {
  throw new Error('Предложеният каталог е променен.');
}

const old = JSON.parse(current);
const next = JSON.parse(candidate);

// Проверка на валидността на песните
const valid = x =>
  x &&
  typeof x.id === 'string' &&
  /^[\w-]{11}$/.test(x.id) &&
  typeof x.title === 'string' &&
  typeof x.description === 'string' &&
  ['folk', 'popfolk', 'estrada', 'other'].includes(x.category);

if (
  !Array.isArray(old.songs) ||
  !Array.isArray(next.songs) ||
  !next.songs.length ||
  !next.songs.every(valid)
) {
  throw new Error('Невалиден предложен каталог');
}

// Запазване на албума без промени
const originalAlbum = old.songs.filter(
  x => x.category === 'other'
);

const nextAlbum = next.songs.filter(
  x => x.category === 'other'
);

if (
  originalAlbum.length !== 1 ||
  JSON.stringify(originalAlbum) !== JSON.stringify(nextAlbum)
) {
  throw new Error('Албумът не трябва да се променя');
}

// Проверка на категориите
for (const cat of ['folk', 'popfolk', 'estrada']) {
  if (!next.songs.some(x => x.category === cat)) {
    throw new Error('Празна категория: ' + cat);
  }
}

// Защита срещу дублирани видеоклипове
const ids = next.songs.map(x => x.id);

if (new Set(ids).size !== ids.length) {
  throw new Error('Открити са дублирани видеоклипове');
}

// Индекс на вече публикуваните песни
const previousSongs = new Map(
  old.songs.map(song => [song.id, song])
);

// Единен момент на публикуване
const publishedAt = new Date().toISOString();

let newCount = 0;
let preservedCount = 0;

// Автоматично управление на датите
next.songs = next.songs.map(song => {
  const previous = previousSongs.get(song.id);

  // Съществуваща песен:
  // запазваме оригиналната дата
  if (previous) {
    preservedCount++;

    if (
      typeof previous.addedAt === 'string' &&
      !Number.isNaN(Date.parse(previous.addedAt))
    ) {
      return {
        ...song,
        addedAt: previous.addedAt
      };
    }

    // Стара песен без дата:
    // не я представяме като нова премиера
    const { addedAt, ...rest } = song;

    return rest;
  }

  // Нова песен:
  // записваме точния момент на публикуване
  newCount++;

  return {
    ...song,
    addedAt: publishedAt
  };
});

// Регистър: pending -> sent само след потвърден отговор от Supabase.
// Съществуващите клипове са базова линия при първоначално включване.
const ledgerPath = 'push-notified-ids.json';
const ledger = fs.existsSync(ledgerPath)
  ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
  : { version: 2, sent: [], pending: [] };

// Миграция от първоначалния формат { ids: [...] }.
// Старите ID са маркирани като вече обработени, за да не се изпращат
// масово стари известия при преминаване към новата версия.
if (Array.isArray(ledger.ids) && !ledger.sent && !ledger.pending) {
  ledger.sent = ledger.ids;
  ledger.pending = [];
  delete ledger.ids;
}
if (!Array.isArray(ledger.sent) || !Array.isArray(ledger.pending) ||
    !ledger.sent.every(id => typeof id === 'string') ||
    !ledger.pending.every(v => v && typeof v.id === 'string' &&
      /^[\w-]{11}$/.test(v.id) && typeof v.title === 'string')) {
  throw new Error('Невалиден регистър push-notified-ids.json');
}
const sent = new Set(ledger.sent);
for (const song of old.songs) {
  if (!ledger.pending.some(v => v.id === song.id)) sent.add(song.id);
}
const pending = new Map(ledger.pending.map(v => [v.id, v]));
for (const song of next.songs) {
  if (!previousSongs.has(song.id) && !sent.has(song.id) && !pending.has(song.id)) {
    pending.set(song.id, { id: song.id, title: song.title });
  }
}
const state = { version: 2, sent: [...sent].sort(), pending: [...pending.values()] };
fs.writeFileSync(ledgerPath, JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log('Push известия в изчакване: ' + state.pending.length);

// Записване на окончателния каталог
fs.writeFileSync(
  'music-catalog.json',
  JSON.stringify(next, null, 2) + '\n',
  'utf8'
);

console.log('ANGEL SMART: каталогът е одобрен.');
console.log('Нови песни: ' + newCount);
console.log('Съществуващи песни: ' + preservedCount);
console.log('Дата на публикуване: ' + publishedAt);
console.log('Каталогът е готов за git commit.');
