// Utilidades para almacenamiento persistente en PWA móviles

export interface UserData {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

export interface AuthData {
  token: string;
  refreshToken?: string;
  user: UserData;
}

// Función para guardar datos de autenticación en múltiples métodos
export const saveAuthData = async (authData: AuthData): Promise<void> => {
  const { token, refreshToken, user } = authData;
  
  try {
    // Limpiar datos anteriores primero
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('refreshToken');
    }
    
    // Método 1: localStorage (navegadores web)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('userProfile', JSON.stringify(user));
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    
    // Método 2: sessionStorage (persistente durante sesión)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userProfile', JSON.stringify(user));
      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }
    }
    
    // Método 3: IndexedDB (más persistente en PWA)
    try {
      const request = indexedDB.open('InkEndinDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData');
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['userData'], 'readwrite');
          const store = transaction.objectStore('userData');
          
          store.put(token, 'token');
          store.put(JSON.stringify(user), 'userProfile');
          if (refreshToken) {
            store.put(refreshToken, 'refreshToken');
          }
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        request.onerror = () => reject(request.error);
      });
      
      console.log('Datos de autenticación guardados en IndexedDB');
    } catch (error) {
      console.log('Error guardando en IndexedDB:', error);
    }
    
    console.log('Datos de autenticación guardados en todos los métodos disponibles');
  } catch (error) {
    console.error('Error guardando datos de autenticación:', error);
    throw error;
  }
};

// Función para limpiar datos de autenticación de todos los métodos
export const clearAuthData = async (): Promise<void> => {
  try {
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('refreshToken');
    }
    
    // Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('refreshToken');
    }
    
    // Limpiar IndexedDB
    try {
      const request = indexedDB.open('InkEndinDB', 1);
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['userData'], 'readwrite');
          const store = transaction.objectStore('userData');
          
          store.delete('token');
          store.delete('userProfile');
          store.delete('refreshToken');
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        request.onerror = () => reject(request.error);
      });
      
      console.log('Datos de autenticación eliminados de IndexedDB');
    } catch (error) {
      console.log('Error eliminando de IndexedDB:', error);
    }
    
    console.log('Datos de autenticación eliminados de todos los métodos');
  } catch (error) {
    console.error('Error eliminando datos de autenticación:', error);
    throw error;
  }
};

// Función para forzar limpieza completa de datos de autenticación
export const forceClearAllAuthData = async (): Promise<void> => {
  try {
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('recentSearches');
    }
    
    // Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    
    // Limpiar IndexedDB completamente
    try {
      if ('indexedDB' in window) {
        const deleteReq = indexedDB.deleteDatabase('InkEndinDB');
        await new Promise<void>((resolve, reject) => {
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => reject(deleteReq.error);
        });
      }
    } catch (error) {
      console.log('Error eliminando IndexedDB:', error);
    }
    
    // Limpiar caché del navegador si es posible
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.log('Error limpiando caché:', error);
      }
    }
    
    console.log('Limpieza completa de datos de autenticación realizada');
  } catch (error) {
    console.error('Error en limpieza completa:', error);
    throw error;
  }
};

// Función para verificar si el usuario está logueado usando múltiples métodos
export const checkUserLoggedIn = async (): Promise<boolean> => {
  try {
    // Método 1: localStorage
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Método 2: sessionStorage
    const sessionUserData = typeof window !== 'undefined' ? sessionStorage.getItem('userProfile') : null;
    const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    
    // Método 3: IndexedDB
    let indexedDBUser = null;
    let indexedDBToken = null;
    
    try {
      const request = indexedDB.open('InkEndinDB', 1);
      
      // Primero crear el object store si no existe
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData');
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          
          // Verificar si el object store existe antes de hacer la transacción
          if (!db.objectStoreNames.contains('userData')) {
            console.log('Object store no existe, saltando IndexedDB');
            resolve();
            return;
          }
          
          const transaction = db.transaction(['userData'], 'readonly');
          const store = transaction.objectStore('userData');
          
          const userRequest = store.get('userProfile');
          const tokenRequest = store.get('token');
          
          userRequest.onsuccess = () => {
            indexedDBUser = userRequest.result;
          };
          tokenRequest.onsuccess = () => {
            indexedDBToken = tokenRequest.result;
          };
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.log('IndexedDB no disponible:', error);
    }
    
    console.log('Verificando usuario logueado:', { 
      localStorage: { userProfile: !!userData, token: !!token },
      sessionStorage: { userProfile: !!sessionUserData, token: !!sessionToken },
      indexedDB: { userProfile: !!indexedDBUser, token: !!indexedDBToken }
    });
    
    // Verificar cualquiera de los métodos que tenga datos válidos
    const validUserData = userData || sessionUserData || indexedDBUser;
    const validToken = token || sessionToken || indexedDBToken;
    
    if (validUserData && validToken) {
      try {
        const parsedUser = typeof validUserData === 'string' ? JSON.parse(validUserData) : validUserData;
        if (parsedUser && validToken !== 'null' && validToken !== 'undefined') {
          console.log('Usuario logueado detectado');
          return true;
        }
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
    
    return false;
  } catch (error) {
    console.log('Error checking user login:', error);
    return false;
  }
};
