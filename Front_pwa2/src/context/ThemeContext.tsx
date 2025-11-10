'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { storage } from '@/utils/storage'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Aplicar tema oscuro por defecto inmediatamente
    document.documentElement.classList.add('dark')
    
    // Cargar tema guardado (si existe)
    const savedTheme = storage.get<Theme>('theme')
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Si no hay tema guardado, usar dark por defecto
      setThemeState('dark')
      applyTheme('dark')
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const applyTheme = (selectedTheme: Theme): void => {
    const root = document.documentElement
    const body = document.body
    let resolved: 'light' | 'dark'

    if (selectedTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = selectedTheme
    }

    setResolvedTheme(resolved)

    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      body.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      body.classList.add('light')
    }
  }

  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme)
    storage.set('theme', newTheme)
  }

  const toggleTheme = (): void => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider')
  }
  return context
}

