type FieldErrors = Record<string, string | undefined>

export function clearFieldError<T extends FieldErrors>(
  fieldErrors: T,
  fieldName: keyof T
): T {
  const newErrors = { ...fieldErrors }
  delete newErrors[fieldName]
  return newErrors as T
}

