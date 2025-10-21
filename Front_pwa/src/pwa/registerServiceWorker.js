// Registro del Service Worker para ArteNis 2.0 PWA
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

// Configuración del Service Worker
const config = {
  onSuccess: (registration) => {
    console.log('✅ Service Worker registrado exitosamente:', registration);
    
    // Notificar al usuario sobre la instalación exitosa
    if ('serviceWorker' in navigator) {
      // Verificar si es la primera instalación
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              showUpdateAvailable();
            }
          });
        }
      });
    }
  },
  
  onUpdate: (registration) => {
    console.log('🔄 Nueva versión del Service Worker disponible');
    showUpdateAvailable();
  },
  
  onOfflineReady: () => {
    console.log('📱 App lista para funcionar offline');
    showOfflineReady();
  }
};

// Registrar el Service Worker
export function register() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // En localhost, verificar si el SW existe
        checkValidServiceWorker(swUrl, config);
        
        // Agregar logging adicional para localhost
        navigator.serviceWorker.ready.then(() => {
          console.log('🔧 Modo desarrollo: Service Worker registrado');
        });
      } else {
        // En producción, registrar directamente
        registerValidSW(swUrl, config);
      }
    });
  }
}

// Registrar Service Worker válido
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('🔄 Nueva versión disponible');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // App lista para funcionar offline
              console.log('📱 App lista para funcionar offline');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Error registrando Service Worker:', error);
    });
}

// Verificar Service Worker válido (para localhost)
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No se encontró el SW, recargar la página
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // SW encontrado, registrar normalmente
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('🔧 No hay conexión a internet. App funcionando en modo offline.');
    });
}

// Desregistrar Service Worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('❌ Error desregistrando Service Worker:', error);
      });
  }
}

// Mostrar notificación de actualización disponible
function showUpdateAvailable() {
  if ('serviceWorker' in navigator) {
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }
}

// Mostrar notificación de app lista offline
function showOfflineReady() {
  if ('serviceWorker' in navigator) {
    const event = new CustomEvent('sw-offline-ready');
    window.dispatchEvent(event);
  }
}

// Hook para manejar actualizaciones del Service Worker
export function useServiceWorker() {
  const [swUpdateAvailable, setSwUpdateAvailable] = React.useState(false);
  const [swOfflineReady, setSwOfflineReady] = React.useState(false);

  React.useEffect(() => {
    const handleUpdateAvailable = () => {
      setSwUpdateAvailable(true);
    };

    const handleOfflineReady = () => {
      setSwOfflineReady(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-offline-ready', handleOfflineReady);
    };
  }, []);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    swUpdateAvailable,
    swOfflineReady,
    updateServiceWorker
  };
}

// Función para limpiar caches (útil para desarrollo)
export function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    });
  }
}

// Función para obtener versión del cache
export function getServiceWorkerVersion() {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.version);
          };
          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          );
        } else {
          resolve('unknown');
        }
      });
    } else {
      resolve('not-supported');
    }
  });
}
