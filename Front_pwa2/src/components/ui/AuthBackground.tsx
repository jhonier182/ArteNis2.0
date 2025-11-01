import React, { ReactNode } from 'react'

interface AuthBackgroundProps {
  children: ReactNode
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen relative bg-gray-900 overflow-hidden">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {/* Patrón o imagen de fondo opcional */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/tattoo-pattern.svg')] bg-repeat bg-center" />
        </div>
      </div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

