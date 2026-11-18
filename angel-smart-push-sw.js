
/* ANGEL SMART: Push only; no fetch interception or caching. */
self.addEventListener('push',event=>{
  if(!event.data)return;
  event.waitUntil((async()=>{
    let data;try{data=event.data.json()}catch(_){return}
    const title=typeof data.title==='string'?data.title.slice(0,120):'ANGEL SMART';
    const body=typeof data.body==='string'?data.body.slice(0,240):'Нов видеоклип в ANGEL SMART';
    let target='/Smart-v1.html';
    try{const url=new URL(data.url||target,self.location.origin);if(url.origin===self.location.origin)target=url.pathname+url.search+url.hash}catch(_){}
    await self.registration.showNotification(title,{body,icon:'/AU_favicon.png',badge:'/AU_favicon.png',tag:typeof data.tag==='string'?data.tag.slice(0,100):'angel-smart-new-video',data:{url:target}});
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL(event.notification.data?.url||'/Smart-v1.html',self.location.origin);
    const clientsList=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clientsList){if(new URL(client.url).origin===url.origin){await client.navigate(url.href);return client.focus()}}
    return clients.openWindow(url.href);
  })());
});
