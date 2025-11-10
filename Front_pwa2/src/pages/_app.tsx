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
    // Deshabilitar scroll restoration automático de Next.js
    // Usaremos nuestra propia lógica de restauración
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Service Worker registrado
        })
        .catch(() => {
          // Error al registrar Service Worker
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
      return
      ;(window as WindowWithDeferredPrompt).deferredPrompt = null
    })

    // Bloquear zoom por gestos táctiles (pinch zoom)
    // Si hay más de un dedo, prevenir el zoom
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    }

    // Bloquear zoom por gestos táctiles con scale (para navegadores que lo soporten)
    const handleTouchMoveScale = (event: TouchEvent) => {
      const touchEvent = event as TouchEvent & { scale?: number }
      if (touchEvent.scale !== undefined && touchEvent.scale !== 1) {
        event.preventDefault()
      }
    }

    // Bloquear doble-tap zoom
    let lastTouchEnd = 0
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }

    // Agregar event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchmove', handleTouchMoveScale, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Cleanup
    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchmove', handleTouchMoveScale)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

