// BRUTE service worker — offline-first cache
const VERSION = 'brute-v5-2026-04-25-c';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png',
  './ios-frame.jsx',
  './brute/design-tokens.jsx',
  './brute/flash.jsx',
  './brute/exercise-art.jsx',
  './brute/i18n.jsx',
  './brute/primitives.jsx',
  './brute/program.jsx',
  './brute/state.jsx',
  './brute/ui.jsx',
  './brute/screens-core.jsx',
  './brute/screens-nav.jsx',
  './brute/screens-wellness.jsx',
  './brute/app.jsx',
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        cache.add(url).catch((err) => console.warn('sw: skip cache', url, err))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.includes('unpkg.com'))) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
