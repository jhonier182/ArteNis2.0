// Utilidades de formateo

// Formatear fecha
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(dateObj);
};

// Formatear fecha relativa (hace 2 horas, hace 3 días, etc.)
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace un momento';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
};

// Formatear número con separadores de miles
export const formatNumber = (num: number, locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

// Formatear número compacto (1K, 1M, 1B)
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  if (num < 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
};

// Formatear moneda
export const formatCurrency = (amount: number, currency: string = 'EUR', locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// Formatear porcentaje
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatear duración (tiempo)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Formatear texto (capitalizar primera letra)
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Formatear texto (capitalizar cada palabra)
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Formatear texto (camelCase)
export const toCamelCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

// Formatear texto (kebab-case)
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Formatear texto (snake_case)
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

// Formatear texto (PascalCase)
export const toPascalCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
    word.toUpperCase()
  ).replace(/\s+/g, '');
};

// Formatear texto (truncar)
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Formatear texto (resaltar búsqueda)
export const highlightSearch = (text: string, searchTerm: string, className: string = 'highlight'): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
};

// Formatear URL
export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Formatear teléfono
export const formatPhone = (phone: string, countryCode: string = '+34'): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${countryCode} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Formatear DNI/NIE
export const formatDNI = (dni: string): string => {
  const cleaned = dni.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 8)}-${cleaned.slice(8)}`;
  }
  
  return dni;
};

// Formatear IBAN
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length >= 4) {
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }
  
  return iban;
};

// Formatear tarjeta de crédito
export const formatCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (cleaned.length >= 4) {
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }
  
  return cardNumber;
};

// Formatear código postal
export const formatPostalCode = (postalCode: string): string => {
  const cleaned = postalCode.replace(/\D/g, '');
  
  if (cleaned.length === 5) {
    return cleaned;
  }
  
  return postalCode;
};

// Formatear matrícula de coche
export const formatLicensePlate = (plate: string): string => {
  const cleaned = plate.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  
  return plate;
};

// Formatear coordenadas
export const formatCoordinates = (lat: number, lng: number, decimals: number = 6): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

// Formatear dirección
export const formatAddress = (address: {
  street?: string;
  number?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}): string => {
  const parts = [
    address.street && address.number ? `${address.street}, ${address.number}` : address.street,
    address.postalCode && address.city ? `${address.postalCode} ${address.city}` : address.city,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Formatear nombre completo
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

// Formatear iniciales
export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// Formatear slug
export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Formatear tags
export const formatTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
};

// Formatear hashtags
export const formatHashtags = (text: string): string => {
  return text.replace(/#(\w+)/g, (match, tag) => {
    return `#${tag.toLowerCase()}`;
  });
};

// Formatear menciones
export const formatMentions = (text: string): string => {
  return text.replace(/@(\w+)/g, (match, username) => {
    return `@${username.toLowerCase()}`;
  });
};

// Formatear JSON para mostrar
export const formatJSON = (obj: any, indent: number = 2): string => {
  return JSON.stringify(obj, null, indent);
};

// Formatear error para mostrar
export const formatError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Error desconocido';
};

export default {
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatCompactNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatDuration,
  capitalize,
  capitalizeWords,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toPascalCase,
  truncateText,
  highlightSearch,
  formatUrl,
  formatPhone,
  formatDNI,
  formatIBAN,
  formatCreditCard,
  formatPostalCode,
  formatLicensePlate,
  formatCoordinates,
  formatAddress,
  formatFullName,
  formatInitials,
  formatSlug,
  formatTags,
  formatHashtags,
  formatMentions,
  formatJSON,
  formatError
};
