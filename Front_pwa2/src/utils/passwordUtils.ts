/**
 * Utilidades para validación y cálculo de fuerza de contraseña
 */

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export interface PasswordStrengthResult {
  strength: PasswordStrength
  percentage: number
  feedback: string
}

/**
 * Calcula la fuerza de una contraseña
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 'weak',
      percentage: 0,
      feedback: '',
    }
  }

  let score = 0
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    longEnough: password.length >= 12,
  }

  // Puntuación básica
  if (checks.length) score += 1
  if (checks.hasUpper) score += 1
  if (checks.hasLower) score += 1
  if (checks.hasNumber) score += 1
  if (checks.hasSpecial) score += 1
  if (checks.longEnough) score += 1

  // Bonus por longitud
  if (password.length >= 16) score += 1

  let strength: PasswordStrength
  let percentage: number
  let feedback: string

  if (score <= 2) {
    strength = 'weak'
    percentage = 25
    feedback = 'Contraseña débil'
  } else if (score === 3) {
    strength = 'medium'
    percentage = 50
    feedback = 'Contraseña media'
  } else if (score <= 5) {
    strength = 'strong'
    percentage = 75
    feedback = 'Contraseña fuerte'
  } else {
    strength = 'very-strong'
    percentage = 100
    feedback = 'Contraseña muy fuerte'
  }

  return {
    strength,
    percentage,
    feedback,
  }
}

