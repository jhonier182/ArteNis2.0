import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1 text-white">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-black/50 border ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-800 focus:ring-purple-500'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

