export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateFirstName(firstName: string, realTime: boolean = false): string | null {
  const trimmed = firstName.trim()
  
  if (!trimmed) {
    return realTime ? 'Requerido' : 'El nombre es requerido'
  }
  
  if (realTime && trimmed.length > 0) {
    const nameRegex = /^[a-zA-Z'-]*$/
    if (!nameRegex.test(trimmed)) {
      return 'Solo letras, sin espacios, guiones y tildes'
    }
    if (trimmed.length > 100) {
      return 'Máximo 100 caracteres'
    }
    return null
  }
  
  if (trimmed.length < 2) {
    return 'Mínimo 2 caracteres'
  }
  if (trimmed.length > 100) {
    return 'Máximo 100 caracteres'
  }
  const nameRegex = /^[a-zA-Z'-]+$/
  if (!nameRegex.test(trimmed)) {
    return 'Solo letras, sin espacios, guiones y tildes'
  }
  return null
}

export function validateLastName(lastName: string, realTime: boolean = false): string | null {
  const trimmed = lastName.trim()
  
  if (!trimmed) {
    return realTime ? 'Requerido' : 'El apellido es requerido'
  }
  
  if (realTime && trimmed.length > 0) {
    const nameRegex = /^[a-zA-Z'-]*$/
    if (!nameRegex.test(trimmed)) {
      return 'Solo letras, sin espacios, guiones y tildes'
    }
    if (trimmed.length > 100) {
      return 'Máximo 100 caracteres'
    }
    return null
  }
  
  if (trimmed.length < 2) {
    return 'Mínimo 2 caracteres'
  }
  if (trimmed.length > 100) {
    return 'Máximo 100 caracteres'
  }
  const nameRegex = /^[a-zA-Z'-]+$/
  if (!nameRegex.test(trimmed)) {
    return 'Solo letras, sin espacios, guiones y tildes'
  }
  return null
}

export function validateFullName(fullName: string, realTime: boolean = false): string | null {
  const trimmed = fullName.trim()
  
  if (!trimmed) {
    return realTime ? 'Requerido' : 'El nombre completo es requerido'
  }
  
  if (realTime && trimmed.length > 0) {
    const nameRegex = /^[a-zA-Z\s'-]*$/
    if (!nameRegex.test(trimmed)) {
      return 'Solo letras, espacios, guiones y apóstrofes'
    }
    if (trimmed.length > 255) {
      return 'Máximo 255 caracteres'
    }
    const words = trimmed.split(' ').filter(word => word.length > 0)
    if (words.length === 1 && trimmed.length > 5) {
      return 'Mínimo 2 palabras'
    }
    return null
  }
  
  if (trimmed.split(' ').filter(word => word.length > 0).length < 2) {
    return 'Mínimo 2 palabras'
  }
  if (trimmed.length < 2) {
    return 'Mínimo 2 caracteres'
  }
  if (trimmed.length > 255) {
    return 'Máximo 255 caracteres'
  }
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(trimmed)) {
    return 'Solo letras, espacios, guiones y apóstrofes'
  }
  return null
}

export function validateEmail(email: string, realTime: boolean = false): string | null {
  const trimmed = email.trim()
  
  if (!trimmed) {
    return realTime ? 'Requerido' : 'El email es requerido'
  }
  
  if (realTime && trimmed.length > 0) {
    if (trimmed.includes(' ')) {
      return 'Sin espacios'
    }
    if (trimmed.includes('@') && !isValidEmail(trimmed)) {
      return 'Email inválido'
    }
    return null
  }
  
  if (!isValidEmail(trimmed)) {
    return 'Email inválido'
  }
  return null
}

export function validatePassword(password: string, realTime: boolean = false): string | null {
  if (!password) {
    return realTime ? 'Requerida' : 'La contraseña es requerida'
  }
  
  if (realTime && password.length > 0 && password.length < 8) {
    return `Mínimo 8 caracteres (${password.length}/8)`
  }
  
  if (password.length < 8) {
    return 'Mínimo 8 caracteres'
  }
  return null
}

export function validateConfirmPassword(password: string, confirmPassword: string, realTime: boolean = false): string | null {
  if (!confirmPassword) {
    return realTime ? null : 'Requerida'
  }
  if (password !== confirmPassword) {
    return 'No coinciden'
  }
  return null
}

export function validateLoginIdentifier(identifier: string): string | null {
  if (!identifier.trim()) {
    return 'Requerido'
  }
  return null
}

export function validateLoginPassword(password: string): string | null {
  if (!password) {
    return 'Requerida'
  }
  return null
}

