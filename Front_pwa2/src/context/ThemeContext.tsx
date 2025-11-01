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
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = storage.get<Theme>('theme') || 'system'
    setThemeState(savedTheme)
    applyTheme(savedTheme)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const applyTheme = (selectedTheme: Theme): void => {
    const root = document.documentElement
    let resolved: 'light' | 'dark'

    if (selectedTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      resolved = selectedTheme
    }

    setResolvedTheme(resolved)

    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
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

