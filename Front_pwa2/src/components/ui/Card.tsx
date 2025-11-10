import React, { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div className={`card ${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </div>
  )
}

