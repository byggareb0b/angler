const V = 'cdb-v1';
const PRE = ["./", "engine.js", "leaflet.js", "manifest.webmanifest", "lures/p-boilie.webp", "lures/p-crank.webp", "lures/p-dropshot.webp", "lures/p-jerk.webp", "lures/p-jig.webp", "lures/p-lipless.webp", "lures/p-ned.webp", "lures/p-particles.webp", "lures/p-popup.webp", "lures/p-spinner.webp", "lures/p-surface.webp", "lures/p-swim.webp", "lures/p-texas.webp", "lures/p-tiger.webp", "lures/p-topwater.webp", "lures/t-boilie.webp", "lures/t-crank.webp", "lures/t-dropshot.webp", "lures/t-jerk.webp", "lures/t-jig.webp", "lures/t-lipless.webp", "lures/t-ned.webp", "lures/t-particles.webp", "lures/t-popup.webp", "lures/t-spinner.webp", "lures/t-surface.webp", "lures/t-swim.webp", "lures/t-texas.webp", "lures/t-tiger.webp", "lures/t-topwater.webp", "plates/barbel.webp", "plates/bass.webp", "plates/boga.webp", "plates/carp.webp", "plates/crayfish.jpg", "plates/h-barbel.jpg", "plates/h-bass.jpg", "plates/h-carp.jpg", "plates/h-pike.jpg", "plates/h-shad.jpg", "plates/mirror.webp", "plates/pike.webp", "plates/shad.webp", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname === 'api.open-meteo.com') return; // weather always live
  if (u.origin === location.origin && (e.request.mode === 'navigate' || u.pathname.endsWith('.html'))) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('./', c)); return r; }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok && (u.origin === location.origin || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com'))) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; })));
});
