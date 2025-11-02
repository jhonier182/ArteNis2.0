const CACHE_NAME = 'inkedin-pwa-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        // Cachear URLs individualmente para que los errores no detengan todo el proceso
        return Promise.allSettled(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              console.warn(`No se pudo cachear ${url}:`, error);
              // Continuar aunque falle una URL
              return null;
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker instalado');
      })
      .catch((error) => {
        console.error('Error instalando Service Worker:', error);
      })
  );
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de caché: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear peticiones de API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si es una navegación y no hay cache, intentar servir la página principal
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // Para otros recursos, devolver null para que el navegador muestre su error nativo
            return null;
          });
      })
  );
});
