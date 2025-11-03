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

        })
        .catch((error) => {return})
    }

    // Detectar si la app está instalada
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      // Guardar el evento para mostrarlo después
      ;(window as WindowWithDeferredPrompt).deferredPrompt = e as BeforeInstallPromptEvent
    })

    // Detectar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      return
      ;(window as WindowWithDeferredPrompt).deferredPrompt = null
    })
  }, [])

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

