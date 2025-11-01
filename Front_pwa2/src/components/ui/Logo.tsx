import React from 'react'
import { Sparkles } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeStyles[size]} rounded-full gradient-brand flex items-center justify-center shadow-lg`}
      >
        <Sparkles className="text-white w-1/2 h-1/2" strokeWidth={2.5} />
      </div>
      {showText && (
        <h1 className={`font-display font-bold ${textSizes[size]} text-gradient-brand`}>
          Inkedin
        </h1>
      )}
    </div>
  )
}

