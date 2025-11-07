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
        
        // Cachear URLs individualmente para que los errores no detengan todo el proceso
        return Promise.allSettled(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              return
              // Continuar aunque falle una URL
              return null;
            });
          })
        );
      })
      .then(() => {
        return
      })
      .catch((error) => {
        return
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

// Estrategia de caché: Cache First para imágenes y recursos estáticos, Network First para el resto
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear peticiones de API
  if (event.request.url.includes('/api/')) {
    return;
  }

  const url = new URL(event.request.url);
  const isImageRequest = url.pathname.includes('/_next/image') ||
                         event.request.destination === 'image' ||
                         url.searchParams.has('url'); // Next.js image optimization

  const isStaticAsset = url.pathname.startsWith('/_next/static/') ||
                        url.pathname.startsWith('/static/') ||
                        url.pathname.endsWith('.js') ||
                        url.pathname.endsWith('.css') ||
                        url.pathname.endsWith('.png') ||
                        url.pathname.endsWith('.jpg') ||
                        url.pathname.endsWith('.jpeg') ||
                        url.pathname.endsWith('.svg') ||
                        url.pathname.endsWith('.webp') ||
                        url.pathname.endsWith('.avif');

  // Para imágenes y recursos estáticos: Cache First (más agresivo)
  if (isImageRequest || isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Si está en caché, devolverlo inmediatamente sin ir a la red
            return cachedResponse;
          }
          
          // Si no está en caché, ir a la red y guardar
          return fetch(event.request)
            .then((response) => {
              // Solo cachear respuestas exitosas
              if (response && response.status === 200 && response.type !== 'error') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Si falla la red y no hay caché, devolver null
              return null;
            });
        })
    );
    return;
  }

  // Para otros recursos (HTML, etc.): Network First (menos agresivo)
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
