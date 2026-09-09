const CACHE="uas-study-hub-v0.3.1";
const ESSENTIAL=["/","/courses","/courses/fundamentals-uas","/knowledge-map","/study/fund-radio-links-intro","/settings","/manifest.webmanifest","/icon.svg","/study/fund-uas-types","/study/fund-radio-spectrum-bands","/study/fund-ground-control-stations","/study/fund-radio-receivers","/study/fund-radio-commercial-selection","/study/fund-antennas","/study/fund-video-telemetry-links","/study/fund-radio-link-safety","/study/fund-autopilot-architecture","/study/fund-autopilot-configuration","/study/fund-propulsion-system","/study/fund-battery-management","/study/fund-endurance-payload","/study/fund-endurance-environment","/study/fund-rgb-cameras","/study/fund-thermal-cameras","/study/fund-dual-cameras","/study/fund-camera-gimbal","/study/fund-camera-ip-protection"];
async function precache(){
  const cache=await caches.open(CACHE);
  await cache.addAll(ESSENTIAL);
  const assets=new Set();
  for(const route of ESSENTIAL){const response=await cache.match(route);if(!response?.headers.get("content-type")?.includes("text/html"))continue;const html=await response.text();for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const url=new URL(match[1].replaceAll("&amp;","&"),self.location.origin);if(url.origin===self.location.origin&&url.pathname.startsWith("/_next/static/"))assets.add(url.href);}}
  await cache.addAll([...assets]);
}
self.addEventListener("install",event=>{event.waitUntil(precache().then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("uas-study-hub-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}catch{return new Response("Sin conexión: recurso no disponible en caché",{status:503});}})());
});
