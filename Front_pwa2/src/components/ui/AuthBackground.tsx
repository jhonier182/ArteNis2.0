import React, { ReactNode } from 'react'

interface AuthBackgroundProps {
  children: ReactNode
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/10 to-black">
        {/* Patrón o imagen de fondo opcional */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/tattoo-pattern.svg')] bg-repeat bg-center" />
        </div>
      </div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

