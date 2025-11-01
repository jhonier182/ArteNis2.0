import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { Providers } from '@/app/providers'
import '@/styles/globals.css'

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
      ;(window as any).deferredPrompt = e
    })

    // Detectar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente')
      ;(window as any).deferredPrompt = null
    })
  }, [])

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

