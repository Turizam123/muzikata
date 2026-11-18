
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

// Нови видеоклипове за автоматично Push известяване.
// Записваме обработените ID преди изпращането, за да не изпращаме
// повторно при рестартиране на workflow. При временен неуспех
// е нужна ръчна проверка/повторно изпращане.
const ledgerPath = 'push-notified-ids.json';
const existingLedger = fs.existsSync(ledgerPath)
  ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
  : { ids: [] };
if (!Array.isArray(existingLedger.ids) ||
    !existingLedger.ids.every(id => typeof id === 'string')) {
  throw new Error('Невалиден регистър push-notified-ids.json');
}
const seen = new Set(existingLedger.ids);
// При първо включване всички досегашни видеа са базова линия.
for (const song of old.songs) seen.add(song.id);
const newVideos = next.songs
  .filter(song => !previousSongs.has(song.id) && !seen.has(song.id))
  .map(song => ({ id: song.id, title: song.title }));
for (const video of newVideos) seen.add(video.id);
fs.writeFileSync(ledgerPath,
  JSON.stringify({ ids: [...seen].sort() }, null, 2) + '\n', 'utf8');
fs.mkdirSync('preview', { recursive: true });
fs.writeFileSync('preview/new-videos-for-push.json',
  JSON.stringify(newVideos, null, 2) + '\n', 'utf8');
console.log('Нови Push известия за изпращане: ' + newVideos.length);

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
