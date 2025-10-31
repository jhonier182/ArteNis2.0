// Utilidades de validación

// Validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar username
export const isValidUsername = (username: string): boolean => {
  const minLength = 3;
  const maxLength = 20;
  const pattern = /^[a-zA-Z0-9_]+$/;
  return username.length >= minLength && 
         username.length <= maxLength && 
         pattern.test(username);
};

// Validar contraseña
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const minLength = 8;
  const maxLength = 128;
  const requireUppercase = true;
  const requireLowercase = true;
  const requireNumber = true;
  const requireSpecial = true;
  
  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
  }

  if (password.length > maxLength) {
    errors.push(`La contraseña no puede tener más de ${maxLength} caracteres`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar título de post
export const isValidPostTitle = (title: string): boolean => {
  const titleMaxLength = 200;
  return title.trim().length > 0 && title.length <= titleMaxLength;
};

// Validar descripción de post
export const isValidPostDescription = (description: string): boolean => {
  const descriptionMaxLength = 2000;
  return description.length <= descriptionMaxLength;
};

// Validar tags
export const isValidTags = (tags: string[]): { isValid: boolean; errors: string[] } => {
  const maxTags = 10;
  const tagMaxLength = 30;
  const errors: string[] = [];

  if (tags.length > maxTags) {
    errors.push(`No puedes usar más de ${maxTags} tags`);
  }

  tags.forEach(tag => {
    if (tag.length > tagMaxLength) {
      errors.push(`El tag "${tag}" es demasiado largo`);
    }
    if (tag.trim().length === 0) {
      errors.push('Los tags no pueden estar vacíos');
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar archivo de imagen
export const isValidImageFile = (file: File): { isValid: boolean; errors: string[] } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const errors: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF');
  }

  if (file.size > maxSize) {
    errors.push(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validar teléfono
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validar fecha
export const isValidDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

// Validar edad mínima
export const isValidAge = (birthDate: string | Date, minAge: number = 13): boolean => {
  const dateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

// Sanitizar string
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

// Sanitizar HTML
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Validar objeto requerido
export const validateRequired = (obj: Record<string, any>, requiredFields: string[]): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Validar longitud de string
export const validateLength = (str: string, min: number, max: number): boolean => {
  return str.length >= min && str.length <= max;
};

// Validar patrón regex
export const validatePattern = (str: string, pattern: RegExp): boolean => {
  return pattern.test(str);
};

// Validar número
export const isValidNumber = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Validar entero
export const isValidInteger = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (!Number.isInteger(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Validar color hexadecimal
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Validar UUID
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Validar slug
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Validar JSON
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Validar array
export const isValidArray = (arr: any, minLength?: number, maxLength?: number): boolean => {
  if (!Array.isArray(arr)) return false;
  if (minLength !== undefined && arr.length < minLength) return false;
  if (maxLength !== undefined && arr.length > maxLength) return false;
  return true;
};

// Validar objeto
export const isValidObject = (obj: any): boolean => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
};

// Validar función
export const isValidFunction = (fn: any): boolean => {
  return typeof fn === 'function';
};

// Validar promesa
export const isValidPromise = (promise: any): boolean => {
  return promise && typeof promise.then === 'function';
};

// Validar email con dominio específico
export const isValidEmailDomain = (email: string, allowedDomains: string[]): boolean => {
  if (!isValidEmail(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  return allowedDomains.some(allowedDomain => 
    domain === allowedDomain.toLowerCase() || domain.endsWith('.' + allowedDomain.toLowerCase())
  );
};

// Validar contraseña fuerte
export const isStrongPassword = (password: string): boolean => {
  const { isValid } = isValidPassword(password);
  if (!isValid) return false;
  
  // Verificar que no sea una contraseña común
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  return !commonPasswords.includes(password.toLowerCase());
};

// Validar formato de archivo
export const isValidFileFormat = (file: File, allowedFormats: string[]): boolean => {
  return allowedFormats.includes(file.type);
};

// Validar tamaño de archivo
export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

// Validar dimensiones de imagen
export const isValidImageDimensions = (file: File, maxWidth: number, maxHeight: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
};

export default {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isValidPostTitle,
  isValidPostDescription,
  isValidTags,
  isValidImageFile,
  isValidUrl,
  isValidPhone,
  isValidDate,
  isValidAge,
  sanitizeString,
  sanitizeHtml,
  validateRequired,
  validateLength,
  validatePattern,
  isValidNumber,
  isValidInteger,
  isValidHexColor,
  isValidUUID,
  isValidSlug,
  isValidJSON,
  isValidArray,
  isValidObject,
  isValidFunction,
  isValidPromise,
  isValidEmailDomain,
  isStrongPassword,
  isValidFileFormat,
  isValidFileSize,
  isValidImageDimensions
};
