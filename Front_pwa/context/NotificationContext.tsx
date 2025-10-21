import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    postId?: string;
    userId?: string;
    commentId?: string;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Props del provider
interface NotificationProviderProps {
  children: ReactNode;
}

// Provider del contexto de notificaciones
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Cargar notificaciones guardadas al inicializar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      }
    }

    // Verificar permisos de notificación
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev]);

    // Mostrar notificación del navegador si está permitido
    if (permission === 'granted') {
      showBrowserNotification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        tag: notification.id,
        data: notification.data
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    }

    setPermission(Notification.permission);
    return Notification.permission;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      showBrowserNotification(title, options);
    }
  };

  const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icon-192x192.svg',
          badge: '/icon-192x192.svg',
          ...options
        });
      });
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermission,
    showNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
