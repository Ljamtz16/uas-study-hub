const CACHE="uas-study-hub-v0.1";
const ESSENTIAL=["/","/courses","/courses/fundamentals-uas","/study/fund-radio-links-intro","/settings","/manifest.webmanifest","/icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ESSENTIAL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match("/"))));});
