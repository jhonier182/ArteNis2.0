import { useState, useEffect } from 'react'

export function useIntroScreen() {
  const [showIntro, setShowIntro] = useState(true)
  const [hasSeenIntro, setHasSeenIntro] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya ha visto la introducción en esta sesión
    const seenIntro = sessionStorage.getItem('hasSeenIntro')
    if (seenIntro === 'true') {
      setShowIntro(false)
      setHasSeenIntro(true)
    }
  }, [])

  const completeIntro = () => {
    setShowIntro(false)
    setHasSeenIntro(true)
    // Marcar que ya vio la introducción en esta sesión
    sessionStorage.setItem('hasSeenIntro', 'true')
  }

  const resetIntro = () => {
    setShowIntro(true)
    setHasSeenIntro(false)
    sessionStorage.removeItem('hasSeenIntro')
  }

  return {
    showIntro,
    hasSeenIntro,
    completeIntro,
    resetIntro
  }
}
