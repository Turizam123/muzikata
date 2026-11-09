import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const playlists = {
  folk: 'PLXwYMOQjhvHeRqABXJZj8NPC0pNSPsPLj',
  popfolk: 'PLXwYMOQjhvHdQd7Hqw3rQjjYSJ4v39KnW',
  estrada: 'PLXwYMOQjhvHd_EDw64dVnyfGzP37Q-dcO'
};
const root=process.cwd();
const catalogPath=path.join(root,'music-catalog.json');
const out=path.join(root,'preview');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=()=>fs.readFileSync(catalogPath,'utf8');
const key=process.env.YOUTUBE_API_KEY;
if(!key)throw new Error('Липсва GitHub secret YOUTUBE_API_KEY.');
const oldText=read(), old=JSON.parse(oldText);
if(!Array.isArray(old.songs))throw new Error('Невалиден текущ каталог');
const validId=id=>typeof id==='string'&&/^[\w-]{11}$/.test(id);
const seen=new Set();
const next=[];
for(const [category,playlistId] of Object.entries(playlists)){
  let pageToken='', pages=0, found=0;
  do{
    const url=new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part','snippet,contentDetails');
    url.searchParams.set('playlistId',playlistId);
    url.searchParams.set('maxResults','50');
    url.searchParams.set('key',key);
    if(pageToken)url.searchParams.set('pageToken',pageToken);
    const response=await fetch(url);
    const data=await response.json();
    if(!response.ok)throw new Error('YouTube API error for '+category+': '+JSON.stringify(data.error||data).slice(0,500));
    if(!Array.isArray(data.items))throw new Error('Невалиден отговор от YouTube за '+category);
    for(const item of data.items){
      const id=item.contentDetails?.videoId||item.snippet?.resourceId?.videoId;
      const title=item.snippet?.title;
      if(!validId(id)||!title||['Private video','Deleted video'].includes(title))continue;
      const unique=category+':'+id;
      if(seen.has(unique))continue;
      seen.add(unique);found++;
      next.push({id,title,category,description:''});
    }
    pageToken=data.nextPageToken||'';
    if(++pages>100)throw new Error('Твърде много страници за '+category);
  }while(pageToken);
  if(!found)throw new Error('Плейлистът '+category+' не върна публични клипове. Каталогът няма да се подменя.');
}
const oldBy=new Map(old.songs.filter(x=>x.category!=='other').map(x=>[x.category+':'+x.id,x]));
const newBy=new Map(next.map(x=>[x.category+':'+x.id,x]));
for(const song of next){
  const prev=oldBy.get(song.category+':'+song.id);
  if(prev?.description)song.description=prev.description;
}
const added=next.filter(x=>!oldBy.has(x.category+':'+x.id));
const removed=[...oldBy.values()].filter(x=>!newBy.has(x.category+':'+x.id));
const renamed=next.filter(x=>oldBy.has(x.category+':'+x.id)&&oldBy.get(x.category+':'+x.id).title!==x.title);
const album=old.songs.filter(x=>x.category==='other');
if(album.length!==1)throw new Error('Очаква се точно един непроменян албум');
const proposed={version:1,songs:[...next,...album]};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'music-catalog.json'),JSON.stringify(proposed,null,2)+'\n');
const lines=[
  '# ANGEL SMART — отчет за ръчно одобрение',
  '',
  'Проверката НЕ публикува нищо. За публикуване стартирай отделно „02 — Одобри и публикувай“.',
  '',
  `**Нови:** ${added.length} · **Премахнати:** ${removed.length} · **Преименувани:** ${renamed.length}`,
  '',
  ...[['Нови клипове',added],['Клипове за премахване',removed],['Променени заглавия',renamed]].flatMap(([name,items])=>[
    '## '+name,'',...(items.length?items.map(x=>'- ['+x.category+'] '+x.title+' — https://www.youtube.com/watch?v='+x.id):['Няма']), ''
  ]),
  '## Албуми','', 'Запазен без промени: '+album[0].title,''
];
fs.writeFileSync(path.join(out,'OTCHET.md'),lines.join('\n'));
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({baseSha256:sha(oldText),previewSha256:sha(fs.readFileSync(path.join(out,'music-catalog.json')))},null,2)+'\n');
console.log(lines.join('\n'));
