import React, { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1 text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`input bg-black/50 border-neutral-800 text-white placeholder-gray-500 ${
              error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

