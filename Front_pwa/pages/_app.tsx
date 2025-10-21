import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { AuthProvider } from '../context/AuthContext'
import { UserProvider } from '../context/UserContext'
import { ThemeProvider } from '../context/ThemeContext'
import { NotificationProvider } from '../context/NotificationContext'
import { useIntroScreen } from '../hooks/useIntroScreen'
import IntroScreen from '../components/IntroScreen'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const { showIntro, completeIntro } = useIntroScreen()

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado con éxito:', registration.scope)
        })
        .catch((error) => {
          console.log('Error al registrar Service Worker:', error)
        })
    }

    // Detectar si la app está instalada
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      // Guardar el evento para mostrarlo después
      ;(window as any).deferredPrompt = e
    })

    // Detectar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente')
      ;(window as any).deferredPrompt = null
    })
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            {/* Mostrar pantalla de introducción si es necesario */}
            {showIntro ? (
              <IntroScreen onComplete={completeIntro} />
            ) : (
              <Component {...pageProps} />
            )}
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
