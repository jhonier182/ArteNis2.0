import React from 'react'
import { calculatePasswordStrength } from '@/utils/passwordUtils'

interface PasswordStrengthBarProps {
  password: string
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { strength, percentage, feedback } = calculatePasswordStrength(password)

  if (!password) return null

  const colorClasses = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-purple-500',
    'very-strong': 'bg-green-500',
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{feedback}</span>
        <span className="text-xs text-gray-400">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${colorClasses[strength]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

