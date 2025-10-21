import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes/AppRouter';
import LoadingIndicator from './components/ui/LoadingIndicator';
import { register } from './pwa/registerServiceWorker';

// Componente principal de la aplicación
const App: React.FC = () => {
  // Registrar Service Worker en producción
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      register();
    }
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={<LoadingIndicator />}>
              <AppRouter />
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
