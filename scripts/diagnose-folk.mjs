import fs from 'node:fs';

const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('Липсва YOUTUBE_API_KEY');
const playlistId = 'PLXwYMOQjhvHeRqABXJZj8NPC0pNSPsPLj';
const catalog = JSON.parse(fs.readFileSync('music-catalog.json', 'utf8'));
const existing = new Set(catalog.songs.filter(x => x.category === 'folk').map(x => x.id));
const rows = [];
let token = '', page = 0, reportedTotal = null;
do {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  for (const [k,v] of Object.entries({part:'snippet,contentDetails,status',playlistId,maxResults:'50',key})) url.searchParams.set(k,v);
  if (token) url.searchParams.set('pageToken',token);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error('YouTube API: '+JSON.stringify(data.error ?? data).slice(0,500));
  if (!Array.isArray(data.items)) throw new Error('YouTube API не върна списък');
  reportedTotal = data.pageInfo?.totalResults ?? reportedTotal;
  for (const item of data.items) {
    const id = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? '';
    const title = item.snippet?.title ?? '';
    const privacy = item.status?.privacyStatus ?? 'неизвестно';
    const reason = !/^[\w-]{11}$/.test(id) ? 'невалиден/липсващ ID' :
      !title ? 'липсва заглавие' :
      ['Private video','Deleted video'].includes(title) ? 'частен/изтрит според YouTube' : '';
    rows.push({position: item.snippet?.position ?? rows.length, id, title, privacy, reason, inCatalog: existing.has(id)});
  }
  token = data.nextPageToken ?? '';
  if (++page > 100) throw new Error('Твърде много страници');
} while(token);
rows.sort((a,b)=>a.position-b.position);
const valid = rows.filter(x=>!x.reason);
const missing = rows.filter(x=>!x.inCatalog);
const lines = [
  '# ANGEL SMART — диагностика на „България в сърцето“', '',
  '**Само проверка. Нищо не е публикувано или променено.**', '',
  `- YouTube API отчита позиции: ${reportedTotal ?? 'неизвестно'}`,
  `- Реално извлечени позиции: ${rows.length}`,
  `- Валидни според текущото правило: ${valid.length}`,
  `- Народни песни в текущия GitHub каталог: ${existing.size}`,
  `- Позиции, които липсват от текущия GitHub каталог: ${missing.length}`, '',
  '## Позиции, които липсват от текущия каталог', '',
  ...(missing.length ? missing.map(x=>`- №${x.position+1}: ${x.title || '(без заглавие)'} | ID: ${x.id || '(няма)'} | видимост: ${x.privacy} | ${x.reason || 'валиден клип, но не е в каталога'}${x.id ? ` | https://www.youtube.com/watch?v=${x.id}` : ''}`) : ['Няма.']), '',
  '## Пълен списък от YouTube API', '',
  '| № | Заглавие | Video ID | Видимост | В GitHub каталога | Причина за пропускане |',
  '|---:|---|---|---|---|---|',
  ...rows.map(x=>`| ${x.position+1} | ${x.title.replaceAll('|','\\|').replaceAll('\n',' ')} | ${x.id} | ${x.privacy} | ${x.inCatalog?'Да':'Не'} | ${x.reason || '—'} |`), ''
];
fs.mkdirSync('diagnostics', {recursive:true});
fs.writeFileSync('diagnostics/DIAGNOSTIKA.md',lines.join('\n'));
fs.writeFileSync('diagnostics/playlist-positions.json',JSON.stringify({reportedTotal,rows},null,2)+'\n');
console.log(`Извлечени ${rows.length}, липсващи от GitHub каталога ${missing.length}. Виж DIAGNOSTIKA.md в artifact.`);
