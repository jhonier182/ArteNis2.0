import { ReactNode } from 'react'
import { Providers } from './providers'
import '@/styles/globals.css'

interface RootLayoutProps {
  children: ReactNode
}

export const metadata = {
  title: 'ArteNis - Pinterest para tatuadores',
  description: 'Plataforma moderna para compartir y descubrir arte de tatuajes',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

