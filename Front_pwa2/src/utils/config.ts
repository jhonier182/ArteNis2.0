/**
 * Configuración centralizada de la aplicación
 */
const getApiBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

export const config = {
  api: {
    baseURL: getApiBaseURL(),
    timeout: 30000,
  },
  app: {
    name: 'Inkedin',
    description: 'Pinterest para tatuadores',
    version: '2.0.0',
  },
  features: {
    pwa: {
      enabled:
        typeof process !== 'undefined' ? process.env.NODE_ENV === 'production' : false,
    },
    ai: {
      enabled:
        typeof process !== 'undefined'
          ? process.env.NEXT_PUBLIC_AI_ENABLED === 'true'
          : false,
    },
  },
} as const

