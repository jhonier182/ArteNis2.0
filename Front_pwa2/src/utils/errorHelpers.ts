import { AxiosError } from 'axios'

interface BackendValidationError {
  field: string
  message: string
  value?: unknown
}

interface BackendErrorResponse {
  success?: boolean
  message?: string
  error?: string
  errors?: BackendValidationError[]
}

const fieldNameMap: Record<string, string> = {
  fullName: 'firstName',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  confirmPassword: 'confirmPassword',
  identifier: 'identifier',
  username: 'identifier'
}

export function extractValidationErrors<T extends Record<string, string | undefined>>(
  error: unknown
): Partial<T> {
  const fieldErrors: Partial<T> = {}

  if (error instanceof AxiosError) {
    const response = error.response?.data as BackendErrorResponse | undefined

    if (response?.errors && Array.isArray(response.errors)) {
      response.errors.forEach((err: BackendValidationError) => {
        const frontendFieldName = fieldNameMap[err.field] || err.field
        if (frontendFieldName) {
          fieldErrors[frontendFieldName as keyof T] = err.message as T[keyof T]
        }
      })
    }
  }

  return fieldErrors
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as BackendErrorResponse | undefined
    
    if (response?.message) {
      return response.message
    }
    
    if (response?.errors && Array.isArray(response.errors) && response.errors.length > 0) {
      if (response.errors.length === 1) {
        return response.errors[0].message
      }
      return 'Errores de validación'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ha ocurrido un error'
}

