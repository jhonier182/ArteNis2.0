import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { Providers } from '@/app/providers'
import '@/styles/globals.css'

interface WindowWithDeferredPrompt extends Window {
  deferredPrompt?: BeforeInstallPromptEvent | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function App({ Component, pageProps }: AppProps) {
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
      ;(window as WindowWithDeferredPrompt).deferredPrompt = e as BeforeInstallPromptEvent
    })

    // Detectar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente')
      ;(window as WindowWithDeferredPrompt).deferredPrompt = null
    })
  }, [])

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

